import "./App.css";
import { useState } from "react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/solid";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import {
  useEvent,
  useEventExcellenceAwards,
  useEventRankings,
  useEventSkills,
  useEventTeams,
  useEventTeamsByDivision,
  useEventsToday,
} from "./util/eventHooks";
import AwardEvaluation from "./components/AwardEvaluation";

function App() {
  const [sku, setSku] = useState("");

  const {
    data: event,
    isLoading: isLoadingEvent,
    isFetched: isFetchedEvent,
  } = useEvent(sku);

  const {
    data: divisionTeams,
    isLoading: isLoadingTeams,
    isFetched: isFetchedTeams,
  } = useEventTeamsByDivision(event);

  const {
    data: eventTeams,
    isLoading: isLoadingEventTeams,
    isFetched: isFetchedEventTeams,
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
    isLoadingEventTeams ||
    isLoadingRankings ||
    isLoadingSkills;

  const isFetched =
    isFetchedEvent &&
    isFetchedAwards &&
    isFetchedTeams &&
    isFetchedEventTeams &&
    isFetchedRankings &&
    isFetchedSkills &&
    sku.length > 0;

  const hasExcellence = awards && awards.length > 0;

  const displayEvaluation = isFetched && hasExcellence;

  return (
    <>
      <header>
        <h1 className="text-3xl mb-4 text-center">Excellence Eligibility</h1>
        <section className="mt-8">
          <p>
            The{" "}
            <a
              href="https://kb.roboticseducation.org/hc/en-us/articles/4912455338391-Guide-to-Judging-Awards#excellence-award-NsmlA"
              target="_blank"
              rel="noopener noreferrer"
            >
              Guide to Judging
            </a>{" "}
            for the 2024-2025 season states that the following conditions must
            be met for a team to be eligible for the Excellence Award:
          </p>
          <ol className="list-decimal m-4">
            <li>
              Be at or near the top of all Engineering Notebook Rubric rankings
              with a Fully Developed Notebook. The absolute minimum for a
              notebook to be considered Fully Developed is scores of two or
              higher for the first four criteria of the rubric, outlining the
              initial design process of a single iteration.
            </li>
            <li>
              Both the Team Interview and Engineering Notebook demonstrate
              independent inquiry from the beginning stages of their design
              process through execution.
            </li>
            <li>Be a candidate in consideration for other Judged Awards.</li>
            <li>Demonstrate a student-centered ethos.</li>
            <li>
              Exhibit positive team conduct, good sportsmanship, and
              professionalism.
            </li>
            <li>
              The Engineering Notebook is consistent with the qualities
              demonstrated in the team interview and robot design.
            </li>
            <li>
              At the conclusion of Qualification Matches, be ranked in the top
              40% of teams* at the event in Qualification Match rankings.
            </li>
            <li>
              At the conclusion of the Robot Skills Challenge matches, be ranked
              in the top 40% of teams* at the event.
            </li>
          </ol>
          <details className="bg-zinc-900 rounded-md mb-2 p-2">
            <summary className="m-2">
              <span className="ml-2">Blended Events</span>
            </summary>
            <p>
              For events with a single Excellence Award, percentages are based
              on the number of teams at the event. For blended grade level
              events with two grade specific Excellence Awards, percentages are
              based on the teams in each grade level for each award.
            </p>
            <ul className="list-disc m-4">
              <li>
                Under certain conditions, at “blended” events which combine both
                grade levels (middle school and high school for V5RC, elementary
                school and middle school for VIQRC, and high school and
                university for VAIRC), one Excellence Award per grade level may
                be awarded. This is determined by the Qualifying Criteria. In
                the instance of two grade level specific Excellence Awards being
                given out at an event, teams are only compared to teams of the
                same grade level. This includes quantitative event data, such as
                rankings. When only one Excellence Award is given out for an
                event with multiple grade levels, all teams are considered
                together without regard for their grade level.
              </li>
              <li>
                For example, in a 24-team blended event with a single Excellence
                Award, 40% of 24 teams would be 9.6, which rounds up to 10
                teams. To be eligible for Excellence, a team would need to be
                ranked in the top 10 in the event for the above performance
                metrics to be eligible for the Excellence Award. If the event
                had 12 teams of each grade level, thus meeting the requirements
                for two grade level specific Excellence Awards, then 40% of 12
                teams comes out to 4.8, which rounds up to 5. In this instance,
                teams would need to be ranked 5th place or higher within their
                grade level in the above performance metrics to be eligible for
                the grade level specific Excellence Award.
              </li>
            </ul>
          </details>

          <p>
            The purpose of this utility is to help Judges quickly determine
            which teams are currently eligible for the Excellence Award at their
            event.
          </p>
          <p className="mt-4">
            Disclaimer: This utility is designed to assist Judges at an event.
            Competitors, please remember that judges consider many other factors
            when making decisions besides what can be automatically checked.{" "}
            <em>
              As always, be mindful of &lt;G1&gt; and the REC Foundation Code of
              Conduct.
            </em>
          </p>
          <p className="mt-4">
            To begin, enter your Event Code below (looks like RE-VRC-XX-XXXX).
          </p>
        </section>
        <section className="flex lg:items-center gap-4 lg:flex-row flex-col mt-4">
          <select
            className="px-4 py-4 rounded-md bg-zinc-900 flex-1"
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
            pattern="RE-(VRC|V5RC|VURC|VIQRC|VEXU|VIQC)-[0-9]{2}-[0-9]{4}"
            placeholder="SKU"
            className="font-mono px-4 py-4 rounded-md invalid:bg-red-500 bg-zinc-900"
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
              className="inline mr-2 text-yellow-400"
            />
            <span className="text-yellow-400">
              This event has multiple divisions.{" "}
            </span>
            <span>
              This utility evaluates qualification rankings individually for
              each combination of division and grade level. Some events with
              multiple divisions may have different rules for Excellence Award
              eligibility.
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
          divisionTeams &&
          eventTeams &&
          rankings &&
          skills &&
          awards?.map((excellence) => (
            <>
              {event?.divisions.map((division) => (
                <AwardEvaluation
                  key={excellence.award.id + division.id}
                  event={event}
                  divisionTeams={divisionTeams}
                  eventTeams={eventTeams}
                  rankings={rankings}
                  division={division.id}
                  skills={skills}
                  excellence={excellence}
                />
              ))}
              <hr className="mt-4" />
            </>
          ))}
      </main>
    </>
  );
}

export default App;
