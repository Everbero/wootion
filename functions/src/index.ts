// src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { checkAndSyncProducts } from './controllers/productSyncController';
import { checkActiveSales } from './controllers/productController';
import { getProductDetails } from './controllers/productDetailsController';
import { getFormattedProductDetails } from './controllers/productDetailsController';

if (!admin.apps.length) {
  admin.initializeApp();
}
// lê o banco de dados e envia produtos para o WooCommerce
exports.scheduledCheckWooCommerce = functions.pubsub.schedule('every 10 minutes').onRun(async (context) => {
  await checkAndSyncProducts();
});

// busca produtos marcados como disponíveis no e-commerce e os envia para o WooCommerce
exports.scheduledCheckActiveSales = functions.pubsub.schedule('every minute').onRun(async (context) => {
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