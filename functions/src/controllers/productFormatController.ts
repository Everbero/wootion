import { getProductDetailsFromNotion } from "../services/notionService";

type BlockType = "callout" | "paragraph" | "bulleted_list_item" | "heading_2" | "heading_3" | "divider" | "quote" | "table" | "table_row" | "child_database" | "column_list" | "column";

interface ContentBlock {
  id: string;
  type: BlockType;
  content: string;
  children?: ContentBlock[];
}

interface ProductDetails {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
  content: ContentBlock[];
}

const formatContent = (content: ContentBlock[]): string => {
  return content.map(block => {
    let formattedContent = block.content;
    if (block.children && block.children.length > 0) {
      formattedContent += formatContent(block.children);
    }

    switch (block.type) {
      case "callout":
        return `<div class="callout">${formattedContent}</div>`;
      case "paragraph":
        return `<p>${formattedContent}</p>`;
      case "bulleted_list_item":
        return `<li>${formattedContent}</li>`;
      case "heading_2":
        return `<h2>${formattedContent}</h2>`;
      case "heading_3":
        return `<h3>${formattedContent}</h3>`;
      case "divider":
        return `<hr />`;
      case "quote":
        return `<blockquote>${formattedContent}</blockquote>`;
      case "table":
        return `<table>${formattedContent}</table>`;
      case "table_row":
        return `<tr>${formattedContent}</tr>`;
      case "child_database":
      case "column_list":
      case "column":
        return formattedContent;
      default:
        return formattedContent;
    }
  }).join("");
};

export const getFormattedProductDetails = async (productId: string): Promise<ProductDetails> => {
  const productDetails = await getProductDetailsFromNotion(productId);

  // Formata o conteúdo
  productDetails.content = productDetails.content.map(block => ({
    ...block,
    content: formatContent([block])
  }));

  return productDetails;
};
