import pkg from "@prisma/client";
import { getUser } from "./users.mjs";

import { createTreeVersion } from "./treeVersion.mjs";

const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function getTreesMastersByUser(useridp) {
  const treeMasters = await prisma.treeMaster.findMany({
    where: {
      user_fk: parseInt(useridp),
    },
    include: {
      treeVersions: {
        include: {
          branches: {
            include: {
              leafs: {
                include: {
                  elementInfo: true,
                },
              },
            },
          },
        },
      },
    },
  });
  return treeMasters;
}

export async function createTreeMaster(userId, data) {
  const treeMaster = await prisma.treeMaster.create({
    data: {
      user_fk: parseInt(userId),
    },
  });
  await createTreeVersion(treeMaster.id, data);

  return treeMaster;
}
