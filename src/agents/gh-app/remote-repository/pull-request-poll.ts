import axios from "axios";
import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // GitHub Personal access token
});

let lastCheckedPrNumber = 0; // Store the last PR number that was checked

export const remotePrPoller = () =>
  setInterval(async () => {
    const response = await axios.get(
      "https://api.github.com/repos/microsoft/vscode/pulls",
    );
    console.log(response.data.length);
    for (const pr of response.data) {
      if (pr.number > lastCheckedPrNumber) {
        // new PR detected, create a new PR on your repo
        /*
        const { data: ref } = await octokit.git.createRef({
          owner: "yourusername",
          repo: "yourrepo",
          ref: `refs/heads/${pr.head.ref}`,
          sha: pr.head.sha,
        });

        const { data: newPr } = await octokit.pulls.create({
          owner: "yourusername",
          repo: "yourrepo",
          title: pr.title,
          head: pr.head.ref,
          base: pr.base.ref,
        });

        console.log(`Created new PR ${newPr.number} on your repo`);*/

        lastCheckedPrNumber = pr.number; // Update the last checked PR number
      }
    }
  }, 10000); // Poll every 60 seconds
