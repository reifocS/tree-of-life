import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await myReset(0);
  await myPopulate(1);
  await myDisplay(2);
  await myReset(3);
}

async function myPopulate(step) {
  console.log(step+") Populating database");
  const tree = await prisma.tree.create({
    data: {
      label: 'testTree',
    },
  })
  const branch = await prisma.branch.create({
    data: {
      label: 'testBranch',
      treeId: tree.id
    },
  })
  await prisma.leaf.create({
    data: {
      label: 'testLeaf',
      branchId: branch.id
    },
  })
}

async function myDisplay(step) {
  console.log(step+") Displaying database");
  const trees = await prisma.tree.findMany();
  console.log(trees);
  const branches = await prisma.branch.findMany();
  console.log(branches);
  const leaves = await prisma.leaf.findMany();
  console.log(leaves);
}

async function myReset(step) {
  console.log(step+") Reseting database");
  await prisma.leaf.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.tree.deleteMany();
}



main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

