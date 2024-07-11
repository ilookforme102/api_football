import {
  getDomainsPerCloudFlare,
  getDomainsPerVPS,
  getSumOfVPS,
  getTotalVPSByEachProvider,
  getTotalWebsitesAndDomains,
  personInChargeWithWebsites,
} from "@/controllers/stats.controller";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const statsRoute: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.addHook("onRequest", checkAuth);
  fastify.get("/web_n_domain", getTotalWebsitesAndDomains);
  fastify.get("/domains_per_acc", getDomainsPerCloudFlare);
  fastify.get("/get-total-vps", getTotalVPSByEachProvider);
  fastify.get("/get-domains-per-vps", getDomainsPerVPS);
  fastify.get("/get-monthly-spend", getSumOfVPS);
  fastify.get("/get-pic-summary", personInChargeWithWebsites);
  done();
};
