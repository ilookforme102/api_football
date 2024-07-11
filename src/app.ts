import Fastify, { FastifyInstance } from "fastify";
import { account_route } from "@/routes/v1/account";
import fastifySession from "@fastify/secure-session";
import dotenv from "dotenv";
import { teamRoute } from "./routes/v1/team";
import { userRoute } from "./routes/v1/user";
import { authRoute } from "./routes/v1/auth";
import { domainRoute } from "./routes/v1/domain";
import { dnsRecordRoute } from "./routes/v1/dns-record";
import { redirectDomainRoute } from "./routes/v1/redirect";
import { subdomainRoute } from "./routes/v1/subdomain";
import { vpsRoute } from "./routes/v1/vps";
import { cf_account_route } from "./routes/cron/domain.cron";
import cors from "@fastify/cors";
import { picRoute } from "./routes/v1/pic";
import { vps_account_route_cron } from "./routes/cron/vps_account";
import { domain_subdomain_cron_route } from "./routes/cron/domain-subdomain.cron";
import { statsRoute } from "./routes/v1/stats";
import { redirect_domain_cron_route } from "./routes/cron/redirect-domain.cron";
import {
  action_power_off,
  action_power_on,
  action_status,
} from "./routes/v1/actions/vps_reboot";

//Load environment
dotenv.config();

const fastify: FastifyInstance = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: ["http://localhost:3000", "https://vps1.168dev.com"], // Allow all origins
  credentials: true,
});

fastify.register(fastifySession, {
  expiry: 7 * 24 * 60 * 60 * 1000, // Default 1 day
  secret: process.env.SECRETE || "",
  cookie: {
    httpOnly: true,
    secure: false,
    path: "/",
  },
} as any);

const api_v1 = "/api/v1";
const api_cron = "/api/cron";
const api_action = "/api/v1/action";
fastify.register(redirect_domain_cron_route, {
  prefix: `${api_cron}/redirect-domain-cron`,
});
fastify.register(action_power_off, { prefix: `${api_action}/power-off` });
fastify.register(action_power_on, { prefix: `${api_action}/power-on` });
fastify.register(action_status, { prefix: `${api_action}/status` });
fastify.register(domain_subdomain_cron_route, {
  prefix: `${api_cron}/domain-subdomain-cron`,
});
fastify.register(vps_account_route_cron, {
  prefix: `${api_cron}/vps-account-cron`,
});
fastify.register(cf_account_route, { prefix: `${api_cron}/cf-account` });
fastify.register(account_route, { prefix: `${api_v1}/account` });
fastify.register(teamRoute, { prefix: `${api_v1}/team` });
fastify.register(userRoute, { prefix: `${api_v1}/user` });
fastify.register(authRoute, { prefix: `${api_v1}/auth` });
fastify.register(domainRoute, { prefix: `${api_v1}/domain` });
fastify.register(dnsRecordRoute, { prefix: `${api_v1}/dns-record` });
fastify.register(redirectDomainRoute, { prefix: `${api_v1}/redirect-domain` });
fastify.register(subdomainRoute, { prefix: `${api_v1}/subdomain` });
fastify.register(vpsRoute, { prefix: `${api_v1}/vps` });
fastify.register(picRoute, { prefix: `${api_v1}/pic` });
fastify.register(statsRoute, { prefix: `${api_v1}/stats` });

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: Number(process.env.PORT) || 5000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

