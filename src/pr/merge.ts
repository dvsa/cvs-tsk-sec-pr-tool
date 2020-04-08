import { Context } from "probot";
import {
  WebhookPayloadIssueComment,
  WebhookPayloadPullRequest,
} from "@octokit/webhooks";

export const mergeFromPRComment = async (
  context: Context<WebhookPayloadIssueComment>,
): Promise<void> => {
  context.log.info("Merging...");
  const pr = await context.github.pulls.get({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    pull_number: context.payload.issue.number,
  });
  await context.github.pulls.merge({
    merge_method: "squash",
    repo: context.payload.repository.name,
    owner: context.payload.repository.owner.login,
    pull_number: pr.data.number,
    sha: pr.data.head.sha,
  });
};

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
