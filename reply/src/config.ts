import * as functions from "firebase-functions";

const env = functions.config().env;

export const lineConfig = {
  channelAccessToken: env.line.channel_access_token || "",
  channelSecret: env.line.channel_secret || "",
};

export const firebaseConfig = {
  projectId: env.firebase.project_id || "",
  privateKey: env.firebase.private_key || "",
  clientEmail: env.firebase.client_email || "",
};
