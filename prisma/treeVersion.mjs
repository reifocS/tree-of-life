import pkg from "@prisma/client";
import { createBranch } from "./branch.mjs";
import { addLeaf } from "./leaf.mjs";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

export async function getLastTreeVersionByTreeMaster(treeMaster_idP) {
  const treeVersion = await prisma.treeVersion.findFirst({
    where: {
      treeMaster_fk: parseInt(treeMaster_idP),
    },
    orderBy: {
      created_at: "desc",
    },
    include: {
      branches: {
        include: {
          leafs: true,
        },
      },
    },
  });
  return treeVersion;
}

export async function createTreeVersion(treeMaster_idP, dataP) {
  const treeVersion = await prisma.treeVersion.create({
    data: {
      treeMaster_fk: parseInt(treeMaster_idP),
      label: dataP.name,
    },
  });
  dataP.elements.sort(function (a, b) {
    if (a.type < b.type) {
      return -1;
    }
    if (a.type > b.type) {
      return 1;
    }
    return 0;
  });

  var branchMap = new Map();
  const res = await setBranchIdMap(dataP.elements, treeVersion, branchMap);
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  await delay(100); //TODO ugly

  Object.entries(dataP.elements).forEach(async (entry) => {
    const [key, element] = entry;
    switch (element.type) {
      case "leaf":
        console.log("adding leaf to branch" + element.branch_fk);
        console.log(branchMap.get(element.branch_fk));
        await addLeaf(branchMap.get(element.branch_fk), element);

        break;
      default:
    }
  });
  return treeVersion;
}

async function setBranchIdMap(dataElements, treeVersion, branchMap) {
  let res = await Object.entries(dataElements).forEach(async (entry) => {
    const [key, element] = entry;
    switch (element.type) {
      case "category":
        const branch = await createBranch(treeVersion.id, element);
        if (!branchMap.has(branch.id)) {
          console.log(element.id + "->" + branch.id);
          branchMap.set(element.id, branch.id);
        } else {
        }
        break;
      default:
    }
  });
  return res;
}
