import { FastifyReply, FastifyRequest } from "fastify";
import { FastifyPluginCallback } from "fastify";
import { get_all_vps_accounts, fetch_vps} from "@/controllers/vps.cron.controller";




const vps_account_route_cron: FastifyPluginCallback<{}> = 
(fastify, options, done) => {
  fastify.get(
    '/',
     async (
      req: FastifyRequest<{ Querystring:{ page: number; per_page: number; } }>, 
        reply:FastifyReply) => {
          try {
                const VPSs = await get_all_vps_accounts();
                if(VPSs) {
                  for (const vps_account of VPSs) {
                    await fetch_vps(vps_account);
                   }
              
                }
                reply.send({ status: '200', message: 'all_vps_fetched_successfully'});
          } catch (error:any) {
            reply.status(500).send({ status: 'error', message: error.message });
          }
  });
  done();
};
export { vps_account_route_cron };
