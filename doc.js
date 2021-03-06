const express = require("express");

const app = express();

app.use("/", express.static("out"));

app.listen(3000, () => {
  process.stdout.write("Document server listening on port 3000!\n");
});
