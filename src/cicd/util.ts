export const JENKINS_URL = `http://${process.env.JENKINS_USER}:${process.env.JENKINS_APP_TOKEN}@${process.env.JENKINS_URL}`;

export enum BuildStatus {
  IN_PROGRESS,
  ABORTED,
  PASS,
  UNSTABLE,
  FAIL,
  ERROR,
}
