import pkg from "@prisma/client";
import { getUser } from "./users.mjs";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function geteElementInfos(element_idP) {
  const treeVersion = await prisma.branch.findMany({
    where: {
      treeVersion_fk: element_idP,
    },
  });
  return treeVersion;
}
