import { useRouter } from 'next/router'
import Link from 'next/link'
import { getTreesMastersByUser,createTreeMaster} from "../../../../../prisma/treeMaster.mjs"; // only works in CJS

export default async (req, res) => {
  const { method } = req;
  console.log("handler tree")
  const { userId } = req.query

  switch (method) {
    case "GET":
      console.log("GET");
      res.status(200).json(getTreesMastersByUser(userId));
      break;
    default:
      console.log("DEFAULT")
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}