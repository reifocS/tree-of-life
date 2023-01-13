import pkg from "@prisma/client";
import { getUser } from "./users.mjs";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function createLeaf(datap) {
  const elementInfo = await prisma.elementInfo.create({
    data: {
      x: datap.elementInfo_fk.x,
      y: datap.elementInfo_fk.y,
      height: datap.elementInfo_fk.height,
      label: datap.elementInfo_fk.label,
      width: datap.elementInfo_fk.width,
      angle: datap.elementInfo_fk.angle,
    },
  });
  const leaf = await prisma.leaf.create({
    data: {
      branch_fk: datap.branch_fk,
      icon: datap.icon,
      fontColor: datap.fontColor,
      elementInfo_fk: elementInfo.id,
    },
  });
  return leaf;
}

export async function addLeaf(branch_fkp, datap) {
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
  const leaf = await prisma.leaf.create({
    data: {
      branch_fk: branch_fkp,
      icon: datap.icon,
      fontColor: datap.color,
      elementInfo_fk: elementInfo.id,
    },
  });
  return leaf;
}
