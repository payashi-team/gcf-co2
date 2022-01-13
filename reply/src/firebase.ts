// Initialize firebase admin SDK w/ SA key
import * as admin from "firebase-admin";
import { firebaseConfig } from "./config";

const serviceAccount = firebaseConfig as admin.ServiceAccount;

if (!admin.apps.length)
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL:
      "https://payashi-playground-default-rtdb.asia-southeast1.firebasedatabase.app",
  });

export const db = admin.database();

export default admin;
