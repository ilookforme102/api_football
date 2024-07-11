import { FastifyPluginCallback } from "fastify";
import { FastifyReply, FastifyRequest } from "fastify";
import { get_domain_cf_info } from "@/controllers/domain-subdomain.cron.controller";
import { get_domain_redirect_history } from "@/controllers/redirected-domain.cron.controller";
//   const cf_account_route: FastifyPluginCallback<{}> = (fastify, options, done) => {
//     fastify.get('/', async (req: FastifyRequest<{ Querystring: { page: number; per_page: number; } }>, reply) => {
//       const email = process.env.X_AUTH_EMAIL as string;
//       const key = process.env.X_AUTH_KEY as string;
//       await get_all_domain_from_cf(req, reply, email, key);
//     });
//     done();
//   };
// export { cf_account_route };

const redirect_domain_cron_route: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.get(
    "/",
    async (
      req: FastifyRequest<{ Querystring: { page: number; per_page: number } }>,
      reply: FastifyReply
    ) => {
      try {
        const delay = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));
        const DOMAINS = await get_domain_cf_info();
        // const all_domain = []
        if (DOMAINS) {
          for (const domain of DOMAINS) {
            await get_domain_redirect_history(domain, reply);
            await delay(4000);
          }
          reply.send({
            status: "200",
            message: "all domains redirect rules fetched successfully",
          });
        }
      } catch (error: any) {
        reply.status(500).send({ status: "error", message: error.message });
      }
    }
  );
  done();
};
export { redirect_domain_cron_route };
