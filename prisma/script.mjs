import pkg from '@prisma/client';
const { PrismaClient } = pkg;

//  npx ts-node ./prisma/script.mjs

const prisma = new PrismaClient()

async function main() {
  await myDisplay(1);
  await myReset(0);
  await myDisplay(1);
  await myCreateTree(2);
  await myDisplay(1);

  await myCreateConsultation(3);
  await myDisplay(4);
  await myReset(5);
}

async function myCreateTree(step) {
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
  const branch2 = await prisma.branch.create({
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
  await prisma.role.create({
    data: {
      label: 'admin',
      id: 3
    },
  })
  await prisma.role.create({
    data: {
      label: 'soignant',
      id: 2
    },
  })
  await prisma.role.create({
    data: {
      label: 'patient',
      id: 1
    },
  })
}

async function myCreateConsultation(step) {
  const tree = await prisma.tree.create({
    data: {
      label: 'testTree',
    },
  })
  console.log(step + ") using api");
  let user = await createUser("Géraud", 1);
  console.log(user.id);
  let consultation = await createConsultation(user.id, user.id,tree.id);
}

async function myDisplay(step) {
  console.log(step+") Displaying database");
  const trees = await prisma.tree.findMany();
  console.log(trees);
  const branches = await prisma.branch.findMany();
  console.log(branches);
  const leaves = await prisma.leaf.findMany();
  console.log(leaves);
  const roles = await prisma.role.findMany();
  console.log(roles);
  const users = await prisma.user.findMany();
  console.log(users);
  const consultations = await prisma.consultation.findMany();
  console.log(consultations);
}

async function myReset(step) {
  console.log(step+") Reseting database");
  await prisma.consultation.deleteMany();
  await prisma.leaf.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.tree.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
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

//USER
async function findAllUser() {
  return prisma.user.findMany();
}
async function findUserByID(idp) {
  const user = await prisma.user.findUnique({
    where: {
      id: idp,
    },
  })
  return user;
}
async function deleteUser(idp) {
  const user = await prisma.user.delete({
  where: {
    id:idp,
  },
  })
  return user;
}
async function createUser(nomp, roleIDp) {
  const user = await prisma.user.create({
  data: {
    nom: nomp,
    roleID: roleIDp
  },
  })
  return user;
}
async function updateUser(idp, nomp, roleIDp) {
  const user = await prisma.user.update({
  where: {
    id: idp,
  },
  data: {
    nom: nomp,
    roleID: roleIDp,
  },
  })
  console.log(user);
}

async function createConsultation(patientIDp, soignantIDp, treeIDp) {
  const consultation = await prisma.consultation.create({
    data: {
      patientID: patientIDp,
      soignantID: soignantIDp,
      treeID: treeIDp
    }
  })
  return consultation;
}