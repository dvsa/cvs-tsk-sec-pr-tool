import { Context } from "probot";

export default async (context: Context, label: string): Promise<void> => {
  await context.octokit.issues.removeLabel({
    issue_number: context.payload.pull_request.number,
    name: label,
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
  });
};
