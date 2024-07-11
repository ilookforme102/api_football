import { db } from "../utils";
import { FastifyReply, FastifyRequest } from "fastify";

export const checkAuth = async (req: FastifyRequest, res: FastifyReply) => {
  const username = (req.session as any).get("username");
  if (!username) {
    return res.code(401).send({
      message: "Unauthenticated!",
    });
  }
  const user = await db.user.findUnique({
    where: {
      username,
    },
  });
  if (!user) {
    return res
      .send({
        message: "Unauthenticated!",
      })
      .code(401);
  }
};
