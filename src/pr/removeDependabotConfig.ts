import { Context } from "probot";
import { EventPayloads } from "@octokit/webhooks";
import { components } from "@octokit/openapi-types";

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
  await context.octokit.repos.deleteFile(deleteFileReq);
};

type GetRepoContentResponseData = components["schemas"]["content-file"];

const getOldConfig = async (
  context: Context<EventPayloads.WebhookPayloadPullRequest>,
): Promise<GetRepoContentResponseData | undefined> => {
  // Get config contents
  const getParams = context.repo({
    ref: context.payload.pull_request.head.ref,
    path: ".dependabot/config.yml",
  });
  try {
    const resp = await context.octokit.repos.getContent(getParams);
    return resp.data as GetRepoContentResponseData;
  } catch (e) {
    context.log.warn(`File not found`);
    return;
  }
};
