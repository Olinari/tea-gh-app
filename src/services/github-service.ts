import ApiProvider, { IApiProvider } from "../api-provider/api-provider";

interface IGithubService {
  getRepos: () => Promise<any>;
  searchRepos: (searchString: string) => Promise<any>;
  openPullRequest: (branchName: string) => Promise<any>;
}

export default class GithubService implements IGithubService {
  public api: IApiProvider;

  constructor() {
    this.api = new ApiProvider({
      //@ts-ignore
      baseURL: process.env.GITHUB_API_URL,
      authorization: `token ${process.env.GITHUB_TOKEN}`,
    });
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

  getPullRequests = () => {
    const repoFullName = "owner/repo";
    return this.api.get(`/repos/${repoFullName}/pulls`);
  };
}

if (!process.env.GITHUB_API_URL)
  throw new Error("GITHUB_API_URL is not defined");
