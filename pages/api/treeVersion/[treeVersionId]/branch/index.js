import { getBranches} from "../../../../../prisma/branch.mjs"; // only works in CJS

const request = async (req, res) => {
  const { method } = req;
  console.log("handler tree")
   const data = req.query

  switch (method) {
    case "GET":
      console.log("GET");
      return res.status(200).json(await getBranches(data.treeVersion_fk));
    default:
      console.log("DEFAULT")
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}

export default request;