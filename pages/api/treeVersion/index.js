import { useRouter } from 'next/router'
import Link from 'next/link'
import {createTreeVersion} from "../../../prisma/treeVersion.mjs"; // only works in CJS

export default async (req, res) => {
  const { method } = req;
  console.log("handler tree")
  const { userId } = req.query

  switch (method) {
    
    default:
      console.log("DEFAULT")
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}