import {checkActiveSales} from "./controllers/productController";
import * as dotenv from "dotenv";
import {initializeApp} from "firebase-admin/app";

// Carregar variáveis de ambiente
dotenv.config();

// Inicializar o Firebase Admin SDK
initializeApp();

const runCheckActiveSales = async () => {
  console.log("Running checkActiveSales function...");
  await checkActiveSales();
};

// Executar a função a cada 10 segundos
setInterval(runCheckActiveSales, 10000);
