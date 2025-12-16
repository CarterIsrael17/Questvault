const express = require("express");
const path = require("path");
const app = express();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());

const uploadRoute = require("./routes/upload");
app.use("/upload", uploadRoute);
app.use("/questions", uploadRoute); // GET & DELETE handled in upload.js

app.listen(4000, () => console.log("Backend running on port 4000"));
