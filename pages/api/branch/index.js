import { createBranch } from "../../../prisma/branch.mjs"; // only works in CJS

const request = async (req, res) => {
  const { method } = req;

  const data = req.body;

  switch (method) {
    case "POST":
      res.status(200).json(await createBranch(data));
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default request;
