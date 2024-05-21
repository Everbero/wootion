import fetch from 'node-fetch';
import * as dotenv from 'dotenv';

dotenv.config();

const woocommerceApiUrl = process.env.WOOCOMMERCE_API_URL;
const woocommerceConsumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY;
const woocommerceConsumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET;

export const sendProductToWooCommerce = async (productData: any) => {
  const url = new URL(`${woocommerceApiUrl}/products`);
  
  const auth = Buffer.from(`${woocommerceConsumerKey}:${woocommerceConsumerSecret}`).toString('base64');

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw new Error(`Failed to send product to WooCommerce: ${response.statusText}`);
  }

  return await response.json();
};