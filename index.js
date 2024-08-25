const express = require("express");
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
dotenv.config();

const cors = require("cors");
const routes = require("./src/routers/index");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 3001;
app.use(bodyParser.json());

app.use(cors());
routes(app);

app.get("/", (req, res) => {
  res.send("Hello  Nguyen Van Thang");
});
mongoose
  .connect(
    "mongodb+srv://vanthangthophu1234:YxfNM6IMwLgUtY9g@cluster0.lsloi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connect Db success!");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
