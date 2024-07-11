/**
 * CRUD Request handlers (controllers) for domain
 */
import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
import { DomainDto } from "@/dto/domain.dto";
// Define funtion to get data from cloudflare
export const get_all_domain_from_cf = async (
  req: FastifyRequest<{
    Querystring: {
      page: number;
      per_page: number;
    };
  }>,
  reply: FastifyReply,
  email: string,
  key: string
) => {
  try {
    const page = req.query.page || 1;
    const per_page = req.query.per_page || 12;
    const url = `https://api.cloudflare.com/client/v4/zones?page=${page}&per_page=${per_page}`;
    const response = await fetch(url, {
      headers: {
        "X-Auth-Email": email,
        "X-Auth-Key": key,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    reply.code(200).send(data);
  } catch (error) {
    reply.code(500).send({ error: "Failed to fetch data" });
  }
};

export const getDomains = async (
  req: FastifyRequest<{
    Querystring: {
      page: number;
      per_page: number;
      search: string;
      acc: string;
    };
  }>,
  res: FastifyReply
) => {
  try {
    const page = req.query.page || 1;
    const per_page = req.query.per_page || 12;
    const search = req.query.search;
    const acc = req.query.acc;
    const skip = (page - 1) * per_page;
    const [data, count] = await db.$transaction([
      db.domain.findMany({
        skip,
        take: per_page,
        where: {
          is_achieved: false,
          ...(search && {
            domain: { contains: search },
          }),
          ...(acc && {
            cf_account_email: {
              contains: acc,
            },
          }),
        },
      }),
      db.domain.count({
        where: {
          is_achieved: false,
          ...(search && {
            domain: { contains: search },
          }),
          ...(acc && {
            cf_account_email: {
              contains: acc,
            },
          }),
        },
      }),
    ]);

    res.send({ items: data, page, per_page, total_count: count }).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const getDomainInfoById = async (
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const domain = await db.domain.findUnique({
      where: { row_id: Number(id) },
      include: {
        dns_records: true,
        redirected_domains: true,
        pics: {
          where: {
            is_achieved: false,
          },
          include: {
            pic: {
              select: {
                team: true,
                username: true,
              },
            },
          },
        },
      },
    });

    //Get vps id from content of record
    const vps_ids = [];
    if (domain?.dns_records && domain?.dns_records?.length > 0) {
      for (let index = 0; index < domain?.dns_records?.length; index++) {
        const record = domain?.dns_records[index];
        const vps = await db.vps.findFirst({
          where: { ipv4_public: record.content },
          select: {
            id: true,
          },
        });
        vps_ids.push(vps);
      }
    }

    res.send({ domain, vps_ids });
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const createDomain = async (
  req: FastifyRequest<{ Body: DomainDto }>,
  res: FastifyReply
) => {
  try {
    const { cf_account_email, id, domain, name_servers, hosted_vps_id } =
      req.body;
    const domain_data = await db.domain.findFirst({
      where: { id, is_achieved: true },
    });
    let data = null;

    if (domain_data) {
      data = await db.domain.update({
        where: { row_id: domain_data.row_id },
        data: {
          cf_account_email,
          id,
          domain,
          name_servers,
          hosted_vps_id,
          is_achieved: false,
        },
      });
    } else {
      data = await db.domain.create({
        data: { cf_account_email, id, domain, name_servers, hosted_vps_id },
      });
    }

    res.send(data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const updateDomain = async (
  req: FastifyRequest<{ Body: DomainDto; Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const { cf_account_email, domain, name_servers, hosted_vps_id } = req.body;
    const updated_team = await db.domain.update({
      where: {
        row_id: Number(id),
      },
      data: {
        cf_account_email,
        domain,
        name_servers,
        hosted_vps_id,
      },
    });
    res.send(updated_team).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const deleteDomain = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const delete_row = await db.domain.update({
      where: { id },
      data: {
        is_achieved: true,
      },
    });
    res.send(delete_row).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const getSubdomainsByDomainId = async (
  req: FastifyRequest<{
    Params: {
      id: string;
    };
  }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const domainWithSubdomain = await db.sub_domain.findMany({
      where: {
        row_id: Number(id),
        is_achieved: false,
      },
    });

    return res.send(domainWithSubdomain).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};
