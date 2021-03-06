import { Express } from "express";
import { UploadedFile } from "express-fileupload";
import path from "path";
import { pdf2mp4, createEventLogger } from "pdf2mp4";

import { getDefaultPaths } from "../paths";
import { sanitizeBodySchema, sanitizeFiles } from "../utils/sanitization";

export function loadPdf2Mp4Endpoint(app: Express) {
  const paths = getDefaultPaths();

  app.post("/pdf2mp4", async (req, res) => {
    let uploadPath: string;
    try {
      if (sanitizeFiles<{ pdf: UploadedFile }>(req, res)) {
        const { pdf } = req.files;
        const uploadDir = paths.uploadDir;

        const hash = (+new Date()).toString(36);
        uploadPath = path.resolve(
          uploadDir,
          `${hash}_${pdf.name.split(" ").join("-")}`
        );

        // Use the mv() method to place the file somewhere on your server
        await pdf.mv(uploadPath);
      }
    } catch (error: any) {
      console.error(error.message);
      res
        .status(error.status || 500)
        .send(error.message)
        .end();
    }

    try {
      if (
        sanitizeBodySchema<{
          secondsPerFrame?: string;
          framesPerSecond?: string;
        }>(req, {
          secondsPerFrame: { type: "string", linked: ["framesPerSecond"] },
          framesPerSecond: { type: "string", linked: ["secondsPerFrame"] },
        })
      ) {
        const framesPerSecond =
          (req.body.framesPerSecond && parseFloat(req.body.framesPerSecond)) ||
          0;
        const secondsPerFrame =
          (req.body.secondsPerFrame && parseFloat(req.body.secondsPerFrame)) ||
          0;
        const fileName = path.basename(uploadPath!);

        const mp4Path = await pdf2mp4(
          { ...paths, framesPerSecond, secondsPerFrame, fileName },
          createEventLogger()
        );

        // redirect to '/video'
        return res.redirect(`/video?name=${mp4Path}`);
      }
    } catch (error: any) {
      console.error(error.message);
      res
        .status(error.status || 500)
        .send(error.message)
        .end();
    }
  });
}
