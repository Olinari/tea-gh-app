import ApiProvider from "../api-provider/api-provider";
class OpenAIService {
    api;
    constructor(api) {
        this.api = api;
    }
    getEmbedding = async ({ input }) => {
        const { data: { data }, } = await this.api.post("/embeddings", {
            input,
            model: "text-embedding-ada-002",
        });
        return data[0].embedding;
    };
    explainCode = async ({ code }) => {
        const { data } = await this.api.post("/chat/completions", {
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant",
                },
                {
                    role: "user",
                    content: "Given the following line of code, generate a possible corresponding JIRA ticket, in json format of the  structure: {title:...,description:...,acceptanceCriteria:...} ",
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
//# sourceMappingURL=open-ai-service.js.map