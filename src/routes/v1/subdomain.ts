import {
  deleteSubdomain,
  getSubdomains,
  updateSubdomain,
} from "@/controllers/sub-domain.controller";
import { SubdomainDto, subdomainSchema } from "@/dto";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const subdomainRoute: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.addHook("onRequest", checkAuth);

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
    getSubdomains
  );
  fastify.put("/:id", updateSubdomain);
  fastify.delete("/:id", deleteSubdomain);
  done();
};
