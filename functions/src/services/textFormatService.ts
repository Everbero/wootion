type BlockType =
  | "callout"
  | "paragraph"
  | "bulleted_list_item"
  | "heading_2"
  | "heading_3"
  | "divider"
  | "quote"
  | "table"
  | "table_row"
  | "child_database"
  | "column_list"
  | "column";

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

const exclusionList = [
  "ORDERBUMP",
  "CONDIÇÕES COMERCIAIS",
  "Links do Produto",
  "Informações de Marketing",
];

// const sanitizeClassName = (name: string): string => {
//   return name
//     .toLowerCase()
//     .replace(/[^a-z0-9]/g, "-")
//     .replace(/-+/g, "-")
//     .replace(/^-|-$/g, "");
// };

const formatContent = (blocks: ContentBlock[]): string => {
  let formattedContent = "";

  blocks.forEach((block) => {
    const content = block.content;
    const childContent = block.children ? formatContent(block.children) : "";

    switch (block.type) {
    case "paragraph":
      formattedContent += `<p>${content}</p>`;
      break;
    case "bulleted_list_item":
      formattedContent += `<li>${content}</li>`;
      break;
    case "heading_2":
      formattedContent += `<h2>${content}</h2>`;
      break;
    case "heading_3":
      formattedContent += `<h3>${content}</h3>`;
      // Append childContent outside of the h3 tag if it contains list items
      if (
        block.children &&
          block.children.some((child) => child.type === "bulleted_list_item")
      ) {
        formattedContent += `<ul>${childContent}</ul>`;
      } else {
        formattedContent += childContent;
      }
      break;
    case "divider":
      formattedContent += "<hr />";
      break;
    case "quote":
      formattedContent += `<blockquote>${content}</blockquote>`;
      break;
    default:
      formattedContent += content;
      if (childContent) {
        formattedContent += childContent;
      }
      break;
    }
  });

  return formattedContent;
};

const shouldExcludeBlock = (block: ContentBlock): boolean => {
  const key = block.content.split(":")[0].trim();
  if (exclusionList.includes(key)) {
    return true;
  }
  if (
    key === "BÔNUS" &&
    block.children &&
    block.children.every((child) => child.content === "Não se aplica.")
  ) {
    return true;
  }
  return false;
};

const filterExclusionList = (content: ContentBlock[]): ContentBlock[] => {
  return content.filter((block) => {
    if (shouldExcludeBlock(block)) {
      return false;
    }
    if (block.children && block.children.length > 0) {
      block.children = filterExclusionList(block.children);
    }
    return true;
  });
};

const extractAndFormatContent = (
  content: ContentBlock[]
): Record<string, string> => {
  const formattedContent: Record<string, string> = {};
  // let shortDescription = "";
  let description = "";
  // let inDescriptionSection = false;
  let detailedContent = "";

  content.forEach((block) => {
    const key = block.content.split(":")[0].trim();
    // let value = "";

    if (key === "Descrição e-commerce") {
      block.children?.forEach((childBlock) => {
        description += formatContent([childBlock]);
      });

      formattedContent[
        "description"
      ] = `<div class="description">${description}</div>`;
    } else if (key === "Nome do Produto no Guru") {
      formattedContent["name"] = block.content.split(":")[1].trim();
    } else if (key === "Informações Gerais do Curso") {
      block.children?.forEach((childBlock) => {
        if (childBlock.content === "CONTEÚDO DETALHADO:") {
          detailedContent = formatContent(childBlock.children || []);
        }
      });
    }
    // else {

    //   if (block.children && block.children.length > 0) {
    //     let childContent = formatContent(block.children);
    //     // Ensure list items are not nested in headings
    //     if (block.type === "heading_3" || block.type === "heading_2") {
    //       formattedContent[key] = `<h3>${block.content}</h3>`;
    //       childContent = childContent
    //         .replace(/<li>/g, "")
    //         .replace(/<\/li>/g, "");
    //       formattedContent[key] += childContent;
    //     } else {
    //       childContent = `<div class="${sanitizeClassName(
    //         key
    //       )}">${childContent}</div>`;
    //       formattedContent[key] = childContent;
    //     }
    //   } else {
    //     value = formatContent([block]);
    //     if (key === block.content) {
    //       formattedContent[key] = `<div class="${sanitizeClassName(
    //         key
    //       )}">${value}</div>`;
    //     } else {
    //       formattedContent[key] = `<div class="${sanitizeClassName(key)}">${
    //         block.content.split(":")[1]
    //       }</div>`;
    //     }
    //   }
    // }
    // extrai a descrição curta do produto
    if (key === "Headline e-commerce") {
      block.children?.forEach((childBlock) => {
        formattedContent["short_description"] = `<h2>${childBlock.content
          .replace("Headline:", "")
          .trim()}</h2>`;
      });
    }
    // extrai a descrição curta do produto
    if (key === "Subheadline e-commerce") {
      block.children?.forEach((childBlock) => {
        formattedContent["short_description"] += `<p>${childBlock.content
          .replace("Subheadline:", "")
          .trim()}</p>`;
      });
    }
  });

  if (detailedContent) {
    formattedContent[
      "description"
    ] += `<div class="conteudo-detalhado">${detailedContent}</div>`;
  }

  // Remove empty keys
  for (const key in formattedContent) {
    if (!formattedContent[key] || formattedContent[key].trim() === "") {
      delete formattedContent[key];
    }
  }

  return formattedContent;
};

export const formatTextContent = (productDetails: ProductDetails): any => {
  const filteredContent = filterExclusionList(productDetails.content);
  const formattedContent = extractAndFormatContent(filteredContent);
  return {
    ...productDetails,
    content: formattedContent,
  };
};
