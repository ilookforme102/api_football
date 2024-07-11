import { FastifyPluginCallback } from "fastify";
import {get_domain_cf_info,get_sub_domain_table} from "@/controllers/domain-subdomain.cron.controller";
import { FastifyReply, FastifyRequest } from "fastify";

//   const cf_account_route: FastifyPluginCallback<{}> = (fastify, options, done) => {
//     fastify.get('/', async (req: FastifyRequest<{ Querystring: { page: number; per_page: number; } }>, reply) => {
//       const email = process.env.X_AUTH_EMAIL as string;
//       const key = process.env.X_AUTH_KEY as string;
//       await get_all_domain_from_cf(req, reply, email, key);
//     });
//     done();
//   };
// export { cf_account_route };

const domain_subdomain_cron_route: FastifyPluginCallback<{}> = 
(fastify, options, done) => {
  fastify.get(
    '/',
     async (
      req: FastifyRequest<{ Querystring:{ page: number; per_page: number; } }>, 
        reply:FastifyReply) => {
          try {
            const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            const DOMAINS = await get_domain_cf_info();
            // const all_domain = []
            if(DOMAINS) {
              for (const domain of DOMAINS) {
                await get_sub_domain_table(domain, reply);
                await delay(4200);
              }
            reply.send({ status: '200', message: 'all_domains_fetched_successfully'});
            }
            
          } catch (error:any) {
            reply.status(500).send({ status: 'error', message: error.message });
          }
  });
  done();
};
export { domain_subdomain_cron_route };
