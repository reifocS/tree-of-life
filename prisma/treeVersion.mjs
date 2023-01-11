import pkg from "@prisma/client";
import { getUser } from "./users.mjs";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function getLastTreeVersionByTreeMaster(treeMaster) {
  const treeVersion = await prisma.treeVersion.findFirst({
    where: {
      tree_fk: treeMaster.id,
    },
    orderBy: {
      created_at: {
        email: "desc",
      },
    },
  });
  return treeMasters;
}

export async function createTreeVersion(data) {
  console.log(data.user_id);
  const treeMaster = await prisma.treeVersion.create({
    data: {
      user_fk: data.tree_fk,
    },
  });
  return treeMaster;
}
