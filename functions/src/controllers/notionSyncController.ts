import {Client} from "@notionhq/client";
import * as admin from "firebase-admin";

// Inicialize o Firestore e o cliente do Notion
const notion = new Client({auth: process.env.NOTION_API_KEY});
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Atualiza a propriedade 'Código Ecommerce' no Notion, apenas para produtos não atualizados.
 */
export async function updateEcommerceCode() {
  try {
    // Obter todos os documentos do Firestore que ainda não foram atualizados no Notion
    const snapshot = await db
      .collection("products")
      .where("notionUpdated", "!=", true) // Filtra produtos não atualizados
      .get();

    if (snapshot.empty) {
      console.log("Nenhum dado novo para atualizar no Notion.");
      return;
    }

    // Iterar sobre os documentos e atualizar no Notion
    const updates = snapshot.docs.map(async (doc: any) => {
      const data = doc.data();

      // Validar se os campos necessários existem
      if (!data.id || !data.wcID) {
        console.log(`Dados incompletos no documento: ${doc.id}`);
        return;
      }

      try {
        // Atualizar a propriedade no Notion
        await notion.pages.update({
          page_id: data.id,
          properties: {
            "Código e-commerce": {
              type: "number",
              number: data.wcID,
            },
          },
        });

        console.log(`Página ${data.id} atualizada com wcID ${data.wcID}.`);

        // Atualizar o marcador no Firestore
        await db.collection("your-collection-name").doc(doc.id).update({
          notionUpdated: true,
          lastNotionUpdate: new Date().toISOString(), // Timestamp da última atualização
        });
      } catch (notionError) {
        console.error(`Erro ao atualizar a página ${data.id} no Notion:`, notionError);
      }
    });

    // Aguarde todas as promessas serem resolvidas
    await Promise.all(updates);
    console.log("Atualização concluída.");
  } catch (error) {
    console.error("Erro ao atualizar o Notion:", error);
  }
}


