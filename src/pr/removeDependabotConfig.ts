import { Context } from "probot";
import { EventPayloads } from "@octokit/webhooks";
import { ReposGetContentResponseData } from "@octokit/types";

export default async (
  context: Context<EventPayloads.WebhookPayloadPullRequest>,
): Promise<void> => {
  const conf = await getOldConfig(context);
  if (conf === undefined) return;
  if (Array.isArray(conf)) {
    context.log.warn("Dependabot config is a directory?");
    return;
  }
  if (conf.content === undefined) {
    return;
  }
  const deleteFileReq = context.repo({
    path: ".dependabot/config.yml",
    branch: context.payload.pull_request.head.ref,
    message: "[auto] Delete old Dependabot config",
    sha: conf.sha,
  });
  await context.github.repos.deleteFile(deleteFileReq);
};

const getOldConfig = async (
  context: Context<EventPayloads.WebhookPayloadPullRequest>,
): Promise<ReposGetContentResponseData | undefined> => {
  // Get config contents
  const getParams = context.repo({
    ref: context.payload.pull_request.head.ref,
    path: ".dependabot/config.yml",
  });
  try {
    const resp = await context.github.repos.getContents(getParams);
    return { target: "", submodule_git_url: "", ...resp.data };
  } catch (e) {
    context.log.warn(`File not found`);
    return;
  }
};
