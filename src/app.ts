import dotenv from "dotenv";
import fs from "fs";
import http from "http";
import { App } from "octokit";
import { createNodeMiddleware } from "@octokit/webhooks";

// Load environment variables from .env file
dotenv.config();

// Set configured values
const appId = process.env.APP_ID;
const privateKeyPath = process.env.PRIVATE_KEY_PATH as string;
const privateKey = fs.readFileSync(privateKeyPath, "utf8");
const secret = process.env.WEBHOOK_SECRET;

const messageForNewPRs = fs.readFileSync("./message.md", "utf8");

if (
  appId === undefined ||
  privateKeyPath === undefined ||
  secret === undefined
) {
  throw new Error("Missing required environment variable. See README.md");
}

const app = new App({
  appId,
  privateKey,
  webhooks: {
    secret,
  },
});

console.log(app.webhooks);
app.webhooks.onAny(({ id, name, payload }) => {
  console.log(name, "event received");
});

app.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
  console.log(
    `Received a pull request event for #${payload.pull_request.number}`,
  );

  console.log(payload);
  try {
    await octokit.rest.issues.createComment({
      owner: payload.repository.owner.login,
      repo: payload.repository.name,
      issue_number: payload.pull_request.number,
      body: messageForNewPRs,
    });
  } catch (error) {
    if (error.response) {
      console.error(
        `Error! Status: ${error.response.status}. Message: ${error.response.data.message}`,
      );
    } else {
      console.error(error);
    }
  }
});

app.webhooks.onError((error) => {
  console.log(error);
  if (error.name === "AggregateError") {
    // Log Secret verification errors
    console.log(`Error processing request: ${error.event}`);
  } else {
    console.log(error);
  }
});

// Launch a web server to listen for GitHub webhooks
const port = process.env.PORT || 3000;
const path = "/api/webhook";
const localWebhookUrl = `http://localhost:${port}${path}`;

// See https://github.com/octokit/webhooks.js/#createnodemiddleware for all options
const middleware = createNodeMiddleware(app.webhooks, { path });

http.createServer(middleware).listen(port, () => {
  console.log(`Server is listening for events at: ${localWebhookUrl}`);
  console.log("Press Ctrl + C to quit.");
});