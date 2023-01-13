import { useRouter } from 'next/router'
import Link from 'next/link'
import { getBranches, createBranch} from "../../../../../prisma/branch.mjs"; // only works in CJS

export default async (req, res) => {
  const { method } = req;
  
   const data = req.query

  switch (method) {
    case "GET":
      
      return res.status(200).json(await getBranches(data.treeVersion_fk));
          break;
    default:
      
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}