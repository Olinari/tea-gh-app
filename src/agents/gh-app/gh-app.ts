import fs from "fs";
import { App as Ocktokit } from "octokit";
import axios from "axios";
import OpenAIService from "../../services/open-ai-service.js";
import { remotePrPoller } from "./remote-repository/pull-request-poll.js";

class GitHubApp {
  private privateKeyPath = process.env.PRIVATE_KEY_PATH as string;
  private webhookSecret = process.env.WEBHOOK_SECRET;
  readonly appId = process.env.APP_ID;
  readonly privateKey = fs.readFileSync(this.privateKeyPath, "utf8");
  private app: Ocktokit;
  private openAi: OpenAIService;

  constructor() {
    if (
      this.appId === undefined ||
      this.privateKeyPath === undefined ||
      this.webhookSecret === undefined
    ) {
      throw new Error("Missing required environment variable. See README.md");
    }

    this.app = new Ocktokit({
      appId: this.appId,
      privateKey: this.privateKey,
      webhooks: {
        secret: this.webhookSecret,
      },
    });
    this.openAi = new OpenAIService();
    this.initializeWebhooks();
    remotePrPoller();
  }

  private initializeWebhooks(): void {
    this.app.webhooks.on(
      "pull_request.opened",
      async ({ octokit, payload }) => {
        console.log(
          `Received a pull request event for #${payload.pull_request.number}`,
        );
        const diff = await axios.get(payload.pull_request.diff_url);
        const comment = await this.openAi.explainCode({ code: diff.data });
        try {
          await octokit.rest.issues.createComment({
            owner: payload.repository.owner.login,
            repo: payload.repository.name,
            issue_number: payload.pull_request.number,
            body: comment.description,
          });

          const workflowContent = `
  name: TEAPOT CI

  on:
    pull_request:
      types: [opened, synchronize, reopened]

  env:
    COMMENT: "${comment.description}"

  jobs:
    build:
      runs-on: ubuntu-latest

      steps:
      - uses: actions/checkout@v2

      - name: Use Node.js
        uses: actions/setup-node@v2

      - run: npm ci
      - run: npm test
      - run: |
          const comment = process.env.COMMENT;
          console.log(comment);
        shell: node
        `;

          const contentBuffer = Buffer.from(workflowContent, "utf-8");
          const contentBase64 = contentBuffer.toString("base64");

          await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
            owner: payload.repository.owner.login,
            repo: payload.repository.name,
            path: ".github/workflows/ci.yml",
            message: "Create CI workflow",
            content: contentBase64,
            client_payload: { comment: comment.description },
          });
        } catch (error) {
          if (error.response) {
            console.error(
              `Error!! Status: ${error.response.status}. Message: ${error.response.data.message}`,
            );
          } else {
            console.error(error);
          }
        }
      },
    );

    this.app.webhooks.onError((error) => {
      console.log(error);
      if (error.name === "AggregateError") {
        console.log(`Error processing request: ${error.event}`);
      } else {
        console.log(error);
      }
    });
  }

  public getWebhooks() {
    return this.app.webhooks;
  }
}

export default GitHubApp;
