import axios from "axios";
export default class ApiProvider {
    client;
    constructor({ baseURL, authorization, }) {
        this.client = axios.create({
            baseURL,
            headers: {
                Authorization: authorization,
                "Content-Type": "application/json",
            },
        });
    }
    get(path) {
        return this.client.get(path).then((response) => response.data);
    }
    post(path, payload) {
        return this.client.post(path, payload).then((response) => response.data);
    }
    put(path, payload) {
        return this.client.put(path, payload).then((response) => response.data);
    }
    delete(path) {
        return this.client.delete(path).then((response) => response.data);
    }
}
//# sourceMappingURL=api-provider.js.map