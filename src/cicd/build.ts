import { Context } from "probot";
import create, { JenkinsPromisifiedAPI } from "jenkins";
import { BuildStatus, JENKINS_URL } from "./util";
import { setStatus } from "../pr/status";

const getBuildStatus = async (
  buildNumber: number,
): Promise<[BuildStatus, string]> => {
  const jenkins: JenkinsPromisifiedAPI = create({
    baseUrl: JENKINS_URL,
    crumbIssuer: true,
    promisify: true,
  });
  const resp = await jenkins.build.get(
    process.env.JENKINS_FEATURE_JOB,
    buildNumber,
  );
  if (resp["building"]) return [BuildStatus.IN_PROGRESS, resp["url"]];
  switch (resp["result"]) {
    case "SUCCESS":
      return [BuildStatus.PASS, resp["url"]];
    case "UNSTABLE":
      return [BuildStatus.UNSTABLE, resp["url"]];
    case "FAILURE":
      return [BuildStatus.FAIL, resp["url"]];
    case "ABORTED":
      return [BuildStatus.ABORTED, resp["url"]];
    default:
      return [BuildStatus.ERROR, resp["url"]];
  }
};

export const waitForBuildStatus = async (
  context: Context,
  buildNumber: number,
  statusName: string,
): Promise<BuildStatus> => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [buildStatus, buildUrl] = await getBuildStatus(buildNumber);
    switch (buildStatus) {
      case BuildStatus.PASS:
        await setStatus(
          context,
          "success",
          statusName,
          "Build passed!",
          buildUrl,
        );
        return buildStatus;
      case BuildStatus.UNSTABLE:
        await setStatus(
          context,
          "success",
          statusName,
          "Build passed, but unstable.",
          buildUrl,
        );
        return buildStatus;
      case BuildStatus.ABORTED:
        await setStatus(
          context,
          "failure",
          statusName,
          "Build aborted!",
          buildUrl,
        );
        return buildStatus;
      case BuildStatus.FAIL:
        await setStatus(
          context,
          "failure",
          statusName,
          "Build failed!",
          buildUrl,
        );
        return buildStatus;
      case BuildStatus.ERROR:
        context.log.warn(`Failed to get build status for: ${buildUrl}`);
        await setStatus(
          context,
          "pending",
          statusName,
          "Unable to get build status, check manually",
          buildUrl,
        );
        return buildStatus;
      case BuildStatus.IN_PROGRESS:
        await setStatus(
          context,
          "pending",
          statusName,
          "Build in progress",
          buildUrl,
        );
        await new Promise((r) => setTimeout(r, 10000));
    }
  }
};

export const buildService = async (
  context: Context,
  serviceName: string,
  branch: string,
): Promise<number> => {
  const jenkins: JenkinsPromisifiedAPI = create({
    baseUrl: JENKINS_URL,
    crumbIssuer: true,
    promisify: true,
  });
  const buildId = await jenkins.job.build({
    name: process.env.JENKINS_FEATURE_JOB,
    parameters: {
      SERVICE: serviceName,
      BRANCH: branch,
    },
    token: process.env.JENKINS_BUILD_TOKEN,
  });
  context.log.info(`BuildId: ${buildId}`);
  let queueResponse = await jenkins.queue.item(buildId);
  while (queueResponse) {
    if (queueResponse?.executable?.number) {
      break;
    }
    context.log.info("Queued build does not have a number");
    await new Promise((r) => setTimeout(r, 500));
    queueResponse = await jenkins.queue.item(buildId);
  }
  const qNumber = queueResponse["executable"]["number"];
  context.log.info({ queueNumber: qNumber });
  return qNumber;
};
