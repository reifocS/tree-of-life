import { useRouter } from 'next/router'
import Link from 'next/link'
import { getTreesMastersByUser,createTreeMaster} from "../../../../../prisma/treeMaster.mjs"; // only works in CJS

export default async (req, res) => {
  const { method } = req;
  console.log("handler tree")
  const data = req.query
  console.log(data.userId)
  switch (method) {
    case "GET":
      console.log("GET");
      return res.status(200).json(await getTreesMastersByUser(data.userId));
      break;
    case "POST":
      console.log("POST")
      res.status(200).json(await createTreeMaster(data.userId,req.body));
      break;
    default:
      console.log("DEFAULT")
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}