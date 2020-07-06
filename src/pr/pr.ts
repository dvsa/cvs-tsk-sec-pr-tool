import { Context } from "probot";
import { WebhookPayloadPullRequest } from "@octokit/webhooks";
import securityPr from "./securityPr";

export default async (
  context: Context<WebhookPayloadPullRequest>,
): Promise<void> => {
  context.log.info("Received a PR");
  if (!context.payload.repository.name.startsWith("cvs-")) {
    context.log.info(`Repo: ${context.payload.repository.name} not a CVS repo`);
    return;
  }
  context.log.info("Fixing merge permissions.");
  await context.github.repos.update({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    allow_merge_commit: false,
    allow_rebase_merge: true,
    allow_squash_merge: true,
  });
  context.log.info("Fixing Dependabot automated security fix settings.");
  await context.github.repos.enableAutomatedSecurityFixes({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
  });
  if (context.payload.pull_request.user.login === "dependabot[bot]") {
    context.log.info(`Sec PR ${context.payload.pull_request.html_url}`);
    await securityPr(context);
  } else if (
    context.payload.pull_request.user.login === "dependabot-preview[bot]"
  ) {
    context.log.info("Closing old dependabot PR");
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
