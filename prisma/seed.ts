import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();
const main = async () => {
  const it_team = await prisma.team.upsert({
    create: {
      team_name: "IT",
      users: {
        createMany: {
          data: [
            { username: "harrison",
               password: "123" },
            {
              username: "shang",
              password: "123",
            },
          ],
        },
      },
    },
    update: {},
    where: {
      team_name: "IT",
    },
  });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
