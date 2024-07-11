import {
  createVps,
  deleteVps,
  getVPSById,
  getVpses,
  updateVps,
} from "@/controllers/vps.controller";
import { VPSDto, vpsSchema } from "@/dto/vps.dto";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const vpsRoute: FastifyPluginCallback<{}> = (fastify, options, done) => {
  fastify.addHook("onRequest", checkAuth);
  fastify.post<{ Body: VPSDto }>(
    "/",
    {
      ...options,
      schema: {
        body: vpsSchema,
      },
    },
    createVps
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
    getVpses
  );
  fastify.get("/:id", getVPSById);
  fastify.put("/:id", updateVps);
  fastify.delete("/:id", deleteVps);
  done();
};
