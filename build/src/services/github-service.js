import ApiProvider from "../api-provider/api-provider";
class GithubService {
    api;
    constructor(api) {
        this.api = api;
    }
    getRepos = () => {
        return this.api.get("/repos");
    };
    searchRepos = (searchString) => {
        return this.api.get(`/search/repositories?q=${searchString}`);
    };
    openPullRequest = (branchName) => {
        const repoFullName = "owner/repo";
        const data = {
            title: "Pull Request Title",
            head: branchName,
            base: "master",
        };
        return this.api.post(`/repos/${repoFullName}/pulls`, data);
    };
}
if (!process.env.GITHUB_API_URL)
    throw new Error("GITHUB_API_URL is not defined");
const api = new ApiProvider({
    baseURL: process.env.GITHUB_API_URL,
    authorization: `token ${process.env.GITHUB_TOKEN}`,
});
export default new GithubService(api.client);
//# sourceMappingURL=github-service.js.map