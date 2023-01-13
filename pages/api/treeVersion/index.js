export default async (req, res) => {
  const { method } = req;

  const { userId } = req.query;

  switch (method) {
    default:
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};
