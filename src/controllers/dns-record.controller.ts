/**
 * CRUD Request handlers (controllers) for dns record history
 */
import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
import { DnsRecordDto } from "@/dto";

export const getDnsRecords = async (
  req: FastifyRequest<{
    Querystring: {
      page: number;
      per_page: number;
    };
  }>,
  res: FastifyReply
) => {
  try {
    const page = req.query.page || 1;
    const per_page = req.query.per_page || 12;
    const skip = (page - 1) * per_page;
    const [data, count] = await db.$transaction([
      db.dns_record.findMany({
        skip,
        take: per_page,
        where: {
          is_achieved: false,
        },
      }),
      db.dns_record.count({
        where: {
          is_achieved: false,
        },
      }),
    ]);

    res.send({ items: data, page, per_page, total_count: count }).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const createDnsRecord = async (
  req: FastifyRequest<{ Body: DnsRecordDto }>,
  res: FastifyReply
) => {
  try {
    const { name, type, content, proxiable, proxied, domainId } = req.body;
    const dns_record = await db.dns_record.findFirst({
      where: { domainId, is_achieved: true },
    });
    let data = null;

    if (dns_record) {
      data = await db.dns_record.update({
        where: { id: dns_record.id },
        data: {
          name,
          type,
          content,
          proxiable,
          proxied,
          domainId,
          is_achieved: false,
        },
      });
    } else {
      data = await db.dns_record.create({
        data: { name, type, content, proxiable, proxied, domainId },
      });
    }

    res.send(data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const updateDnsRecord = async (
  req: FastifyRequest<{ Body: DnsRecordDto; Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const { name, type, content, proxiable, proxied, domainId } = req.body;
    const updated_data = await db.dns_record.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        type,
        content,
        proxiable,
        proxied,
        domainId,
      },
    });
    res.send(updated_data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const deleteDnsRecord = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const delete_row = await db.dns_record.update({
      where: { id: Number(id) },
      data: {
        is_achieved: true,
      },
    });
    res.send(delete_row).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};
