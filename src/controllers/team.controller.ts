/**
 * CRUD Request handlers (controllers) for team
 */

import { TeamDto } from "@/dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";

export const getTeams = async (
  req: FastifyRequest<{
    Querystring: {
      page: number;
      per_page: number;
      is_option: string;
    };
  }>,
  res: FastifyReply
) => {
  try {
    const is_option = req.query.is_option;
    if (is_option && is_option === "true") {
      const teams = await db.team.findMany({
        where: {
          is_achieved: false,
        },
        select: {
          team_name: true,
          id: true,
        },
      });
      return res.send(teams).code(200);
    }
    const page = req.query.page || 1;
    const per_page = req.query.per_page || 12;
    const skip = (page - 1) * per_page;
    const [data, count] = await db.$transaction([
      db.team.findMany({
        skip,
        take: per_page,
        where: {
          is_achieved: false,
        },
      }),
      db.team.count({
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

export const createTeam = async (
  req: FastifyRequest<{ Body: TeamDto }>,
  res: FastifyReply
) => {
  try {
    const { team_name } = req.body;
    const existingData = await db.team.findFirst({
      where: { team_name, is_achieved: true },
    });
    let data = null;

    if (existingData) {
      data = await db.team.update({
        where: { id: existingData.id },
        data: {
          team_name,
          is_achieved: false,
        },
      });
    } else {
      data = await db.team.create({
        data: { team_name },
      });
    }
    res.send(data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const updateTeam = async (
  req: FastifyRequest<{ Body: TeamDto; Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const { team_name } = req.body;
    const updated_team = await db.team.update({
      where: {
        id: Number(id),
      },
      data: {
        team_name,
      },
    });
    res.send(updated_team).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const deleteTeam = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const delete_row = await db.team.update({
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
