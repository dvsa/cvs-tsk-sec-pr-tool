import { Context } from "probot";

export default async (context: Context, labels: string[]): Promise<void> => {
  await context.github.issues.addLabels({
    issue_number: context.payload.issue.number,
    labels,
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
  });
};
