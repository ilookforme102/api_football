/**
 * CRUD Request handlers (controllers) for user
 */
import { LoginDto, UserDto } from "@/dto";
import { FastifyReply, FastifyRequest } from "fastify";
import { db, errorHandler } from "@/utils";
import bcrypt from "bcrypt";

const saltRounds = 10;
export const getUsers = async (
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
    const page = req.query.page || 1;
    const per_page = req.query.per_page || 12;
    const is_option = req.query.is_option;
    if (is_option === "true") {
      const users = await db.user.findMany({
        where: {
          is_achieved: false,
        },
        select: {
          team: {
            select: {
              team_name: true,
            },
          },
          id: true,
          username: true,
          password: false,
        },
      });
      return res.send(users);
    }
    const skip = (page - 1) * per_page;
    const [data, count] = await db.$transaction([
      db.user.findMany({
        skip,
        take: per_page,
        where: {
          is_achieved: false,
        },
        select: {
          team: {
            select: {
              team_name: true,
            },
          },
          password: false,
          username: true,
          createdAt: true,
          id: true,
        },
      }),
      db.user.count({
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

export const createUser = async (
  req: FastifyRequest<{ Body: UserDto }>,
  res: FastifyReply
) => {
  try {
    const { username, password, team_id } = req.body;
    const existingData = await db.user.findFirst({
      where: { username, is_achieved: true },
    });
    let data = null;
    const hash = await bcrypt.hash(password, saltRounds);
    if (existingData) {
      data = await db.user.update({
        where: { id: existingData.id },
        data: {
          username,
          password: hash,
          is_achieved: false,
        },
      });
    } else {
      data = await db.user.create({
        data: {
          username,
          password: hash,
          team_id,
        },
      });
    }
    res.send(data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const updateUser = async (
  req: FastifyRequest<{ Body: UserDto; Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const { username, team_id } = req.body;
    const updated_user = await db.user.update({
      where: {
        id: Number(id),
      },
      data: {
        username,
        team_id,
      },
    });
    res.send(updated_user).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const deleteUser = async (
  req: FastifyRequest<{ Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const delete_row = await db.user.update({
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

export const login = async (
  req: FastifyRequest<{ Body: LoginDto }>,
  res: FastifyReply
) => {
  try {
    const { username, password } = req.body;
    const user = await db.user.findUnique({
      where: {
        username,
      },
      include: {
        team: {
          select: { team_name: true },
        },
      },
    });

    if (!user) {
      return res.code(401).send({
        messsage: "Unauthenticated!",
      });
    }

    const checked = await bcrypt.compare(password, user.password as string);

    if (!checked) {
      return res.code(401).send({
        messsage: "Unauthenticated!",
      });
    }

    (req.session as any).set("username", user?.username);

    res
      .send({
        username: user?.username,
        team: user?.team.team_name,
        message: "Successfully logined!",
      })
      .code(200);
  } catch (error: any) {
    return errorHandler(error, res);
  }
};

export const logout = async (
  req: FastifyRequest<{ Body: LoginDto }>,
  res: FastifyReply
) => {
  try {
    (req.session as any).delete();
    res
      .send({
        message: "Successfully logout!",
      })
      .code(200);
  } catch (error: any) {
    return errorHandler(error, res);
  }
};

export const changePassword = async (
  req: FastifyRequest<{ Body: { password: string }; Params: { id: string } }>,
  res: FastifyReply
) => {
  try {
    const { password } = req.body;
    const { id } = req.params;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = await db.user.update({
      where: {
        id: Number(id),
      },
      data: { password: hash },
    });

    res
      .send({
        message: "Password updated successfully!",
      })
      .code(200);
  } catch (error) {
    return errorHandler(error, res);
  }
};
