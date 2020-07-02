import { Context } from "probot";
import { WebhookPayloadPullRequest } from "@octokit/webhooks";
import securityPr from "./securityPr";
import removeDependabotConfig from "./removeDependabotConfig";

export default async (
  context: Context<WebhookPayloadPullRequest>,
): Promise<void> => {
  context.log.info("Received a PR");
  if (!context.payload.repository.name.startsWith("cvs-")) {
    context.log.info(`Repo: ${context.payload.repository.name} not a CVS repo`);
    return;
  }
  // Enable GitHub's automated fixes
  await context.github.repos.enableAutomatedSecurityFixes({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
  });
  if (context.payload.pull_request.user.login === "dependabot[bot]") {
    context.log.info(`Sec PR ${context.payload.pull_request._links.html}`);
    await securityPr(context);
  } else if (
    context.payload.pull_request.user.login === "dependabot-preview[bot]"
  ) {
    // This is usually due to the dependabot config existing, so let's try to delete it.
    await removeDependabotConfig(context);
    // Close the PR.
    await context.github.issues.update({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number: context.payload.pull_request.number,
      state: "closed",
    });
  } else {
    context.log.info("Not a security PR, skipping");
  }
};
