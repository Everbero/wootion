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

exports.scheduledCheckWooCommerce = functions.pubsub.schedule('every 10 minutes').onRun(async (context) => {
  await checkAndSyncProducts();
});

exports.scheduledCheckActiveSales = functions.pubsub.schedule('every minute').onRun(async (context) => {
  await checkActiveSales();
});

exports.getProductDetails = functions.https.onRequest((req, res) => {
  getProductDetails(req, res);
});

exports.formattedProductDetails = functions.https.onRequest((req, res) => {
  getFormattedProductDetails(req, res);
});