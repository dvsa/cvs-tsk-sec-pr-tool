import { Context } from "probot";
import { EventPayloads } from "@octokit/webhooks";
import addLabel from "../labels/addLabel";

export const rebuildLabel = "Needs Rebuild";

export default async (
  context: Context<EventPayloads.WebhookPayloadPullRequest>,
  body: string,
): Promise<void> => {
  const resp = await context.octokit.issues.createComment(
    context.issue({
      body: body,
    }),
  );
  context.log.info({ response: resp });
};

export const handleComment = async (
  context: Context<EventPayloads.WebhookPayloadIssueComment>,
): Promise<void> => {
  context.log.info(`Got the comment on ${context.payload.issue.html_url}`);
  if (!context.payload.repository.name.startsWith("cvs-")) {
    context.log.info("Not a CVS repository");
    return;
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore pull_request is a part of the issue object, but not exposed in Octokit for some reason...
  if (context.payload.issue.pull_request) {
    if (
      context.payload.comment.body.startsWith("/") &&
      context.payload.comment.body.split("/")[1] === "rebuild"
    ) {
      await addLabel(context, [rebuildLabel]);
    }
  } else {
    context.log.info("Not handling non-PR comments yet.");
  }
};
