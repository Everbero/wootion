// src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {checkAndSyncProducts} from "./controllers/productSyncController";
import {checkActiveSales} from "./controllers/productController";
import {getProductDetails, getFormattedProductDetails} from "./controllers/productDetailsController";

if (!admin.apps.length) {
  admin.initializeApp();
}
// lê o banco de dados e envia produtos para o WooCommerce
exports.scheduledCheckWooCommerce = functions.pubsub.schedule("every 30 minutes").onRun(async () => {
  await checkAndSyncProducts();
});

// busca produtos marcados como disponíveis no e-commerce e os envia para o WooCommerce
exports.scheduledCheckActiveSales = functions.pubsub.schedule("every 1 hours").onRun(async () => {
  await checkActiveSales();
});


// pega detalhes do produto no notion com uma formatação específica
exports.getProductDetails = functions.https.onRequest((req, res) => {
  getProductDetails(req, res);
});
// pega detalhes do produto no notion com uma formatação específica para o WooCommerce
exports.formattedProductDetails = functions.https.onRequest((req, res) => {
  getFormattedProductDetails(req, res);
});
// testa escrita no Firestore
export const testFirestoreWrite = functions.https.onRequest(async (req, res) => {
  const db = admin.firestore();

  try {
    await db.collection("products").doc("testProduct").set({
      name: "Test Product",
      price: 100,
    });
    res.status(200).send("Document written successfully");
  } catch (error) {
    console.error("Error writing document:", error);
    res.status(500).send("Error writing document");
  }
});
