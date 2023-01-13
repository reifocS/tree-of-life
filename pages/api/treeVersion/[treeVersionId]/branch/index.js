import { getBranches } from "../../../../../prisma/branch.mjs"; // only works in CJS

const request = async (req, res) => {
  const { method } = req;

  const data = req.query;

  switch (method) {
    case "GET":
      return res.status(200).json(await getBranches(data.treeVersion_fk));
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default request;
