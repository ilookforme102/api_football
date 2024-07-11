export interface TeamDto {
  team_name: string;
}

export const teamSchema = {
  type: "object",
  required: ["team_name"],
  properties: {
    team_name: { type: "string" },
  },
};
