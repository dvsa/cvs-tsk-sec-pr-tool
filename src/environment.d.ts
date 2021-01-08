// List of environment variables expected to be set
declare namespace NodeJS {
  interface ProcessEnv {
    JENKINS_URL: string;
    JENKINS_FEATURE_JOB: string;
    JENKINS_BUILD_TOKEN: string;
    JENKINS_USER: string;
    JENKINS_APP_TOKEN: string;
  }
}
