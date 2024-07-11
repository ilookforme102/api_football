import { FastifyPluginCallback } from "fastify";
import { FastifyReply, FastifyRequest } from "fastify";

// Define funtion to get data from cloudflare
const get_all_account = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const response = await fetch("https://api.cloudflare.com/client/v4/zones", {
      headers: {
        "X-Auth-Email": process.env.X_AUTH_EMAIL as string,
        "X-Auth-Key": process.env.X_AUTH_KEY as string,
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    reply.code(200).send(data);
  } catch (error) {
    reply.code(500).send({ error: "Failed to fetch data" });
  }
};

const account_route: FastifyPluginCallback<{}> = (fastify, options, done) => {
  fastify.get("/fetch_account", options, get_all_account);
  done();
};
export { account_route };
