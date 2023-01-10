// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { getUsers,createUser} from "../../prisma/users.mjs"; // only works in CJS

type Data = {
  name: string
}

export default async (req, res) => {
  const { method } = req;
  console.log("handler")
  switch (method) {
    case "GET":
      console.log("GET")
      res.status(200).json(await getUsers());
      break;
    case "POST":
      console.log("POST")
      res.status(200).json(await createUser(req.body));
      break;
    default:
      console.log("DEFAULT")
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}