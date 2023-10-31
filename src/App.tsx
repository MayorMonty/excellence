import "./App.css";
import { useCallback, useMemo, useState } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import { ArrowDownTrayIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  useEvent,
  useEventExcellenceAwards,
  useEventRankings,
  useEventSkills,
  useEventTeams,
  useEventsToday,
} from "./util/event";
import { Event } from "robotevents/out/endpoints/events";
import { getTeamEligibility } from "./util/eligibility";
import * as csv from "csv-stringify/browser/esm/sync";

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

  const { data: eventsToday, isLoading: isLoadingEventsToday } =
    useEventsToday();

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
    isFetchedSkills &&
    sku.length > 0;

  const hasExcellence = awards && awards.length > 0;

  const displayEvaluation = isFetched && !multipleDivisions && hasExcellence;

  return (
    <>
      <header>
        <h1 className="text-3xl mb-4 text-center">Excellence Eligibility</h1>
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
            for the 2023-2024 season states that the following conditions must
            be met for a team to be eligible for the Excellence Award:
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
              Be ranked in the top 30% of Autonomous Coding Challenge rankings
              at the conclusion of the Robot Skills Challenges
            </li>
            <li>Be a candidate in consideration for other Judged Awards</li>
            <li>Demonstrate a student-centered ethos.</li>
            <li>
              Exhibit positive team conduct, good sportsmanship, and
              professionalism
            </li>
          </ol>
          <p>
            The purpose of this utility is to help Judges quickly determine
            which teams are currently eligible for the Excellence Award at their
            event.
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
          <p className="mt-4">
            To begin, enter your Event Code below (looks like RE-VRC-XX-XXXX).
          </p>
        </section>
        <section className="flex lg:items-center gap-4 lg:flex-row flex-col mt-4">
          <select
            className="px-4 py-4 rounded-md border border-slate-700 dark:border-slate-200 flex-1"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            disabled={isLoadingEventsToday}
          >
            <option value="">Select An Event</option>
            {eventsToday?.map((event) => (
              <option key={event.sku} value={event.sku}>
                {event.name}
              </option>
            ))}
          </select>
          <span>or</span>
          <input
            type="text"
            pattern="RE-(VRC|VIQRC|VEXU|VIQC)-[0-9]{2}-[0-9]{4}"
            placeholder="SKU"
            className="font-mono px-4 py-4 rounded-md invalid:bg-red-500 border border-slate-700 dark:border-slate-200"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            title="The RobotEvents Event Code"
          />
        </section>
        {event && (
          <>
            <p className="font-bold pt-4">
              <CheckCircleIcon
                height={18}
                className="text-green-400 inline mr-2"
              />
              {event?.name}{" "}
              <span className="italic font-normal">
                [
                <a href={event.getURL()} target="_blank">
                  {event.sku}
                </a>
                ]
              </span>
            </p>
            <section className="mt-2">
              <p>{event.location.venue}</p>
              <p>{event.location.address_1}</p>
              <p>{event.location.address_2}</p>
              <p>
                {event.location.city}, {event.location.region},{" "}
                {event.location.country}
              </p>
            </section>
          </>
        )}
        {multipleDivisions && (
          <p className="pt-4">
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
        {awards && !hasExcellence && (
          <p className="pt-4">
            <ExclamationCircleIcon
              height={18}
              className="inline mr-2 text-red-400"
            />
            <span className="text-red-400">No Excellence Award. </span>
            <span>This event does not have an Excellence Award</span>
          </p>
        )}
        {isFetched && <hr className="mt-4" />}
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
    </>
  );
}

type AwardEvaluationProps = {
  event: Event | null | undefined;
  teams: Exclude<ReturnType<typeof useEventTeams>["data"], undefined>;
  rankings: Exclude<
    ReturnType<typeof useEventRankings>["data"],
    undefined | null
  >;
  excellence: Exclude<
    ReturnType<typeof useEventExcellenceAwards>["data"],
    null | undefined
  >[0];
  skills: Exclude<ReturnType<typeof useEventSkills>["data"], undefined>;
};

export interface TeamEligibilityCriterion {
  eligible: boolean;
  reason: string;
  rank: number;
}

export interface TeamEligibility {
  eligible: boolean;
  ranking: TeamEligibilityCriterion;
  autoSkills: TeamEligibilityCriterion & { score: number };
  skills: TeamEligibilityCriterion & { score: number };
}

const AwardEvaluation: React.FC<AwardEvaluationProps> = (props) => {
  const teams =
    props.excellence.grade === "Overall"
      ? props.teams.overall
      : props.teams.grades[props.excellence.grade] ?? [];
  const award = props.excellence.award;

  const rankings =
    props.excellence.grade === "Overall"
      ? props.rankings.overall
      : props.rankings.grades[props.excellence.grade] ?? [];

  const skills =
    props.excellence.grade === "Overall"
      ? props.skills.overall ?? []
      : props.skills.grades[props.excellence.grade] ?? [];

  const teamsAtEvent = rankings.length ?? 0;
  const threshold = Math.round(teamsAtEvent * 0.3);

  const teamEligibility = useMemo(() => {
    if (!teams) return [];
    return getTeamEligibility({ teams, rankings, skills, threshold });
  }, [teams]);

  const eligibleTeams = useMemo(() => {
    if (!teams) return [];
    return teams.filter((_, i) => teamEligibility[i].eligible);
  }, [teamEligibility, teams]);

  const onExportToCSV = useCallback(() => {
    const data = csv.stringify(teamEligibility, {
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
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const filename = [
      props.event?.sku,
      props.excellence.grade.toLowerCase().replace(/ /g, "_"),
      "excellence.csv",
    ].join("_");

    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    a.click();
  }, [teamEligibility]);

  return (
    <section className="mt-4">
      <h2 className="font-bold">{award.title}</h2>
      <p>Teams At Event: {teamsAtEvent}</p>
      <p>
        Top 30% Threshold: {(teamsAtEvent * 0.3).toFixed(2)} ⟶ {threshold}
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
      <nav className="flex items-center mt-2 justify-end">
        <button
          className="font-mono flex gap-2 items-center bg-purple-600 px-2 py-1 rounded-md hover:bg-purple-400 active:bg-purple-400"
          title="Export as CSV"
          onClick={onExportToCSV}
        >
          <ArrowDownTrayIcon height={18} />
          csv
        </button>
      </nav>
      <table className="w-full mt-4">
        <thead className="text-left sr-only md:not-sr-only">
          <tr>
            <th>Team</th>
            <th>Qualifications</th>
            <th>Overall Skills Rank</th>
            <th>Autonomous Coding Skills</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, i) => {
            const { eligible, ranking, autoSkills, skills } =
              teamEligibility[i];
            return (
              <tr key={team.id}>
                <td className="mt-4 md:mt-0 block md:table-cell">
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
                </td>

                <td className="text-gray-400 block md:table-cell">
                  <span
                    className={`${
                      ranking.eligible ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {ranking.reason}
                  </span>
                </td>
                <td className="text-gray-400 block md:table-cell">
                  <span
                    className={`${
                      skills.eligible ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {skills.reason}
                  </span>
                </td>
                <td className="text-gray-400 block md:table-cell">
                  <span
                    className={`${
                      autoSkills.eligible ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {autoSkills.reason}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

export default App;
