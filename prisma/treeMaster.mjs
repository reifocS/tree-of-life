import pkg from "@prisma/client";
import { getUser } from "./users.mjs";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function getTreesMastersByUser(userp) {
  const treeMasters = await prisma.treeMaster.findUnique({
    where: {
      user_fk: userp.id,
    },
  });
  return treeMasters;
}

export async function createTreeMaster(data) {
  console.log(data.user_id);
  const treeMaster = await prisma.treeMaster.create({
    data: {
      user_fk: data.user_id,
    },
  });
  return treeMaster;
}
