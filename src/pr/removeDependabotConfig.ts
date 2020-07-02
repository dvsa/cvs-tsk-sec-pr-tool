import { Context, Octokit } from "probot";
import { WebhookPayloadPullRequest } from "@octokit/webhooks";

export default async (
  context: Context<WebhookPayloadPullRequest>,
): Promise<void> => {
  // Get config contents
  const getParams: Octokit.ReposGetContentsParams = {
    owner: context.payload.repository.owner.login,
    path: ".dependabot/config.yml",
    ref: context.payload.pull_request.head.ref,
    repo: context.payload.repository.name,
  };
  const conf: Octokit.ReposGetContentsResponse = (
    await context.github.repos.getContents(getParams)
  ).data;

  if (Array.isArray(conf)) {
    context.log.warn("Dependabot config is a directory?");
    return;
  }

  const deleteFileReq: Octokit.ReposDeleteFileParams = {
    owner: context.payload.repository.owner.login,
    path: ".dependabot/config.yml",
    branch: context.payload.pull_request.head.ref,
    repo: context.payload.repository.name,
    message: "[auto] Delete Dependabot config",
    sha: conf.sha,
  };
  await context.github.repos.deleteFile(deleteFileReq);
};
