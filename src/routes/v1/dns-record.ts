import {
  createDnsRecord,
  deleteDnsRecord,
  getDnsRecords,
  updateDnsRecord,
} from "@/controllers";
import { DnsRecordDto, dnsRecordSchema } from "@/dto";
import { checkAuth } from "@/middleware/auth.middleware";
import { FastifyPluginCallback } from "fastify";

export const dnsRecordRoute: FastifyPluginCallback<{}> = (
  fastify,
  options,
  done
) => {
  fastify.addHook("onRequest", checkAuth);
  fastify.post<{ Body: DnsRecordDto }>(
    "/",
    {
      ...options,
      schema: {
        body: dnsRecordSchema,
      },
    },
    createDnsRecord
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
    getDnsRecords
  );
  fastify.put("/:id", updateDnsRecord);
  fastify.delete("/:id", deleteDnsRecord);
  done();
};
