import ApiProvider, { IApiProvider } from "../api-provider/api-provider.js";

interface IOpenAIService {
  getEmbedding: ({ input }: { input: string }) => Promise<number[]>;
  explainCode: ({
    code,
  }: {
    code: string;
  }) => Promise<{ title: string; description: string }>;
}

export default class OpenAIService implements IOpenAIService {
  public api: IApiProvider;

  constructor() {
    this.api = new ApiProvider({
      //@ts-ignore
      baseURL: process.env.OPENAI_API_URL,
      authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    });
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
    const data = await this.api.post("/chat/completions", {
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant.",
        },
        {
          role: "user",
          content:
            "Given the following line of code, generate a possible corresponding use story. e.g as a use I would like to",
        },
        {
          role: "user",
          content: JSON.stringify(code),
        },
      ],
      model: "gpt-3.5-turbo",
    });

    return JSON.parse(data.choices?.[0].message.content);
  };
}
