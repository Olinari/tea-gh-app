import fs from "fs";
import { App as Ocktokit } from "octokit";

class GitHubApp {
  private privateKeyPath = process.env.PRIVATE_KEY_PATH as string;
  private webhookSecret = process.env.WEBHOOK_SECRET;
  private messagePath = "./message.md";
  readonly messageForNewPRs: string;
  readonly appId = process.env.APP_ID;
  readonly privateKey = fs.readFileSync(this.privateKeyPath, "utf8");
  private app: typeof Ocktokit;

  constructor() {
    if (
      this.appId === undefined ||
      this.privateKeyPath === undefined ||
      this.webhookSecret === undefined
    ) {
      throw new Error("Missing required environment variable. See README.md");
    }

    this.messageForNewPRs = fs.readFileSync(this.messagePath, "utf8");

    this.app = new Ocktokit({
      appId: this.appId,
      privateKey: this.privateKey,
      webhooks: {
        secret: this.webhookSecret,
      },
    });

    this.initializeWebhooks();
  }

  private initializeWebhooks(): void {
    this.app.webhooks.onAny(({ id, name, payload }) => {
      console.log(name, "event received");
    });

    this.app.webhooks.on(
      "pull_request.opened",
      async ({ octokit, payload }) => {
        console.log(
          `Received a pull request event for #${payload.pull_request.number}`,
        );

        try {
          await octokit.rest.issues.createComment({
            owner: payload.repository.owner.login,
            repo: payload.repository.name,
            issue_number: payload.pull_request.number,
            body: this.messageForNewPRs,
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