import * as robotevents from "robotevents";
import { UseQueryResult, useQuery } from "react-query";
import { Grade } from "robotevents/out/endpoints/teams";
import { Skill } from "robotevents/out/endpoints/skills";
import { Award } from "robotevents/out/endpoints/award";
import { Ranking } from "robotevents/out/endpoints/rankings";

const ROBOTEVENTS_TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzIiwianRpIjoiYjM5Y2I1NGNhMTk0OTM0ODNmNTc0MDQ2MTRhZDY0MDZjYTY1ZmQzMjAzNDlhMmM5YmUwOThlNmJjNzhhZWJmZmZjYzU0ZWY2MTQ2ZmQyYjEiLCJpYXQiOjE2ODc2NDIzODcuNTUwMjg4LCJuYmYiOjE2ODc2NDIzODcuNTUwMjkxMSwiZXhwIjoyNjM0NDE3MTg3LjUzNzIzNjIsInN1YiI6Ijk3MDY5Iiwic2NvcGVzIjpbXX0.k0DEt3QRKkgZnyV8X9mDf6VYyc8aOsIEfQbVN4Gi6Csr7O5ILLGFENXZouvplqbcMDdQ8gBMMLg5hIR38RmrTsKcWHMndq1T8wYkGZQfRhc_uZYLQhGQCaanf_F_-gnKocFwT1AKQJmAPkAbV-Itb2UzHeGpNuW8vV_TaNL3coaYvmM6rubwBuNYgyZhTHW_Mgvzh5-XBqqGpmQLm9TGl4gkeqnS-6a5PfoqRTc8v3CQWSCURFry5BA2oXz0lcWmq92FY5crr2KKv1O3chPr--oMba97elY0y9Dw0q2ipKcTm4pE7bbFP8t7-a_RKU4OyXuHRIQXjw3gEDCYXY5Hp22KMY0idnRIPhat6fybxcRfeyzUzdnubRBkDMNklwlgNCyeu2ROqEOYegtu5727Wwvy2I-xW-ZVoXg0rggVu7jVq6zmBqDFIcu50IS9R4P6a244pg2STlBaAGpzT2VfUqCBZrbtBOvdmdNzxSKIkl1AXeOIZOixo1186PX54p92ehXfCbcTgWrQSLuAAg_tBa6T7UFKFOGecVFo3v0vkmE__Q5-701f1qqcdDRNlOG-bzzFh9QLEdJWlpEajwYQ1ZjTAlbnBpKy3IrU0Aa-Jr0aqxtzgr5ZlghNtOcdYYRw5_BN0BOMmAnkvtm0_xzIJSsFbWJQJ8QpPk_n4zKZf-Y";

robotevents.authentication.setBearer(ROBOTEVENTS_TOKEN);

export function useEvent(sku: string) {
  return useQuery(["event", sku], async () => {
    if (!sku) {
      return null;
    }

    return await robotevents.events.get(sku);
  });
}

export type EventExcellenceAwards = {
  grade: "Overall" | Grade;
  award: Award;
};

export function useEventExcellenceAwards(
  event: robotevents.events.Event | null | undefined
): UseQueryResult<EventExcellenceAwards[] | null> {
  return useQuery(["excellence_awards", event?.sku], async () => {
    if (!event) {
      return null;
    }

    const awards = await event.awards();

    const excellenceAwards = awards
      .array()
      .filter((a) => a.title.includes("Excellence Award"));

    if (excellenceAwards.length === 0) {
      return [];
    }

    if (excellenceAwards.length < 2) {
      return [
        {
          grade: "Overall" as Grade | "Overall",
          award: excellenceAwards[0],
        },
      ];
    }

    const grades = [
      "College",
      "High School",
      "Middle School",
      "Elementary School",
    ] as Grade[];

    return excellenceAwards.map((award) => {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const grade = grades.find((g) => award.title.includes(g))!;
      return { grade, award };
    });
  });
}

export type EventTeams = {
  overall: robotevents.teams.Team[];
  grades: Partial<Record<Grade, robotevents.teams.Team[]>>;
};

export function useEventTeams(
  event: robotevents.events.Event | null | undefined
): UseQueryResult<EventTeams> {
  return useQuery(["teams", event?.sku], async () => {
    if (!event) {
      return { overall: [], grades: {} };
    }

    const teams = await event.teams({ registered: true });
    const grades = teams.group((t) => t.grade);

    return { overall: teams.array(), grades };
  });
}

export type EventRankings = {
  overall: Ranking[];
  grades: Partial<Record<Grade, Ranking[]>>;
};

export function useEventRankings(
  event: robotevents.events.Event | null | undefined,
  division: number
): UseQueryResult<EventRankings> {
  const { data: teams } = useEventTeams(event);

  return useQuery(["rankings", event?.sku, teams], async () => {
    if (!event || !teams) {
      return { overall: [], grades: {} };
    }

    const rankings = await event.rankings(division);
    let grades = rankings.group(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (r) => teams.overall.find((t) => t.id === r.team.id)!.grade
    );

    grades = Object.fromEntries(
      Object.entries(grades).map(([grade, rankings]) => {
        return [grade, rankings.sort((a, b) => a.rank - b.rank)];
      })
    );

    return {
      overall: rankings.array().sort((a, b) => a.rank - b.rank),
      grades,
    };
  });
}

export type TeamRecord = {
  driver: Skill | null;
  programming: Skill | null;
  overall: number;
};

export type EventSkills = {
  teamSkills: Record<string, TeamRecord>;
  overall: TeamRecord[];
  grades: Partial<Record<Grade, TeamRecord[]>>;
};

export function useEventSkills(
  event: robotevents.events.Event | null | undefined
): UseQueryResult<EventSkills> {
  const { data: teams } = useEventTeams(event);

  return useQuery(["skills", event?.sku, teams], async () => {
    if (!event || !teams) {
      return { overall: [] as TeamRecord[], grades: {}, teamSkills: {} };
    }

    const skills = await event.skills();

    const teamSkills: Record<string, TeamRecord> = {};
    const skillsOverall: TeamRecord[] = [];
    const grades: Partial<Record<Grade, TeamRecord[]>> = {};

    for (const team of teams.overall) {
      const driver =
        skills.find((s) => s.team.id === team.id && s.type === "driver") ??
        null;
      const programming =
        skills.find((s) => s.team.id === team.id && s.type === "programming") ??
        null;
      const overall = (driver?.score ?? 0) + (programming?.score ?? 0);

      const record = {
        driver,
        programming,
        overall,
      };

      teamSkills[team.number] = record;
      skillsOverall.push(record);

      if (!grades[team.grade]) {
        grades[team.grade] = [];
      }
      grades[team.grade]?.push(record);
    }

    return {
      teamSkills,
      overall: skillsOverall.sort((a, b) => b.overall - a.overall),
      grades: Object.fromEntries(
        Object.entries(grades).map(([grade, skills]) => [
          grade,
          skills.sort((a, b) => b.overall - a.overall),
        ])
      ),
    };
  });
}

export function useEventsToday(): UseQueryResult<robotevents.events.Event[]> {
  const currentSeasons = (["V5RC", "VURC", "VIQRC"] as const).map((program) =>
    robotevents.seasons.current(program)
  ) as number[];

  return useQuery("events_today", async () => {
    const today = new Date();

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 3);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 3);

    const events = await robotevents.events.search({
      start: yesterday.toISOString(),
      end: tomorrow.toISOString(),
      season: currentSeasons,
    });

    return events.sort((a, b) => a.name.localeCompare(b.name));
  });
}
