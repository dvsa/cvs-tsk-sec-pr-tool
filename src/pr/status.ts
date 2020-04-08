import { Context } from "probot";
import { WebhookPayloadPullRequest } from "@octokit/webhooks";

export const setStatus = async (
  context: Context<WebhookPayloadPullRequest>,
  state: "error" | "failure" | "pending" | "success",
  statusName: string,
  description?: string,
  target_url?: string,
): Promise<void> => {
  const resp = await context.github.repos.createStatus(
    context.issue({
      sha: context.payload.pull_request.head.sha,
      context: statusName,
      state,
      description,
      target_url,
    }),
  );
  context.log.info({ response: resp });
};
