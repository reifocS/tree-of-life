import pkg from "@prisma/client";
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient();

async function main() {
  await myReset();
  const userType = await prisma.userType.create({
    data: {
      label: "patient",
    },
  });

  const user = await prisma.user.create({
    data: {
      name: "Maël",
      userType_fk: userType.id,
    },
  });

  await myDisplay();
}
async function myReset() {
  await prisma.user.deleteMany();
  await prisma.userType.deleteMany();
  await prisma.treeMaster.deleteMany();
  await prisma.treeVersion.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.leaf.deleteMany();
  await prisma.elementInfo.deleteMany();
}

async function myDisplay() {
  const users = await prisma.user.findMany();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
