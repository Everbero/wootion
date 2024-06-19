import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

const woocommerceApiUrl = process.env.WOOCOMMERCE_API_URL;
const woocommerceConsumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const woocommerceConsumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

export const sendProductToWooCommerce = async (productData: any, productId: number | null) => {
  let url = `${woocommerceApiUrl}/products`;
  
  const auth = Buffer.from(`${woocommerceConsumerKey}:${woocommerceConsumerSecret}`).toString('base64');
  if(productId) {
    productData.id = productId;
    url = `${woocommerceApiUrl}/products/${productId}`;
  }
  const response = await fetch(url, {
    method: !productId ? 'POST' : "PUT",
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    console.log('Error:', productData);
    throw new Error(`Failed to send product to WooCommerce: ${response.statusText}`);
  }

  // save the product id to the firestore
  return await response.json();
};