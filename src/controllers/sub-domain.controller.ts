/**
 * CRUD Request handlers (controllers) for sub-domain
 */
import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
import { SubdomainDto } from "@/dto/domain.dto";

export const getSubdomains = async (
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
      db.sub_domain.findMany({
        skip,
        take: per_page,
        where: { is_achieved: false },
      }),
      db.sub_domain.count({
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

export const updateSubdomain = async (
  req: FastifyRequest<{ Body: SubdomainDto; Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const { name, root_domain_id, hosted_vps_id } = req.body;
    const updated_team = await db.sub_domain.update({
      where: {
        id: Number(id),
      },
      data: {
        name,
        root_domain_id,
        hosted_vps_id,
      },
    });
    res.send(updated_team).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const deleteSubdomain = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const delete_row = await db.sub_domain.update({
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
