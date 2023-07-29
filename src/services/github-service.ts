import ApiProvider, { IApiProvider } from "@src/api-provider/api-provider";

interface IGithubService {
  getRepos: () => Promise<any>;
  searchRepos: (searchString: string) => Promise<any>;
  openPullRequest: (branchName: string) => Promise<any>;
}

class GithubService implements IGithubService {
  public api: IApiProvider;

  constructor(api: IApiProvider) {
    this.api = api;
  }

  getRepos = () => {
    return this.api.get("/repos");
  };

  searchRepos = (searchString: string) => {
    return this.api.get(`/search/repositories?q=${searchString}`);
  };

  openPullRequest = (branchName: string) => {
    const repoFullName = "owner/repo";
    const data = {
      title: "Pull Request Title",
      head: branchName,
      base: "master",
    };
    return this.api.post(`/repos/${repoFullName}/pulls`, data);
  };
}

const api = new ApiProvider({
  baseURL: import.meta.env.VITE_GITHUB_API_URL,
  authorization: `token ${import.meta.env.VITE_GITHUB_TOKEN}`,
});

export default new GithubService(api.client);
