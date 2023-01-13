
import { getTreesMastersByUser,createTreeMaster} from "../../../../../prisma/treeMaster.mjs"; // only works in CJS

export default async (req, res) => {
  const { method } = req;
  
  const data = req.query
  
  switch (method) {
    case "GET":
      
      return res.status(200).json(await getTreesMastersByUser(data.userId));
      break;
    case "POST":
      
      res.status(200).json(await createTreeMaster(data.userId,req.body));
      break;
    default:
      
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
}