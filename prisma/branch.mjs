import pkg from "@prisma/client";
import { getUser } from "./users.mjs";
import { createLeaf, addLeaf } from "./leaf.mjs";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function getBranches(treeVersion_idP) {
  const treeVersion = await prisma.branch.findMany({
    where: {
      treeVersion_fk: treeVersion_idP,
    },
    include: {
      leafs: true,
    },
  });
  return treeVersion;
}

export async function createBranch(treeId, datap) {
  const elementInfo = await prisma.elementInfo.create({
    data: {
      x: datap.x,
      y: datap.y,
      height: datap.height,
      label: datap.text,
      width: datap.width,
      angle: datap.angle,
    },
  });
  const branch = await prisma.branch.create({
    data: {
      treeVersion_fk: treeId,
      actualBoundingBoxAscent: datap.actualBoundingBoxAscent,
      font: datap.font,
      elementInfo_fk: elementInfo.id,
    },
  });
  return branch;
}
