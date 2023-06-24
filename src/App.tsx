import { useQuery } from "react-query";
import "./App.css";
import * as robotevents from "robotevents";
import { useState } from "react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

const ROBOTEVENTS_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYjM5Y2I1NGNhMTk0OTM0ODNmNTc0MDQ2MTRhZDY0MDZjYTY1ZmQzMjAzNDlhMmM5YmUwOThlNmJjNzhhZWJmZmZjYzU0ZWY2MTQ2ZmQyYjEiLCJpYXQiOjE2ODc2NDIzODcuNTUwMjg4LCJuYmYiOjE2ODc2NDIzODcuNTUwMjkxMSwiZXhwIjoyNjM0NDE3MTg3LjUzNzIzNjIsInN1YiI6Ijk3MDY5Iiwic2NvcGVzIjpbXX0.k0DEt3QRKkgZnyV8X9mDf6VYyc8aOsIEfQbVN4Gi6Csr7O5ILLGFENXZouvplqbcMDdQ8gBMMLg5hIR38RmrTsKcWHMndq1T8wYkGZQfRhc_uZYLQhGQCaanf_F_-gnKocFwT1AKQJmAPkAbV-Itb2UzHeGpNuW8vV_TaNL3coaYvmM6rubwBuNYgyZhTHW_Mgvzh5-XBqqGpmQLm9TGl4gkeqnS-6a5PfoqRTc8v3CQWSCURFry5BA2oXz0lcWmq92FY5crr2KKv1O3chPr--oMba97elY0y9Dw0q2ipKcTm4pE7bbFP8t7-a_RKU4OyXuHRIQXjw3gEDCYXY5Hp22KMY0idnRIPhat6fybxcRfeyzUzdnubRBkDMNklwlgNCyeu2ROqEOYegtu5727Wwvy2I-xW-ZVoXg0rggVu7jVq6zmBqDFIcu50IS9R4P6a244pg2STlBaAGpzT2VfUqCBZrbtBOvdmdNzxSKIkl1AXeOIZOixo1186PX54p92ehXfCbcTgWrQSLuAAg_tBa6T7UFKFOGecVFo3v0vkmE__Q5-701f1qqcdDRNlOG-bzzFh9QLEdJWlpEajwYQ1ZjTAlbnBpKy3IrU0Aa-Jr0aqxtzgr5ZlghNtOcdYYRw5_BN0BOMmAnkvtm0_xzIJSsFbWJQJ8QpPk_n4zKZf-Y";

robotevents.authentication.setBearer(ROBOTEVENTS_TOKEN);

const season = [
  robotevents.seasons.current("VRC")!,
  robotevents.seasons.current("VIQRC")!,
  robotevents.seasons.current("VEXU")!,
];

async function getCurrentEvents() {
  const events = await robotevents.events.search({
    season,
    end: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  });

  return events.filter((ev) => ev.ongoing);
}

async function getEvent(sku: string) {
  if (!sku) {
    return null;
  }

  return await robotevents.events.get(sku);
}

async function getExcellenceEligibility(
  event: robotevents.events.Event | undefined | null
) {
  if (!event) {
    return null;
  }

  const teams = await robotevents.teams.search({
    event: [event.id],
  });

  console.log(teams);

  const rankings = await event.rankings(1);
  const skills = await event.skills({ type: ["programming"] });

  const programmingSkillsLeaderboard = skills
    .array()
    .sort((a, b) => a.score - b.score);

  const rankingsByTeam = rankings.group((r) => r.team.name);
  const skillsByTeam = skills.group((s) => s.team.name);

  const rankingsRequired = Math.ceil(rankings.size * 0.3);
  const skillsRequired = Math.ceil(skills.size * 0.3);
  const programmingSkillsRequired = Math.ceil(
    programmingSkillsLeaderboard.length * 0.3
  );

  const teamEligibility = Object.fromEntries(
    teams.map((team) => {
      const rank = rankingsByTeam[team.number]?.[0]?.rank;
      const skillsRank = skillsByTeam[team.number]?.[0]?.rank;

      const programmingSkillsRank = programmingSkillsLeaderboard.findIndex(
        (s) => s.team.name === team.number
      );

      if (!rank) {
        return [team.number, { eligible: false, reason: "No rank" }];
      }

      if (!skillsRank) {
        return [
          team.number,
          { eligible: false, reason: "No skills score submitted" },
        ];
      }

      if (programmingSkillsRank > programmingSkillsRequired) {
        return [
          team.number,
          {
            eligible: false,
            reason: "Programming skills rank too low",
            rank: programmingSkillsRank,
            required: programmingSkillsRequired,
          },
        ];
      }

      if (rank > rankingsRequired) {
        return [
          team.number,
          {
            eligible: false,
            reason: "Rank too low",
            rank,
            required: rankingsRequired,
          },
        ];
      }

      if (skillsRank > skillsRequired) {
        return [
          team.number,
          {
            eligible: false,
            reason: "Overall skills rank too low",
            rank: skillsRank,
            required: skillsRequired,
          },
        ];
      }

      return [team.number, { eligible: true, reason: "Eligible" }];
    })
  );

  return {
    teamEligibility,
    rankings: rankings.array(),
    skills: skills.array(),
  };
}

function App() {
  const [sku, setSku] = useState("");
  const { data: event } = useQuery(["event", sku], () => getEvent(sku));

  const { data: eligibility } = useQuery(["eligibility", event], () =>
    getExcellenceEligibility(event)
  );

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
            <p className="flex gap-2 items-center font-bold">
              <CheckCircleIcon height={18} className="text-green-400" />
              {event?.name}
            </p>
          )}
        </section>
        <section>
          <pre>
            <code className="text-sm">
              {JSON.stringify(eligibility, null, 2)}
            </code>
          </pre>
        </section>
      </header>
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

export default App;
