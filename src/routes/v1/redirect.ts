import {
  createRedirectDomain,
  deleteRedirectDomain,
  getRedirectDomains,
  updateRedirectDomain,
} from "@/controllers";
import { RedirectDto, redirectDomainSchema } from "@/dto";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const redirectDomainRoute: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.addHook("onRequest", checkAuth);

  fastify.post<{ Body: RedirectDto }>(
    "/",
    {
      ...options,
      schema: {
        body: redirectDomainSchema,
      },
    },
    createRedirectDomain
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
    getRedirectDomains
  );
  fastify.put("/:id", updateRedirectDomain);
  fastify.delete("/:id", deleteRedirectDomain);
  done();
};
