import { Context, Octokit } from "probot";
import { WebhookPayloadPullRequest } from "@octokit/webhooks";
import comment, { rebuildLabel } from "./comment";
import { setStatus } from "./status";
import { buildService, waitForBuildStatus } from "../cicd/build";
import { BuildStatus } from "../cicd/util";
import removeLabel from "../labels/removeLabel";
import { mergeFromPullRequest } from "./merge";
import removeDependabotConfig from "./removeDependabotConfig";

const statusName = "Jenkins/BE-Build&Test";
const PRBase = "develop";

export default async (
  context: Context<WebhookPayloadPullRequest>,
): Promise<void> => {
  context.log.info("Received a Security PR");
  // Check if the PR base is the correct branch
  if (context.payload.pull_request.base.ref !== PRBase) {
    context.log.info(`Security PR not pulling into ${PRBase}`);
    // Set the PR base to the correct branch.
    const updateParams: Octokit.PullsUpdateParams = {
      owner: context.payload.repository.owner.login,
      pull_number: context.payload.pull_request.number,
      repo: context.payload.repository.name,
      base: PRBase,
    };
    await context.github.pulls.update(updateParams);
    return;
  }

  // Let's try to delete the the old dependabot config, if it exists.
  await removeDependabotConfig(context);

  await setStatus(context, "pending", statusName);
  let buildNumber: number | undefined;

  try {
    buildNumber = await buildService(
      context,
      context.payload.repository.name,
      context.payload.pull_request.head.ref,
    );
  } catch (e) {
    context.log.error(e);
    await setStatus(context, "error", statusName, "Failed to start build!");
    return;
  } finally {
    for (const item of context.payload.pull_request.labels) {
      if (item.name === rebuildLabel) {
        context.log.info("Removing rebuild label");
        await removeLabel(context, rebuildLabel);
      }
    }
  }

  const buildStatus = await waitForBuildStatus(
    context,
    buildNumber,
    statusName,
  );

  context.log.info(`Build: ${BuildStatus[buildStatus]}`);
  if ([BuildStatus.PASS, BuildStatus.UNSTABLE].includes(buildStatus)) {
    const pr_req: Octokit.PullsGetParams = {
      pull_number: context.payload.pull_request.number,
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
    };
    let pr = await context.github.pulls.get(pr_req);
    while (pr.data.mergeable === null) {
      await new Promise((r) => setTimeout(r, 5000));
      pr = await context.github.pulls.get(pr_req);
    }
    if (pr.data.mergeable) {
      await mergeFromPullRequest(context);
    } else {
      await comment(context, "@dependabot rebase");
    }
  }
};
