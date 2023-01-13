// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getUsers, createUser } from "../../prisma/users.mjs"; // only works in CJS

export default async (req, res) => {
  const { method } = req;

  switch (method) {
    case "GET":
      res.status(200).json(await getUsers());
      break;
    case "POST":
      res.status(200).json(await createUser(req.body));
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};
