import { createPic, deletePic, updatePic } from "@/controllers";
import { PIC, picSchema } from "@/dto/pic.dto";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const picRoute: FastifyPluginCallback<{}> = (fastify, options, done) => {
  fastify.addHook("onRequest", checkAuth);

  fastify.post<{ Body: PIC }>(
    "/",
    {
      ...options,
      schema: {
        body: picSchema,
      },
    },
    createPic
  );
  fastify.put("/:id", updatePic);
  fastify.delete("/:id", deletePic);
  done();
};
