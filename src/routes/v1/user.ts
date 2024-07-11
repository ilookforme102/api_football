import {
  changePassword,
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "@/controllers";
import { UserDto, userSchema } from "@/dto";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const userRoute: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.addHook("onRequest", checkAuth);
  fastify.post<{ Body: UserDto }>(
    "/",
    {
      ...options,
      schema: {
        body: userSchema,
      },
    },
    createUser
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
    getUsers
  );
  fastify.put("/password/:id", changePassword);
  fastify.put("/:id", updateUser);
  fastify.delete("/:id", deleteUser);
  done();
};
