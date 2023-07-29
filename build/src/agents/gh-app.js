import fs from "fs";
import { App as Ocktokit } from "octokit";
class GitHubApp {
    privateKeyPath = process.env.PRIVATE_KEY_PATH;
    webhookSecret = process.env.WEBHOOK_SECRET;
    messagePath = "./message.md";
    messageForNewPRs;
    appId = process.env.APP_ID;
    privateKey = fs.readFileSync(this.privateKeyPath, "utf8");
    app;
    constructor() {
        if (this.appId === undefined ||
            this.privateKeyPath === undefined ||
            this.webhookSecret === undefined) {
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
    initializeWebhooks() {
        this.app.webhooks.onAny(() => {
            console.log(name, "event received");
        });
        this.app.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
            console.log(`Received a pull request event for #${payload.pull_request.number}`);
            try {
                await octokit.rest.issues.createComment({
                    owner: payload.repository.owner.login,
                    repo: payload.repository.name,
                    issue_number: payload.pull_request.number,
                    body: this.messageForNewPRs,
                });
            }
            catch (error) {
                if (error.response) {
                    console.error(`Error! Status: ${error.response.status}. Message: ${error.response.data.message}`);
                }
                else {
                    console.error(error);
                }
            }
        });
        this.app.webhooks.onError((error) => {
            console.log(error);
            if (error.name === "AggregateError") {
                console.log(`Error processing request: ${error.event}`);
            }
            else {
                console.log(error);
            }
        });
    }
    getWebhooks() {
        return this.app.webhooks;
    }
}
export default GitHubApp;
//# sourceMappingURL=gh-app.js.map