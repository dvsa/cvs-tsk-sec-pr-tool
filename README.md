# Security PR Tool

## Quick Start

1. `npm install`
2. `npm run build`
3. Go to https://smee.io/new and note the url generated 
4. Create a github app making note of the app ID and the webhook secret and create a private key
5. Create a `.env` file like so:
    ```dotenv
    # The ID of your GitHub App
    APP_ID=<App ID>
    WEBHOOK_SECRET=<insert secret here>
    PRIVATE_KEY_PATH=./yourprivatekeyhere.pem
    # Use `trace` to get verbose logging or `info` to show less
    LOG_LEVEL=debug
    
    # Go to https://smee.io/new set this to the URL
    # that you are redirected to.
    WEBHOOK_PROXY_URL=https://smee.io/asdfg
    
    # Jenkins
    JENKINS_URL=<jenkins url>
    JENKINS_FEATURE_JOB=UPDATE__FEATURE/job_feature_sec_pr_test
    JENKINS_BUILD_TOKEN=asdf
    JENKINS_USER=jenkins
    JENKINS_APP_TOKEN=asdfg
    ```
6. `npm run dev`
7. Generate requests by commenting on PRs etc.

