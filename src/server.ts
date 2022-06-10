import express from "express";
import fileUpload from "express-fileupload";
import { keepDisposingOldFilesForever } from "pdf2mp4";

import config from "./config.json";

import { getDefaultPaths } from "./paths";
import { loadEndpoints } from "./endpoints";

const app = express();
app.set("view options", { layout: false });
app.use(fileUpload());
app.use(express.json());

loadEndpoints(app);

app.listen(config.serverPort, () => {
  console.log(`App listening on port ${config.serverPort}!`);
});

// delete files older than 12 hours
keepDisposingOldFilesForever(getDefaultPaths().tempDir);
