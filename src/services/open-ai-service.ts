import ApiProvider, { IApiProvider } from "../api-provider/api-provider";

interface IOpenAIService {
  getEmbedding: ({ input }: { input: string }) => Promise<number[]>;
  explainCode: ({
    code,
  }: {
    code: string;
  }) => Promise<{ title: string; description: string }>;
}

class OpenAIService implements IOpenAIService {
  public api: IApiProvider;

  constructor(api: IApiProvider) {
    this.api = api;
  }

  getEmbedding = async ({ input }: { input: string }) => {
    const {
      data: { data },
    } = await this.api.post("/embeddings", {
      input,
      model: "text-embedding-ada-002",
    });
    return data[0].embedding as number[];
  };

  explainCode = async ({ code }: { code: string }) => {
    const { data } = await this.api.post("/chat/completions", {
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant",
        },
        {
          role: "user",
          content:
            "Given the following line of code, generate a possible corresponding JIRA ticket, in json format of the  structure: {title:...,description:...,acceptanceCriteria:...} ",
        },
        {
          role: "user",
          content: code,
        },
      ],
      model: "gpt-3.5-turbo",
    });
    return JSON.parse(data.choices?.[0].message.content);
  };
}

if (!process.env.OPENAI_API_URL)
  throw new Error("OPENAI_API_URL is not defined");

const api = new ApiProvider({
  baseURL: process.env.OPENAI_API_URL,
  authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
});

export default new OpenAIService(api.client);
