import { useRouter } from "next/router";
import Link from "next/link";
import {
  getLastTreeVersionByTreeMaster,
  createTreeVersion,
} from "../../../../../prisma/treeVersion.mjs"; // only works in CJS

export default async (req, res) => {
  const { method } = req;

  const data = req.query;

  switch (method) {
    case "GET":
      return res
        .status(200)
        .json(await getLastTreeVersionByTreeMaster(data.treeMasterId));
      break;
    case "POST":
      res
        .status(200)
        .json(await createTreeVersion(data.treeMasterId, req.body));
      break;
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};
