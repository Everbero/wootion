import { Request, Response } from "express";
import { getProductDetailsFromNotion } from "../services/notionService";
import * as functions from "firebase-functions";
import { formatTextContent } from "../services/textFormatService";
import { formatForWooCommerce } from "./woocommerceFormatController";

export const getProductDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.query;

  if (!id) {
    res.status(400).send("Product ID is required");
    return;
  }

  try {
    const productDetails = await getProductDetailsFromNotion(id as string);
    res.status(200).json(productDetails);
  } catch (error) {
    functions.logger.error(
      "Error fetching product details from Notion:",
      error
    );
    res.status(500).send("Internal Server Error");
  }
};

export const getFormattedProductDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.query;

    if (!id) {
      res.status(400).send("Product ID is required");
      return;
    }

    const productDetails = await getProductDetailsFromNotion(id as string);
    const formattedDetails = formatTextContent(productDetails);
    const wooCommerceProduct = formatForWooCommerce(formattedDetails);
    res.status(200).json(wooCommerceProduct);
  } catch (error) {
    console.error("Error getting product details:", error);
    res.status(500).send("Internal Server Error");
  }
};

export const getFormattedProductDetailsInternal = async (
  id: string
): Promise<any> => {
  try {
   
    if (!id) {
      throw new Error("Product ID is required");
    }

    const productDetails = await getProductDetailsFromNotion(id as string);
    const formattedDetails = await formatTextContent(productDetails);
    const wooCommerceProduct = formatForWooCommerce(formattedDetails);
    
    return wooCommerceProduct;
  } catch (error) {
    throw new Error("Internal Server Error");
  }
};