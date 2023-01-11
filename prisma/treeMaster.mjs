import pkg from "@prisma/client";
import { getUser } from "./users.mjs";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function getTreesMastersByUser(useridp) {
  const treeMasters = await prisma.treeMaster.findMany({
    where: {
      user_fk: parseInt(useridp),
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
