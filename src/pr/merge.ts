import { Context } from "probot";
import { WebhookPayloadPullRequest } from "@octokit/webhooks";

export const mergeFromPullRequest = async (
  context: Context<WebhookPayloadPullRequest>,
  mergeMethod: "squash" | "merge" = "squash",
): Promise<void> => {
  context.log.info("Merging...");
  if (context.payload.pull_request)
    await context.github.pulls.merge({
      merge_method: mergeMethod,
      repo: context.payload.repository.name,
      owner: context.payload.repository.owner.login,
      pull_number: context.payload.pull_request.number,
      sha: context.payload.pull_request.head.sha,
    });
};
