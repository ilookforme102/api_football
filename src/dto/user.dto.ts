export interface UserDto {
  username: string;
  password: string;
  team_id: number;
}

export interface LoginDto {
  username: string;
  password: string;
}

export const userSchema = {
  type: "object",
  required: ["username", "password", "team_id"],
  properties: {
    username: { type: "string" },
    password: { type: "string" },
    team_id: { type: "number" },
  },
};

export const loginSchema = {
  type: "object",
  required: ["username", "password"],
  properties: {
    username: { type: "string" },
    password: { type: "string" },
  },
};
