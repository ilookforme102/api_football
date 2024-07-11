import { createTeam, deleteTeam, getTeams, updateTeam } from "@/controllers";
import { TeamDto, teamSchema } from "@/dto";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const teamRoute: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.addHook("onRequest", checkAuth);
  fastify.post<{ Body: TeamDto }>(
    "/",
    {
      ...options,
      schema: {
        body: teamSchema,
      },
    },
    createTeam
  );

  fastify.get(
    "/",
    {
      schema: {
        querystring: {
          page: { type: "number" },
          per_page: { type: "number" },
        },
      },
    },
    getTeams
  );
  fastify.put("/:id", updateTeam);
  fastify.delete("/:id", deleteTeam);
  done();
};
