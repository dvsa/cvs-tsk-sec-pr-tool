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
  if (context.payload.pull_request.user.login === "dependabot-preview[bot]") {
    await securityPr(context);
  } else {
    context.log.info("Not a security PR, skipping");
  }
};
