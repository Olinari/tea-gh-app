
import fs from "fs";
import { App } from "octokit";

class GitHubApp {
    private appId: string;
    private privateKey: string;
    private secret: string;
    private app: App;
    private messageForNewPRs: string;

    constructor(appId: string, privateKey: string, secret: string, messagePath: string) {
        this.appId = appId;
        this.privateKey = privateKey;
        this.secret = secret;
        this.messageForNewPRs = fs.readFileSync(messagePath, "utf8");

        this.app = new App({
            appId: this.appId,
            privateKey: this.privateKey,
            webhooks: {
                secret: this.secret,
            },
        });

        this.initializeWebhooks();
    }

    private initializeWebhooks(): void {
        this.app.webhooks.onAny(({ id, name, payload }) => {
            console.log(name, "event received");
        });

        this.app.webhooks.on("pull_request.opened", async ({ octokit, payload }) => {
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
        });

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