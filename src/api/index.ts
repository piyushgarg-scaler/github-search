import axios from "axios";

export const githubAPIInstance = axios.create({
  baseURL: "https://api.github.com/",
  responseType: "json",
});
