const express = require("express");
const app = express();
const port = 3001;

// Add Access Control Allow Origin headers
app.use((req, res, next) => {
  // res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  res.json("Hello API");
});

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/api/logform", (req, res) => {
  let formData = req.body;
  console.log(formData);

  var fs = require("fs");
  fs.writeFile(
    "demo.txt",
    JSON.stringify(formData),
    "utf8",
    function (error, data) {
      console.log("Write complete");
    }
  );
});

app.get("/api/logform", (req, res) => {
  var fs = require("fs");
  fs.readFile("demo.txt", "utf8", function (error, data) {
    console.log("Read complete");
    res.json(data);
  });
});

var server = app.listen(port, () => {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});
