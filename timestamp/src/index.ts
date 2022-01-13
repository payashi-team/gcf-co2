import * as functions from "firebase-functions";

export const timestamp = functions
  .region("asia-northeast1")
  .database.ref("/SCD30/{pushId}")
  .onCreate((snapshot, context) => {
    const original = snapshot.val();
    functions.logger.log("record added", context.params.pushId, original);
    return snapshot.ref.update({ ...original, sensor_timestamp: Date.now() });
  });
