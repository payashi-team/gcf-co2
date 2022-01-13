import * as functions from "firebase-functions";
import * as line from "@line/bot-sdk";
import client from "./line-client";
import { lineConfig } from "./config";
import { db } from "./firebase";

export const reply = functions
  .region("asia-northeast1")
  .https.onRequest(async (request, response) => {
    const signature = request.get("x-line-signature");

    if (
      !signature ||
      !line.validateSignature(
        request.rawBody,
        lineConfig.channelSecret,
        signature
      )
    ) {
      throw new line.SignatureValidationFailed(
        "signature validation failed",
        signature
      );
    }

    Promise.all(request.body.events.map(lineEventHandler))
      .then((result) => response.json(result))
      .catch((error) => console.error(error));
  });

const lineEventHandler = async (event: line.WebhookEvent) => {
  if (event.type !== "message") {
    console.log("event type is not message");
    return Promise.resolve(null);
  }
  try {
    if (event.message.type === "text") {
      const durationMsg = event.message.text.match(/(\d+)分/);
      let duration = 60;

      if (durationMsg && durationMsg.length > 1) {
        const t = parseInt(durationMsg[1]);
        if (!isNaN(t)) {
          duration = t;
        }
      }

      const data = await getData(duration); // min
      let arr = [] as Array<Sensor>;
      for (const itr in data) {
        arr.push(data[itr]);
      }
      let text = "";
      if (arr.length > 0) {
        arr.forEach((item) => {
          const time = new Date(item.sensor_timestamp).toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo",
          });
          text +=
            `${time}のデータをお知らせするもち!\n` +
            `CO2: ${item.co2.toFixed(3)}ppm\n` +
            `温度: ${item.temp.toFixed(3)}℃\n` +
            `湿度: ${item.humid.toFixed(3)}%`;
        });
      } else {
        text = "no data";
      }
      // reply echo message
      const message: line.TextMessage = {
        type: "text",
        // text: event.message.text,
        text,
      };
      return client.replyMessage(event.replyToken, message);
    } else {
      return Promise.resolve(null);
    }
  } catch (error) {
    console.error(JSON.stringify(error));
    return Promise.resolve(null);
  }
};

const getData = async (duration: number) => {
  functions.logger.log(`duration: ${duration}`);
  try {
    const data = await db
      .ref("/SCD30")
      .orderByChild("sensor_timestamp")
      .startAt(Date.now() - 1000 * 60 * duration) // last duration minutes
      .limitToLast(1)
      .get();
    return data.val() as Record<string, Sensor>;
  } catch (error) {
    functions.logger.log(error);
    return {};
  }
};

type Sensor = {
  X: number;
  Y: number;
  Z: number;
  co2: number;
  temp: number;
  humid: number;
  sensor_timestamp: number;
};
