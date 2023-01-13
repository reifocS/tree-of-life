import { getLastTreeVersionByTreeMaster,createTreeVersion} from "../../../../../prisma/treeVersion.mjs"; // only works in CJS


const request = async (req, res) => {
  const { method } = req;
  console.log("handler tree")
   const data = req.query
  console.log(data.treeMasterId)

  switch (method) {
    case "GET":
      console.log("GET");
      return res.status(200).json(await getLastTreeVersionByTreeMaster(data.treeMasterId));
    case "POST":
      console.log("POST")
      res.status(200).json(await createTreeVersion(data.treeMasterId,req.body));
      break;
    default:
      console.log("DEFAULT")
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}

export default request;