import { Context, Octokit } from "probot";
import { WebhookPayloadPullRequest } from "@octokit/webhooks";

export default async (
  context: Context<WebhookPayloadPullRequest>,
): Promise<void> => {
  const conf = await getOldConfig(context);
  if (Array.isArray(conf)) {
    context.log.warn("Dependabot config is a directory?");
    return;
  }
  if (conf.content !== undefined) {
    return;
  }
  const deleteFileReq: Octokit.ReposDeleteFileParams = {
    owner: context.payload.repository.owner.login,
    path: ".dependabot/config.yml",
    branch: context.payload.pull_request.head.ref,
    repo: context.payload.repository.name,
    message: "[auto] Delete old Dependabot config",
    sha: conf.sha,
  };
  await context.github.repos.deleteFile(deleteFileReq);
};

const getOldConfig = async (
  context: Context<WebhookPayloadPullRequest>,
): Promise<Octokit.ReposGetContentsResponse> => {
  // Get config contents
  const getParams: Octokit.ReposGetContentsParams = {
    owner: context.payload.repository.owner.login,
    path: ".dependabot/config.yml",
    ref: context.payload.pull_request.head.ref,
    repo: context.payload.repository.name,
  };
  return (await context.github.repos.getContents(getParams)).data;
};
