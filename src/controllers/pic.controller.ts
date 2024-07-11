import { PIC } from "@/dto/pic.dto";
import { db, errorHandler } from "@/utils";
import { FastifyReply, FastifyRequest } from "fastify";

export const createPic = async (
  req: FastifyRequest<{
    Body: PIC;
  }>,
  res: FastifyReply
) => {
  try {
    const { main_task, pic_id, row_id } = req.body;
    const existingPIC = await db.pic.findFirst({
      where: {
        pic_id,
        row_id,
      },
    });
    let data = null;
    if (existingPIC) {
      if (existingPIC.is_achieved) {
        data = await db.pic.update({
          where: { id: existingPIC.id },
          data: { main_task, pic_id, row_id, is_achieved: false },
        });
      } else {
        res.code(400).send({
          message: "Person in charge already existed.",
        });
      }
    } else {
      data = await db.pic.create({
        data: {
          main_task,
          pic_id,
          row_id,
        },
      });
    }

    res.send(data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const updatePic = async (
  req: FastifyRequest<{
    Body: PIC;
    Params: { id: string };
  }>,
  res: FastifyReply
) => {
  try {
    const { main_task, pic_id, row_id } = req.body;
    const existingPIC = await db.pic.findFirst({
      where: {
        pic_id,
        row_id,
      },
    });
    let data = null;

    if (existingPIC) {
      data = await db.pic.update({
        where: { id: existingPIC.id },
        data: { main_task, pic_id, row_id },
      });
    }

    res.send(data).code(200);
  } catch (error: any) {
    errorHandler(error, res);
  }
};

export const deletePic = async (
  req: FastifyRequest<{
    Params: { id: string };
  }>,
  res: FastifyReply
) => {
  try {
    const { id } = req.params;
    const data = await db.pic.update({
      where: { id: Number(id) },
      data: {
        is_achieved: true,
      },
    });
    return res.send(data);
  } catch (error: any) {
    errorHandler(error, res);
  }
};
