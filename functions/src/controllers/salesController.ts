import {getActiveSalesProducts} from "../services/notionService";
import * as functions from "firebase-functions";

export const checkActiveSales = async (): Promise<void> => {
  functions.logger.info("checkActiveSales function triggered");
  try {
    const products = await getActiveSalesProducts();
    functions.logger.info(
      "Products marked as Vendas Ativadas and saved to Firestore:",
      {products}
    );
  } catch (error) {
    functions.logger.error("Error checking for active sales:", error);
  }
};
