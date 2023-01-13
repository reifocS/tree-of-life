import { useRouter } from 'next/router'
import Link from 'next/link'
import { createLeaf} from "../../../prisma/leaf.mjs"; // only works in CJS

export default async (req, res) => {
  const { method } = req;
  
   const data = req.body

  switch (method) {
    case "POST":
      res.status(200).json(await createLeaf(data));
      break;
    default:
      
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}