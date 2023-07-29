import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import { createNodeMiddleware } from "@octokit/webhooks";
import GitHubApp from './agents/gh-app';

dotenv.config();

const appId = process.env.APP_ID;
const privateKeyPath = process.env.PRIVATE_KEY_PATH as string;
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const secret = process.env.WEBHOOK_SECRET;
const messagePath = "./message.md";

if (
    appId === undefined ||
    privateKeyPath === undefined ||
    secret === undefined
) {
  throw new Error("Missing required environment variable. See README.md");
}

const ghApp = new GitHubApp(appId, privateKey, secret, messagePath);

const port = process.env.PORT || 3000;
const path = "/api/webhook";
const localWebhookUrl = `http://localhost:${port}${path}`;

const middleware = createNodeMiddleware(ghApp.getWebhooks(), { path });

http.createServer(middleware).listen(port, () => {
  console.log(`Server is listening for events at: ${localWebhookUrl}`);
  console.log("Press Ctrl + C to quit.");
});