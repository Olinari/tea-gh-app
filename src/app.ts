import dotenv from "dotenv";
import http from "http";
import { createNodeMiddleware } from "@octokit/webhooks";
import GitHubApp from "./agents/gh-app.js";

dotenv.config();

const ghApp = new GitHubApp();
const port = process.env.PORT || 3000;
const path = "/api/webhook";
const localWebhookUrl = `http://localhost:${port}${path}`;

const middleware = createNodeMiddleware(ghApp.getWebhooks(), { path });

http.createServer(middleware).listen(port, () => {
  console.log(`Server is listening for events at: ${localWebhookUrl}`);
  console.log("Press Ctrl + C to quit.");
});
