import "./App.css";
import { useState } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  TeamRecord,
  useEvent,
  useEventExcellenceAwards,
  useEventRankings,
  useEventSkills,
  useEventTeams,
} from "./util/event";
import { Grade, Team } from "robotevents/out/endpoints/teams";
import { Ranking } from "robotevents/out/endpoints/rankings";
import { Skill } from "robotevents/out/endpoints/skills";
import { Award } from "robotevents/out/endpoints/award";
import { Event } from "robotevents/out/endpoints/events";

function App() {
  const [sku, setSku] = useState("");

  const {
    data: event,
    isLoading: isLoadingEvent,
    isFetched: isFetchedEvent,
  } = useEvent(sku);
  const {
    data: teams,
    isLoading: isLoadingTeams,
    isFetched: isFetchedTeams,
  } = useEventTeams(event);
  const {
    data: awards,
    isLoading: isLoadingAwards,
    isFetched: isFetchedAwards,
  } = useEventExcellenceAwards(event);
  const {
    data: rankings,
    isLoading: isLoadingRankings,
    isFetched: isFetchedRankings,
  } = useEventRankings(event);

  const {
    data: skills,
    isLoading: isLoadingSkills,
    isFetched: isFetchedSkills,
  } = useEventSkills(event);

  const multipleDivisions = (event?.divisions.length ?? 0) > 1;

  const isLoading =
    isLoadingEvent ||
    isLoadingAwards ||
    isLoadingTeams ||
    isLoadingRankings ||
    isLoadingSkills;
  const isFetched =
    isFetchedEvent &&
    isFetchedAwards &&
    isFetchedTeams &&
    isFetchedRankings &&
    isFetchedSkills;
  sku.length > 0;

  const displayEvaluation = isFetched && !multipleDivisions;

  return (
    <>
      <header>
        <h1 className="text-3xl mb-4 text-center">Excellence Eligibility</h1>

        <section className="flex md:items-center gap-4 md:flex-row flex-col">
          <input
            type="text"
            pattern="RE-(VRC|VIQRC|VEXU)-[0-9]{2}-[0-9]{4}"
            placeholder="SKU"
            className="font-mono px-4 py-4 rounded-md invalid:bg-red-500"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            title="The RobotEvents SKU"
          />
          {event && (
            <p className="font-bold">
              <CheckCircleIcon
                height={18}
                className="text-green-400 inline mr-2"
              />
              {event?.name}
            </p>
          )}
        </section>
        {multipleDivisions && (
          <p className="p-4">
            <ExclamationCircleIcon
              height={18}
              className="inline mr-2 text-red-400"
            />
            <span className="text-red-400">
              This event has multiple divisions.{" "}
            </span>
            <span>
              This tool does not currently support events with multiple
              divisions.
            </span>
          </p>
        )}
        {isLoading && (
          <div className="flex justify-center p-8">
            <ArrowPathIcon className="animate-spin" height={18} />
          </div>
        )}
      </header>
      <main className="mt-4">
        {displayEvaluation &&
          teams &&
          rankings &&
          skills &&
          awards?.map((excellence) => (
            <AwardEvaluation
              key={excellence.award.id}
              event={event}
              teams={teams}
              rankings={rankings}
              skills={skills}
              excellence={excellence}
            />
          ))}
      </main>
      <section className="mt-8">
        <p>
          The{" "}
          <a
            href="https://roboticseducation.org/documents/2023/06/guide-to-judging.pdf/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Guide to Judging
          </a>{" "}
          for the 2023-2024 season states that the following conditions must be
          met for a team to be eligible for the Excellence Award:
        </p>
        <ol className="list-decimal list-inside m-4">
          <li>
            Be at or near the top of all Engineering Notebook Rubric rankings.
          </li>
          <li>Exhibit a high-quality team interview.</li>
          <li>
            Be ranked in the top 30% of teams at the conclusion of qualifying
            matches.
          </li>
          <li>
            Be ranked in the top 30% of teams at the conclusion of the Robot
            Skills Challenges
          </li>
          <li>
            Be ranked in the top 30% of Autonomous Coding Challenge rankings at
            the conclusion of the Robot Skills Challenges
          </li>
          <li>Be a candidate in consideration for other Judged Awards</li>
          <li>Demonstrate a student-centered ethos.</li>
          <li>
            Exhibit positive team conduct, good sportsmanship, and
            professionalism
          </li>
        </ol>
        <p>
          The purpose of this utility is to help Judges quickly determine which
          teams are currently eligible for the Excellence Award at their event.
        </p>
        <p className="mt-4">
          Disclaimer: This utility is designed to assist Judges at an event.
          Competitors, please remember that judges consider many other factors
          when making decisions besides what can be automatically checked. The
          purpose of this tool is to assist judges in making decisions, not to
          allow you to give judges a hard time if you don't win.{" "}
          <em>
            As always, be mindful of &lt;G1&gt; and the REC Foundation Code of
            Conduct when competing in VIQRC, VRC, and VEXU events.
          </em>
        </p>
      </section>
    </>
  );
}

type AwardEvaluationProps = {
  event: Event | null | undefined;
  teams: {
    overall: Team[];
    grades: Partial<Record<Grade, Team[]>>;
  };
  rankings: {
    overall: Ranking[];
    grades: Partial<Record<Grade, Ranking[]>>;
  };
  excellence: {
    award: Award;
    grade: Grade | "Overall";
  };
  skills: {
    teamSkills: Record<string, TeamRecord>;
    overall: TeamRecord[];
    grades: {
      [k: string]: TeamRecord[];
    };
  };
};

const AwardEvaluation: React.FC<AwardEvaluationProps> = (props) => {
  const teams =
    props.excellence.grade === "Overall"
      ? props.teams.overall
      : props.teams.grades[props.excellence.grade];
  const award = props.excellence.award;

  const rankings =
    props.excellence.grade === "Overall"
      ? props.rankings.overall
      : props.rankings.grades[props.excellence.grade];

  const skills =
    props.excellence.grade === "Overall"
      ? props.skills.overall
      : props.skills.grades[props.excellence.grade];

  const autoRankings = skills.sort(
    (a, b) => (b.programming?.score ?? 0) - (a.programming?.score ?? 0)
  );

  const teamsAtEvent = rankings?.length ?? 0;
  const threshold = Math.round(teamsAtEvent * 0.3);

  function isTeamEligible(team: Team) {
    // Top 30% of teams at the conclusion of qualifying matches
    let rankingCriterion = { eligible: false, rank: 0, reason: "" };
    const rank =
      rankings!.findIndex((ranking) => ranking.team.id === team.id) + 1;

    if (!rank) {
      rankingCriterion = { eligible: false, rank, reason: "No Data" };
    } else if (rank > threshold) {
      rankingCriterion = { eligible: false, rank, reason: "Rank Too Low" };
    } else {
      rankingCriterion = { eligible: true, rank, reason: `Rank ${rank}` };
    }

    // Top 30% of autonomous coding skills
    let autoSkillsCriterion = { eligible: false, reason: "" };
    const autonomousCodingSkills =
      autoRankings.findIndex(
        (ranking) => ranking.programming?.team.id === team.id
      ) + 1;

    if (!autonomousCodingSkills) {
      autoSkillsCriterion = { eligible: false, reason: "No Data" };
    } else if (autonomousCodingSkills > threshold) {
      autoSkillsCriterion = {
        eligible: false,
        reason: `Auto Skills Rank Too Low ${autonomousCodingSkills}`,
      };
    } else {
      autoSkillsCriterion = {
        eligible: true,
        reason: `Auto Skills Rank ${autonomousCodingSkills}`,
      };
    }

    // Top 30% of overall skills
    let skillsCriterion = { eligible: false, reason: "" };
    const overallSkills =
      skills.findIndex((record) => {
        const number = record.driver?.team.id ?? record.programming?.team.id;
        return number === team.id;
      }) + 1;

    if (!overallSkills) {
      skillsCriterion = { eligible: false, reason: "No Data" };
    } else if (overallSkills > threshold) {
      skillsCriterion = {
        eligible: false,
        reason: "Overall Skills Rank Too Low",
      };
    } else {
      skillsCriterion = {
        eligible: true,
        reason: `Overall Skills Rank ${overallSkills}`,
      };
    }

    const eligible =
      rankingCriterion.eligible &&
      autoSkillsCriterion.eligible &&
      skillsCriterion.eligible;
    return {
      eligible,
      ranking: rankingCriterion,
      autoSkills: autoSkillsCriterion,
      skills: skillsCriterion,
    };
  }

  return (
    <section className="mt-4">
      <h2 className="font-bold">{award.title}</h2>
      <p>Teams At Event: {teamsAtEvent}</p>
      <p>
        Top 30% Threshold: {(teamsAtEvent * 0.3).toFixed(2)} ⟶ {threshold}
      </p>
      <div className="mt-4 grid md:grid-cols-4 gap-1">
        <p className="hidden md:block">Team</p>
        <p className="hidden md:block">Ranking</p>
        <p className="hidden md:block">Overall Skills</p>
        <p className="hidden md:block">Autonomous Coding Skills</p>
        {teams!.map((team) => {
          const { eligible, ranking, autoSkills, skills } =
            isTeamEligible(team);
          return (
            <>
              <div className="mt-4 md:mt-0">
                {eligible ? (
                  <CheckCircleIcon
                    height={18}
                    className="inline text-green-400"
                  />
                ) : (
                  <XCircleIcon height={18} className="inline text-red-400" />
                )}
                <span
                  className={`ml-2 font-mono px-2 rounded-md ${
                    eligible ? "bg-green-400 text-black" : "bg-transparent"
                  }`}
                >
                  {team.number}
                </span>
              </div>
              <div className="text-gray-400 flex justify-between">
                <span
                  className={`${
                    ranking.eligible ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {ranking.reason}
                </span>
              </div>
              <div className="text-gray-400 flex justify-between">
                <span
                  className={`${
                    skills.eligible ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {skills.reason}
                </span>
              </div>
              <div className="text-gray-400 flex justify-between">
                <span
                  className={`${
                    autoSkills.eligible ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {autoSkills.reason}
                </span>
              </div>
            </>
          );
        })}
      </div>
    </section>
  );
};

export default App;
