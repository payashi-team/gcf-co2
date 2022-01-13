import * as line from "@line/bot-sdk";

import { lineConfig } from "./config";

const client = new line.Client(lineConfig);
export default client;
