import { Client } from "@notionhq/client";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import {
  PageObjectResponse,
  BlockObjectResponse,
  ListBlockChildrenResponse,
  RichTextItemResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  ParagraphBlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ToDoBlockObjectResponse,
  ToggleBlockObjectResponse,
  ChildPageBlockObjectResponse,
  CalloutBlockObjectResponse,
  QuoteBlockObjectResponse,
  CodeBlockObjectResponse,
  ImageBlockObjectResponse,
  VideoBlockObjectResponse,
  FileBlockObjectResponse,
  PdfBlockObjectResponse,
  BookmarkBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
dotenv.config();

// Inicializar o Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

interface Product {
  id: string;
  name: string;
  lastEditedTime: string;
  lastPostedToWc?: string;
}

interface SimplifiedPage {
  id: string;
  created_time: string;
  last_edited_time: string;
  properties: Record<string, any>;
  content: any[];
}

export const getActiveSalesProducts = async (): Promise<Product[]> => {
  const response = await notion.databases.query({
    database_id: databaseId as string,
    filter: {
      property: "Vendas",
      select: {
        equals: "💲 Ativadas",
      },
    },
  });

  // Mapeia os resultados para extrair o id, nome e data de edição
  const products = response.results.map((product: any) => {
    const id = product.id;
    const name =
      product.properties["Produto"]?.title[0]?.text?.content ??
      "Unnamed product";
    const lastEditedTime = product.last_edited_time;

    return {
      id,
      name,
      lastEditedTime,
    };
  });

  // Salvar produtos no Firestore
  const batch = db.batch();
  products.forEach((product) => {
    const productRef = db.collection("products").doc(product.id);
    batch.set(productRef, product);
  });

  await batch.commit();

  return products;
};

export const getProductDetailsFromNotion = async (pageId: string): Promise<SimplifiedPage> => {
  const page = await notion.pages.retrieve({ page_id: pageId }) as PageObjectResponse;
  const blocks = await getBlockChildren(pageId);

  const simplifiedPage: SimplifiedPage = {
    id: page.id,
    created_time: page.created_time,
    last_edited_time: page.last_edited_time,
    properties: extractProperties(page.properties),
    content: blocks,
  };

  return simplifiedPage;
};


const getBlockChildren = async (blockId: string): Promise<any[]> => {
  const blocks: BlockObjectResponse[] = [];
  let cursor: string | null | undefined = undefined;

  do {
    const response: ListBlockChildrenResponse = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    });
    const { results, next_cursor } = response;
    blocks.push(...(results as BlockObjectResponse[]));
    cursor = next_cursor;
  } while (cursor);

  const simplifiedBlocks: any[] = [];
  for (const block of blocks) {
    const simplifiedBlock: Record<string, any> = await simplifyBlock(block);
    simplifiedBlocks.push(simplifiedBlock);
  }
  return simplifiedBlocks;
};

const extractProperties = (properties: PageObjectResponse['properties']): Record<string, any> => {
  const simplifiedProperties: Record<string, any> = {};
  for (const key in properties) {
    if (properties.hasOwnProperty(key)) {
      const property = properties[key];
      simplifiedProperties[key] = extractPropertyValue(property);
    }
  }
  return simplifiedProperties;
};

const extractPropertyValue = (property: any): any => {
  switch (property.type) {
    case 'title':
      return property.title.map(extractTextContent).join('');
    case 'rich_text':
      return property.rich_text.map(extractTextContent).join('');
    case 'number':
      return property.number;
    case 'select':
      return property.select ? property.select.name : null;
    case 'multi_select':
      return property.multi_select.map((item: any) => item.name);
    case 'date':
      return property.date ? property.date.start : null;
    case 'formula':
      return property.formula ? property.formula.string : null;
    case 'relation':
      return property.relation.map((item: any) => item.id);
    case 'rollup':
      return property.rollup.array.map((item: any) => extractPropertyValue(item));
    case 'people':
      return property.people.map((person: any) => person.name);
    case 'files':
      return property.files.map((file: any) => file.file.url);
    default:
      return null;
  }
};

const extractTextContent = (richTextItem: RichTextItemResponse): string => {
  if ('text' in richTextItem) {
    return richTextItem.text.content;
  } else if ('mention' in richTextItem) {
    return '[Mention]';
  } else if ('equation' in richTextItem) {
    return richTextItem.equation.expression;
  }
  return '';
};

const simplifyBlock = async (block: BlockObjectResponse): Promise<Record<string, any>> => {
  const { id, type, has_children } = block;
  const content = await extractBlockContent(block);

  const simplifiedBlock: Record<string, any> = { id, type, content };

  if (has_children) {
    const children = await getBlockChildren(block.id);
    simplifiedBlock.children = children;
  }

  return simplifiedBlock;
};

const extractBlockContent = async (block: BlockObjectResponse): Promise<string> => {
  switch (block.type) {
    case 'paragraph':
      return (block as ParagraphBlockObjectResponse).paragraph.rich_text.map(extractTextContent).join(' ');
    case 'heading_1':
      return (block as Heading1BlockObjectResponse).heading_1.rich_text.map(extractTextContent).join(' ');
    case 'heading_2':
      return (block as Heading2BlockObjectResponse).heading_2.rich_text.map(extractTextContent).join(' ');
    case 'heading_3':
      return (block as Heading3BlockObjectResponse).heading_3.rich_text.map(extractTextContent).join(' ');
    case 'bulleted_list_item':
      return (block as BulletedListItemBlockObjectResponse).bulleted_list_item.rich_text.map(extractTextContent).join(' ');
    case 'numbered_list_item':
      return (block as NumberedListItemBlockObjectResponse).numbered_list_item.rich_text.map(extractTextContent).join(' ');
    case 'to_do':
      return (block as ToDoBlockObjectResponse).to_do.rich_text.map(extractTextContent).join(' ');
    case 'toggle':
      return (block as ToggleBlockObjectResponse).toggle.rich_text.map(extractTextContent).join(' ');
    case 'child_page':
      return (block as ChildPageBlockObjectResponse).child_page.title;
    case 'callout':
      return (block as CalloutBlockObjectResponse).callout.rich_text.map(extractTextContent).join(' ');
    case 'quote':
      return (block as QuoteBlockObjectResponse).quote.rich_text.map(extractTextContent).join(' ');
    case 'code':
      return (block as CodeBlockObjectResponse).code.rich_text.map(extractTextContent).join(' ');
    case 'divider':
      return '---';
    case 'image':
      return (block as ImageBlockObjectResponse).image.caption.map(extractTextContent).join(' ');
    case 'video':
      return (block as VideoBlockObjectResponse).video.caption.map(extractTextContent).join(' ');
    case 'file':
      return (block as FileBlockObjectResponse).file.caption.map(extractTextContent).join(' ');
    case 'pdf':
      return (block as PdfBlockObjectResponse).pdf.caption.map(extractTextContent).join(' ');
    case 'bookmark':
      return (block as BookmarkBlockObjectResponse).bookmark.caption.map(extractTextContent).join(' ');
    default:
      return '';
  }
};