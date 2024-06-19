import * as admin from "firebase-admin";
import {sendProductToWooCommerce} from "../services/woocommerceService";
import * as functions from "firebase-functions";
import {getFormattedProductDetailsInternal} from "./productDetailsController";

const db = admin.firestore();

export const checkAndSyncProducts = async (): Promise<void> => {
  functions.logger.info("checkAndSyncProducts function triggered");

  const snapshot = await db.collection("products").get();
  const promises = snapshot.docs.map(async (doc) => {
    const product = doc.data();
    const {id, lastEditedTime, lastPostedToWc, wcID} = product;

    if (!lastPostedToWc || new Date(lastPostedToWc) < new Date(lastEditedTime)) {
      try {
        const productDetails = await getFormattedProductDetailsInternal(id);

        const response = await sendProductToWooCommerce(productDetails, wcID);
        await db.collection("products").doc(id).update({lastPostedToWc: new Date().toISOString(), wcID: response.id});
        functions.logger.info(`Product ${id} sent to WooCommerce and updated`);
      } catch (error) {
        functions.logger.error(`Error sending product ${id} to WooCommerce:`, error);
      }
    }
  });

  await Promise.all(promises);
};
