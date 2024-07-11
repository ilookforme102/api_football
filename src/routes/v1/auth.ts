import { login, logout } from "@/controllers";
import { LoginDto, loginSchema } from "@/dto";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const authRoute: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.get("/logout", logout);
  fastify.post<{
    Body: LoginDto;
  }>(
    "/login",
    {
      ...options,
      schema: {
        body: loginSchema,
      },
    },
    login
  );
  done();
};
