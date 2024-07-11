import {
  createDomain,
  deleteDomain,
  getDomainInfoById,
  getDomains,
  getSubdomainsByDomainId,
  updateDomain,
} from "@/controllers";
import { DomainDto, domainSchema } from "@/dto/domain.dto";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const domainRoute: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.addHook("onRequest", checkAuth);

  fastify.post<{ Body: DomainDto }>(
    "/",
    {
      ...options,
      schema: {
        body: domainSchema,
      },
    },
    createDomain
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
    getDomains
  );

  fastify.get(
    "/subdomains/:id",
    {
      schema: {
        params: {
          id: { type: "string" },
        },
      },
    },
    getSubdomainsByDomainId
  );

  fastify.get("/:id", getDomainInfoById);
  fastify.put("/:id", updateDomain);
  fastify.delete("/:id", deleteDomain);
  done();
};
