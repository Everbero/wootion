// src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {checkAndSyncProducts} from "./controllers/productSyncController";
import {checkActiveSales} from "./controllers/salesController";
import {
  getProductDetails,
  getFormattedProductDetails,
} from "./controllers/productDetailsController";

import {updateEcommerceCode} from "./controllers/notionSyncController";

if (!admin.apps.length) {
  admin.initializeApp();
}
// lê o banco de dados e envia produtos para o WooCommerce
exports.scheduledCheckWooCommerce = functions.pubsub
  .schedule("every 30 minutes")
  .onRun(async () => {
    await checkAndSyncProducts();
  });

// busca produtos marcados como disponíveis no e-commerce e os envia para o WooCommerce
exports.scheduledCheckActiveSales = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async () => {
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

// Agenda a execução da função a cada 1 hora
exports.scheduledUpdateNotion = functions.pubsub
  .schedule("every 1 hours") // Define o cron para executar a cada 1 hora
  .timeZone("America/Sao_Paulo") // Ajusta para o fuso horário correto
  .onRun(async () => {
    console.log("Iniciando atualização das páginas no Notion...");
    try {
      await updateEcommerceCode();
      console.log("Atualização concluída com sucesso.");
    } catch (error) {
      console.error("Erro ao executar a atualização:", error);
    }
  });
// testa escrita no Firestore
export const testFirestoreWrite = functions.https.onRequest(
  async (req, res) => {
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
  }
);
