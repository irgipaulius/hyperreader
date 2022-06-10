import { Express } from "express";
import path from "path";

import { sanitizeQuerySchema } from "../utils/sanitization";

export function loadVideoEndpoint(app: Express) {
  app.get("/video", function (req, res) {
    if (
      sanitizeQuerySchema<{ name: string }>(req, {
        name: { type: "string", optional: false },
      })
    ) {
      res.sendFile(path.join(__dirname, "../", "views", "video.html"));
    }
  });
}
