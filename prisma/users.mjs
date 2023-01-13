import pkg from "@prisma/client";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function getUsers() {
  return prisma.user.findMany({
    include: {
      treeMasters: {
        include: {
          treeVersions: {
            include: {
              branches: {
                include: {
                  leafs: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getUser(idp) {
  const user = await prisma.user.findUnique({
    where: {
      id: idp,
    },
    include: {
      treeMasters: {
        include: {
          treeVersions: {
            include: {
              branches: {
                include: {
                  leafs: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return user;
}

export function test() {
  return "test";
}

export async function createUser(userp) {
  const user = await prisma.user.create({
    data: {
      name: userp.name,
      userType_fk: userp.userType_fk,
    },
  });
  return user;
}
