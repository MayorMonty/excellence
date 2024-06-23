import { Ranking } from "robotevents/out/endpoints/rankings";
import { Skill } from "robotevents/out/endpoints/skills";
import { Team } from "robotevents/out/endpoints/teams";

export type TeamEligibilityCriterion = {
  eligible: boolean;
  reason: string;
  rank: number;
};

export type TeamEligibility = {
  team: Team;
  eligible: boolean;
  ranking: TeamEligibilityCriterion;
  autoSkills: TeamEligibilityCriterion & { score: number };
  skills: TeamEligibilityCriterion & { score: number };
};

export type TeamRecord = {
  driver: Skill | null;
  programming: Skill | null;
  overall: number;
};

export type GetTeamEligibilityArgs = {
  team: Team;
  rankings: Ranking[];
  autoRankings: TeamRecord[];
  skills: TeamRecord[];
  rankingThreshold: number;
  skillsThreshold: number;
};

export function getTeamEligibility({
  team,
  rankings,
  autoRankings,
  skills,
  rankingThreshold,
  skillsThreshold,
}: GetTeamEligibilityArgs): TeamEligibility {
  // Top 40% of teams at the conclusion of qualifying matches
  let rankingCriterion = { eligible: false, rank: 0, reason: "" };
  const qualifyingRank =
    rankings.findIndex((ranking) => ranking.team.id === team.id) + 1;

  if (!qualifyingRank) {
    rankingCriterion = {
      eligible: false,
      rank: qualifyingRank,
      reason: "No Data",
    };
  } else if (qualifyingRank > rankingThreshold) {
    rankingCriterion = {
      eligible: false,
      rank: qualifyingRank,
      reason: `Rank ${qualifyingRank}`,
    };
  } else {
    rankingCriterion = {
      eligible: true,
      rank: qualifyingRank,
      reason: `Rank ${qualifyingRank}`,
    };
  }

  // Top 40% of autonomous coding skills
  let autoSkillsCriterion = {
    eligible: false,
    reason: "",
    rank: 0,
    score: 0,
  };
  const autoSkillsRank =
    autoRankings.findIndex(
      (ranking) => ranking.programming?.team.id === team.id
    ) + 1;
  const autoSkillsRecord = autoRankings[autoSkillsRank - 1]?.programming;

  if (!autoSkillsRank || !autoSkillsRecord) {
    autoSkillsCriterion = {
      eligible: false,
      reason: "No Data",
      rank: 0,
      score: 0,
    };
  } else if (autoSkillsRecord.score < 1) {
    autoSkillsCriterion = {
      eligible: false,
      rank: autoSkillsRank,
      score: autoSkillsRecord.score,
      reason: `Zero Score`,
    };
  } else if (autoSkillsRank > skillsThreshold) {
    autoSkillsCriterion = {
      eligible: false,
      rank: autoSkillsRank,
      score: autoSkillsRecord.score,
      reason: `Auto Skills Rank ${autoSkillsRank} [score: ${autoSkillsRecord.score}]`,
    };
  } else {
    autoSkillsCriterion = {
      eligible: true,
      rank: autoSkillsRank,
      score: autoSkillsRecord.score,
      reason: `Auto Skills Rank ${autoSkillsRank} [score: ${autoSkillsRecord.score}]`,
    };
  }

  // Top 40% of overall skills
  let skillsCriterion = { eligible: false, reason: "", rank: 0, score: 0 };
  const overallSkillsRank =
    skills.findIndex((record) => {
      const number = record.driver?.team.id ?? record.programming?.team.id;
      return number === team.id;
    }) + 1;
  const skillsRecord = skills?.[overallSkillsRank - 1]?.overall;

  if (!overallSkillsRank || !skillsRecord) {
    skillsCriterion = {
      eligible: false,
      reason: "No Data",
      rank: 0,
      score: 0,
    };
  } else if (skillsRecord < 1) {
    skillsCriterion = {
      eligible: false,
      rank: overallSkillsRank,
      score: skillsRecord,
      reason: `Zero Score`,
    };
  } else if (overallSkillsRank > skillsThreshold) {
    skillsCriterion = {
      eligible: false,
      rank: overallSkillsRank,
      score: skillsRecord,
      reason: `Overall Skills Rank ${overallSkillsRank} [score: ${skillsRecord}]`,
    };
  } else {
    skillsCriterion = {
      eligible: true,
      rank: overallSkillsRank,
      score: skillsRecord,
      reason: `Overall Skills Rank ${overallSkillsRank} [score: ${skillsRecord}]`,
    };
  }

  const eligible =
    rankingCriterion.eligible &&
    autoSkillsCriterion.eligible &&
    skillsCriterion.eligible;

  return {
    team,
    eligible,
    ranking: rankingCriterion,
    autoSkills: autoSkillsCriterion,
    skills: skillsCriterion,
  };
}

export type GetTeamEligibilityListArgs = {
  teams: Team[];
  rankings: Ranking[];
  skills: TeamRecord[];
  rankingThreshold: number;
  skillsThreshold: number;
};

export function getTeamEligibilityList({
  teams,
  rankings,
  skills,
  rankingThreshold,
  skillsThreshold,
}: GetTeamEligibilityListArgs): TeamEligibility[] {
  const autoRankings = [...skills].sort(
    (a, b) => (b.programming?.score ?? 0) - (a.programming?.score ?? 0)
  );

  return teams.map((team) =>
    getTeamEligibility({
      team,
      rankings,
      autoRankings,
      skills,
      rankingThreshold,
      skillsThreshold,
    })
  );
}
