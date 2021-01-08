import { Context } from "probot";
import { EventPayloads } from "@octokit/webhooks";

export const mergeFromPullRequest = async (
  context: Context<EventPayloads.WebhookPayloadPullRequest>,
  mergeMethod: "squash" | "merge" = "squash",
): Promise<void> => {
  context.log.info("Merging...");
  if (context.payload.pull_request)
    await context.octokit.pulls.merge({
      merge_method: mergeMethod,
      repo: context.payload.repository.name,
      owner: context.payload.repository.owner.login,
      pull_number: context.payload.pull_request.number,
    });
};
