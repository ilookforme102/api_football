import { FastifyPluginCallback } from "fastify";
// import {
//     get_all_cf_accounts,fetchAllDomains
//   } from "@/controllers";
import { get_all_cf_accounts,fetchAllDomains } from "@/controllers/account.cron.controller";
  
import { FastifyReply, FastifyRequest } from "fastify";
import { get } from "http";

//   const cf_account_route: FastifyPluginCallback<{}> = (fastify, options, done) => {
//     fastify.get('/', async (req: FastifyRequest<{ Querystring: { page: number; per_page: number; } }>, reply) => {
//       const email = process.env.X_AUTH_EMAIL as string;
//       const key = process.env.X_AUTH_KEY as string;
//       await get_all_domain_from_cf(req, reply, email, key);
//     });
//     done();
//   };
// export { cf_account_route };

const cf_account_route: FastifyPluginCallback<{}> = 
(fastify, options, done) => {
  fastify.get(
    '/',
     async (
      req: FastifyRequest<{ Querystring:{ page: number; per_page: number; } }>, 
        reply:FastifyReply) => {
          try {
            const ACCOUNTS = await get_all_cf_accounts();
            // const all_domain = []
            if(ACCOUNTS) {
              for (const account of ACCOUNTS) {
                await fetchAllDomains(account);
               
              }
          
            }
            reply.send({ status: '200', message: 'all_domains_fetched_successfully'});
          } catch (error:any) {
            reply.status(500).send({ status: 'error', message: error.message });
          }
  });
  done();
};
export { cf_account_route };
