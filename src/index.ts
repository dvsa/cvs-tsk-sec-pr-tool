import { Application } from "probot";
import pr from "./pr/pr";
import { handleComment } from "./pr/comment";
import fs from "fs";

export default (app: Application): void => {
  app.log.info("Okay! Starting...");

  if (process.env.KUBERNETES_SERVICE_HOST) {
    app.log.info("I'm running in Kubernetes...");
    app.log.info("I will write to the termination log if there's an error");
    process.on("uncaughtException", (err) => {
      fs.writeFileSync("/dev/termination-log", `Caught exception: ${err}`);
      process.exit(1);
    });
  }

  for (const envVar of [
    "JENKINS_APP_TOKEN",
    "JENKINS_URL",
    "JENKINS_USER",
    "JENKINS_FEATURE_JOB",
    "JENKINS_BUILD_TOKEN",
  ]) {
    if (!process.env[envVar])
      throw new Error(`Required env var not set: ${envVar}`);
  }

  app.on(
    ["pull_request.opened", "pull_request.synchronize", "pull_request.labeled"],
    pr,
  );
  app.on("issue_comment.created", handleComment);
};
