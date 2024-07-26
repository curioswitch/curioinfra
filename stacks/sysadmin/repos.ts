import { Team } from "@cdktf/provider-github/lib/team";
import { TeamMembership } from "@cdktf/provider-github/lib/team-membership";
import { GitHubRepository } from "@curioswitch/cdktf-constructs";
import { Fn } from "cdktf";
import { Construct } from "constructs";

export class Repos extends Construct {
  constructor(scope: Construct) {
    super(scope, "repos");

    const admins = new Team(this, "admins", {
      name: "admins",
      description: "Admins of the organization with full access",
      privacy: "closed",
    });

    new TeamMembership(this, "admins-chokoswitch", {
      teamId: admins.id,
      username: "chokoswitch",
      role: "maintainer",
    });

    new GitHubRepository(this, {
      name: "tasuke",
      adminTeam: admins.id,
      repositoryConfig: {
        description: "A service to match code reviewers to requesters",
        hasIssues: true,
        hasProjects: true,
        hasWiki: false,
        homepageUrl: "https://tasuke.dev",
        squashMergeCommitTitle: "PR_TITLE",
        squashMergeCommitMessage: "BLANK",
      },
    });

    new GitHubRepository(this, {
      name: "tasukeinfra",
      adminTeam: admins.id,
      repositoryConfig: {
        hasDownloads: false,
        hasIssues: true,
        hasProjects: false,
        hasWiki: false,
        squashMergeCommitTitle: "PR_TITLE",
        squashMergeCommitMessage: "BLANK",
      },
      prodEnvironmentConfig: {
        reviewers: [
          {
            teams: [Fn.tonumber(admins.id)],
          },
        ],
      },
    });
  }
}
