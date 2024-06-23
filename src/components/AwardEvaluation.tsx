import { useCallback, useMemo } from "react";
import { ArrowDownTrayIcon } from "@heroicons/react/24/solid";
import {
  EventExcellenceAwards,
  EventRankings,
  EventSkills,
  EventTeams,
  EventTeamsByDivision,
  useByGrade,
} from "../util/eventHooks";
import { Event } from "robotevents/out/endpoints/events";
import { getTeamEligibilityList, TeamEligibility } from "../util/eligibility";
import * as csv from "csv-stringify/browser/esm/sync";
import { TeamEligibilityTable } from "./TeamEligibility";
import { DownloadButton } from "./Download";

const THRESHOLD = 0.4;

export type AwardEvaluationProps = {
  event: Event | null | undefined;
  rankings: EventRankings;
  divisionTeams: EventTeamsByDivision;
  eventTeams: EventTeams;
  division: number;
  excellence: EventExcellenceAwards;
  skills: EventSkills;
};

const AwardEvaluation: React.FC<AwardEvaluationProps> = (props) => {
  // Base Data
  const division = props.event?.divisions.find(
    (d) => d.id === props.division
  ) ?? { id: 1, name: "Competition", order: 1 };

  const teams = useByGrade(
    props.divisionTeams[division.id],
    props.excellence.grade,
    []
  );
  const eventTeams = useByGrade(props.eventTeams, props.excellence.grade, []);
  const rankings = useByGrade(
    props.rankings[division.id],
    props.excellence.grade,
    []
  );
  const skills = useByGrade(props.skills, props.excellence.grade, []);

  // Team Eligibility Calculation
  const teamsInGroup = teams.length ?? 0;
  const rankingThreshold = Math.round(teamsInGroup * THRESHOLD);
  const teamsInAge = eventTeams.length ?? 0;
  const skillsThreshold = Math.round(teamsInAge * THRESHOLD);

  const teamEligibility = useMemo(
    () =>
      getTeamEligibilityList({
        teams,
        rankings,
        skills,
        rankingThreshold,
        skillsThreshold,
      }),
    [teams, rankings, skills, rankingThreshold, skillsThreshold]
  );

  const eligibleTeams = useMemo(
    () => teams.filter((_, i) => teamEligibility[i].eligible),
    [teamEligibility, teams]
  );

  // Download
  const downloadFilename = useMemo(
    () =>
      [
        props.event?.sku,
        division.name.toLowerCase().replace(/ /g, "_"),
        props.excellence.grade.toLowerCase().replace(/ /g, "_"),
        "excellence.csv",
      ].join("_"),
    [division.name, props.event?.sku, props.excellence.grade]
  );

  const getDownloadBlob = useCallback(
    () => new Blob([toCSVString(teamEligibility)], { type: "text/csv" }),
    [teamEligibility]
  );

  if ((props.event?.divisions.length ?? 1) > 1 && teams.length === 0) {
    return null;
  }

  return (
    <section className="mt-4">
      <h2 className="font-bold">
        {props.excellence.award.title}
        {(props.event?.divisions.length ?? 1) > 1
          ? ` — ${division.name}`
          : null}
      </h2>
      <p>Teams In Group: {teamsInGroup}</p>
      <p>
        Top 40% Threshold for Rankings: {(teamsInGroup * THRESHOLD).toFixed(2)}{" "}
        ⟶ {rankingThreshold}
      </p>
      <p>
        Top 40% Threshold for Skills: {(teamsInAge * THRESHOLD).toFixed(2)} ⟶{" "}
        {skillsThreshold}
      </p>
      <p className="mt-4">
        Teams Eligible For Excellence:{" "}
        <span className="italic">
          {eligibleTeams.length === 0 ? "None" : null}
        </span>
      </p>
      <ul className="flex flex-wrap gap-2 mt-2">
        {eligibleTeams.map((team) => (
          <li className="bg-green-400 text-black px-2 font-mono rounded-md">
            {team.number}
          </li>
        ))}
      </ul>
      <nav className="flex items-center justify-end mt-2">
        <DownloadButton contents={getDownloadBlob} filename={downloadFilename}>
          <ArrowDownTrayIcon height={18} className="inline" />
          <span className="font-mono">CSV</span>
        </DownloadButton>
      </nav>
      <TeamEligibilityTable teams={teamEligibility} />
    </section>
  );
};

export default AwardEvaluation;

function toCSVString(teamEligibility: TeamEligibility[]) {
  return csv.stringify(teamEligibility, {
    header: true,
    columns: [
      { key: "team.number", header: "Team" },
      { key: "eligible", header: "Eligible" },
      { key: "ranking.eligible", header: "Ranking Eligible" },
      { key: "ranking.reason", header: "Ranking Reason" },
      { key: "ranking.rank", header: "Ranking Rank" },
      { key: "skills.eligible", header: "Overall Skills Eligible" },
      { key: "skills.reason", header: "Overall Skills Reason" },
      { key: "skills.rank", header: "Overall Skills Rank" },
      { key: "skills.score", header: "Overall Skills Score" },
      { key: "autoSkills.eligible", header: "Auto Skills Eligible" },
      { key: "autoSkills.reason", header: "Auto Skills Reason" },
      { key: "autoSkills.rank", header: "Auto Skills Rank" },
      { key: "autoSkills.score", header: "Auto Skills Score" },
    ],
    cast: {
      boolean: (value) => (value ? "TRUE" : "FALSE"),
    },
  });
}
