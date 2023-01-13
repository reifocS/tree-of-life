// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getUsers, createUser } from "../../prisma/users.mjs"; // only works in CJS

const request = async (req, res) => {
  const { method } = req;
  console.log("handler");
  switch (method) {
    case "GET":
      console.log("GET");
      res.status(200).json(await getUsers());
      break;
    case "POST":
      console.log("POST");
      res.status(200).json(await createUser(req.body));
      break;
    default:
      console.log("DEFAULT");
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default request;
