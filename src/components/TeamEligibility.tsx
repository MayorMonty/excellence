import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { Team } from "robotevents/out/endpoints/teams";

export type TeamEligibilityCriterion = {
  eligible: boolean;
  reason: string;
  rank: number;
};

export type TeamEligibility = {
  eligible: boolean;
  team: Team;
  ranking: TeamEligibilityCriterion;
  autoSkills: TeamEligibilityCriterion & { score: number };
  skills: TeamEligibilityCriterion & { score: number };
};

export const TeamEligibilityRow: React.FC<TeamEligibility> = ({
  eligible,
  autoSkills,
  ranking,
  skills,
  team,
}) => {
  return (
    <tr key={team.id}>
      <td className="mt-4 md:mt-0 block md:table-cell">
        {eligible ? (
          <CheckCircleIcon height={18} className="inline text-green-400" />
        ) : (
          <XCircleIcon height={18} className="inline text-red-400" />
        )}
        <span
          title={`${team.program.code} ${team.number} - ${team.team_name}`}
          className={`ml-2 font-mono px-2 rounded-md ${
            eligible ? "bg-green-400 text-black" : "bg-transparent"
          }`}
        >
          {team.number}
        </span>
      </td>

      <td className="text-gray-400 block md:table-cell">
        <span
          className={`${ranking.eligible ? "text-green-400" : "text-red-400"}`}
        >
          {ranking.reason}
        </span>
      </td>
      <td className="text-gray-400 block md:table-cell">
        <span
          className={`${skills.eligible ? "text-green-400" : "text-red-400"}`}
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
};

export type TeamEligibilityTableProps = {
  teams: TeamEligibility[];
};

export const TeamEligibilityTable: React.FC<TeamEligibilityTableProps> = ({
  teams,
}) => {
  return (
    <table className="w-full mt-4">
      <thead className="text-left sr-only md:not-sr-only">
        <tr>
          <th>Team</th>
          <th>Qualification Rank</th>
          <th>Overall Skills Rank</th>
          <th>Autonomous Coding Skills</th>
        </tr>
      </thead>
      <tbody>
        {teams.map((team) => (
          <TeamEligibilityRow key={team.team.id} {...team} />
        ))}
      </tbody>
    </table>
  );
};
