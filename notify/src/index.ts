import * as functions from "firebase-functions";
import client from "./line-client";
import { db } from "./firebase";

const duration = 1;

export const notify = functions
  .region("asia-northeast1")
  .pubsub.topic("cron-topic")
  .onPublish(async (event) => {
    const data = await getData();
    let arr = [] as Array<Sensor>;
    let text = "";
    for (const itr in data) {
      arr.push(data[itr]);
    }
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
      client.broadcast({
        type: "text",
        text,
      });
    } else {
      functions.logger.log("no data");
    }
  });

const getData = async () => {
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
