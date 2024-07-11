import { FastifyPluginCallback } from "fastify";
import {
  vps_power_off,
  get_vps_info,
  vps_power_on,
  vps_action_status,
} from "@/controllers/actions/reboot.controller";
import { FastifyReply, FastifyRequest } from "fastify";
const action_power_off: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.post(
    "/",
    async (
      req: FastifyRequest<{ Body: { vps_id: number } }>,
      reply: FastifyReply
    ) => {
      try {
        const vpsAcount = await get_vps_info(req.body.vps_id);
        // console.log(vpsAcount.vps_id);
        // const all_domain = []
        if (vpsAcount) {
          const data = await vps_power_off(vpsAcount);
          reply.send({
            status: "200",
            message: "vps power off successfully",
            data: data,
          });
        } else {
          console.log("vpsAccount not found");
        }
      } catch (error: any) {
        reply.status(500).send({ status: "error", message: error.message });
      }
    }
  );
  done();
};
const action_power_on: FastifyPluginCallback<{}> = (fastify, options, done) => {
  fastify.post(
    "/",
    async (
      req: FastifyRequest<{ Body: { vps_id: number } }>,
      reply: FastifyReply
    ) => {
      try {
        const vpsAcount = await get_vps_info(req.body.vps_id);
        // const all_domain = []
        if (vpsAcount) {
          const data = await vps_power_on(vpsAcount);
          reply.send({
            status: "200",
            message: "vps power on successfully",
            data: data,
          });
        }
      } catch (error: any) {
        reply.status(500).send({ status: "error", message: error.message });
      }
    }
  );
  done();
};
const action_status: FastifyPluginCallback<{}> = (fastify, options, done) => {
  fastify.post(
    "/",
    async (
      req: FastifyRequest<{ Body: { action_id: number; vps_id: number } }>,
      reply: FastifyReply
    ) => {
      try {
        const vpsAcount = await get_vps_info(req.body.vps_id);
        // const all_domain = []
        if (vpsAcount) {
          const data = await vps_action_status(req.body.action_id, vpsAcount);
          reply.send({
            status: "200",
            message: "check action status successfully",
            data: data,
          });
        }
      } catch (error: any) {
        reply.status(500).send({ status: "error", message: error.message });
      }
    }
  );
  done();
};
export { action_power_off, action_power_on, action_status };
