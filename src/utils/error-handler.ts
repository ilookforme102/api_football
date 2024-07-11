import { Prisma } from "@prisma/client";
import { FastifyReply } from "fastify";

export const errorHandler = (error: any, reply: FastifyReply) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "PS2002":
        console.log("Prisma Error : ", error.message);
        return reply.code(400).send({
          message: `Bad request in field - ${(
            error?.meta?.targe as string
          ).replaceAll("_", " ")}`,
        });
      case "P2025":
        console.log("Prisma Error : ", error.message);
        return reply.code(400).send({ message: `Resource not found.` });
      case "P2003":
        return reply.code(400).send({
          message: `Please enter correct data for field - ${(
            error?.meta?.field_name as string
          ).replaceAll("_", " ")}.`,
        });
      case "P2002":
        console.log("Prisma Error : ", error.message);
        return reply.code(400).send({
          message: `This field cannot be duplicated - ${(
            error?.meta?.target as string
          ).replaceAll("_", " ")}.`,
        });
      default:
        console.log("Prisma Code : ", error.code);
        console.log("Prisma Error : ", error.message);
        return reply.code(500).send({ message: "Something went wrong." });
    }
  }
  console.log("Error :", error.message);
  return reply.code(500).send({
    message: "Something went wrong.",
  });
};
