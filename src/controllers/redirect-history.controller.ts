/**
 * CRUD Request handlers (controllers) for redirect target of domain
 */
import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
import { RedirectDto } from "@/dto";

export const getRedirectDomains = async (
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
      db.redirected_domain.findMany({
        skip,
        take: per_page,
        where: {
          is_achieved: false,
        },
      }),
      db.redirected_domain.count({
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

export const createRedirectDomain = async (
  req: FastifyRequest<{ Body: RedirectDto }>,
  res: FastifyReply
) => {
  try {
    const { target_domain, current_domain_id } = req.body;
    const existingData = await db.redirected_domain.findFirst({
      where: { current_domain_id, is_achieved: true },
    });
    let data = null;

    if (existingData) {
      data = await db.redirected_domain.update({
        where: { id: existingData.id },
        data: {
          target_domain,
          current_domain_id,
          is_achieved: false,
        },
      });
    } else {
      data = await db.redirected_domain.create({
        data: { target_domain, current_domain_id },
      });
    }
    res.send(data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const updateRedirectDomain = async (
  req: FastifyRequest<{ Body: RedirectDto; Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const { target_domain, current_domain_id } = req.body;
    const updated_data = await db.redirected_domain.update({
      where: {
        id: Number(id),
      },
      data: {
        target_domain,
        current_domain_id,
      },
    });
    res.send(updated_data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const deleteRedirectDomain = async (
  req: FastifyRequest<{ Params: { id: number } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const delete_row = await db.redirected_domain.update({
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
