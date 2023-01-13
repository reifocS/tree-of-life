const request = async (req, res) => {
  const { method } = req;
  console.log("handler tree");

  switch (method) {
    default:
      console.log("DEFAULT");
      res.setHeader("Allow", ["GET", "POST"]);
      res.status(405).end(`Method ${method} Not Allowed`);
      break;
  }
};

export default request;
