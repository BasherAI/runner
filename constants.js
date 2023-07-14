import { v4 as uuidv4 } from "uuid";

export const SERVER_URL = "https://api.basher.dev";
export const TOKEN = uuidv4();
export const PORT = process.env.PORT || 3000;
