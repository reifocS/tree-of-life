import pkg from "@prisma/client";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function getUsers() {
  console.log("getUsers");
  return prisma.user.findMany();
}

export async function getUser(idp) {
  const user = await prisma.user.findUnique({
    where: {
      id: idp,
    },
  });
  return user;
}

export function test() {
  console.log("test");
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
