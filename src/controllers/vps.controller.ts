/**
 * CRUD Request handlers (controllers) for dns record history
 */
import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
import { VPSDto } from "@/dto/vps.dto";

export const getVpses = async (
  req: FastifyRequest<{
    Querystring: {
      page: number;
      per_page: number;
      search: string;
    };
  }>,
  res: FastifyReply
) => {
  try {
    const page = req.query.page || 1;
    const per_page = req.query.per_page || 12;
    const skip = (page - 1) * per_page;
    const search = req.query.search;
    const [data, count] = await db.$transaction([
      db.vps.findMany({
        skip,
        take: per_page,
        select: {
          id: true,
          ipv4_private: true,
          ipv4_public: true,
        },
        where: {
          is_achieved: false,
          ...(search && {
            ipv4_public: { contains: search },
          }),
        },
      }),
      db.vps.count({
        where: {
          is_achieved: false,
          ...(search && {
            ipv4_public: { contains: search },
          }),
        },
      }),
    ]);

    res.send({ items: data, page, per_page, total_count: count }).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const createVps = async (
  req: FastifyRequest<{ Body: VPSDto }>,
  res: FastifyReply
) => {
  try {
    const {
      disk,
      ipv4_public,
      ipv4_private,
      ipv6,
      memory,
      operating_system,
      price_hourly,
      price_monthly,
      region,
      region_slug,
      status,
      vcpu,
    } = req.body;
    const existingData = await db.vps.findFirst({
      where: {
        is_achieved: true,
        ipv4_public,
      },
    });
    let data = null;
    if (existingData) {
      data = await db.vps.update({
        where: {
          id: existingData.id,
        },
        data: {
          disk,
          ipv4_public,
          ipv4_private,
          ipv6,
          memory,
          operating_system,
          price_hourly,
          price_monthly,
          region,
          region_slug,
          status,
          vcpu,
          is_achieved: false,
        },
      });
    } else {
      data = await db.vps.create({
        data: {
          disk,
          ipv4_public,
          ipv4_private,
          ipv6,
          memory,
          operating_system,
          price_hourly,
          price_monthly,
          region,
          region_slug,
          status,
          vcpu,
        },
      });
    }

    res.send(data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const updateVps = async (
  req: FastifyRequest<{ Body: VPSDto; Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const {
      disk,
      ipv4_private,
      ipv6,
      ipv4_public,
      memory,
      operating_system,
      price_hourly,
      price_monthly,
      region,
      region_slug,
      status,
      vcpu,
    } = req.body;
    const updated_data = await db.vps.update({
      where: {
        id: Number(id),
      },
      data: {
        disk,
        ipv4_private,
        ipv4_public,
        ipv6,
        memory,
        operating_system,
        price_hourly,
        price_monthly,
        region,
        region_slug,
        status,
        vcpu,
      },
    });
    res.send(updated_data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const deleteVps = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const delete_row = await db.vps.update({
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

export const getVPSById = async (
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const vps = await db.vps.findUnique({
      where: { id: Number(id) },
      include: {
        domains: true,
        sub_domains: {
          include: { root_domain: true },
        },
        vps_account: true,
      },
    });

    res.send(vps).status(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};
