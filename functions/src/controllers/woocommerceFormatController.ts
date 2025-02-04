import {FormattedContent, WooCommerceProduct} from "../models/formatModel";

// retorna datas formatadas para exibição
function formatDate(date: string): string {
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString("pt-BR");
}
// formata os dados do produto para o WooCommerce
export function formatForWooCommerce(
  data: FormattedContent,
  wcID?: number
): WooCommerceProduct {
  return {
    id: wcID ?? 0,
    name: data.properties["Nome Guru e Agendor"],
    type: "simple",
    virtual: true,
    regular_price: data.properties.Preço.toString(),
    sale_price: data.properties["Preço Promocional"] ?
      data.properties["Preço Promocional"].toString() :
      "",
    description: data.content.description,
    short_description: data.content.short_description,
    categories: [{id: 85}], // Categoria Cursos
    acf: {
      "banca-examinadora": data.properties["Banca Examinadora"],
      "carreira": data.properties.Carreira,
      "escolaridade": data.properties.Escolaridade,
      "regiao": data.properties.Região,
    },
    images: data.properties.Capa.map((url) => ({src: url})),
    meta_data: [
      {key: "quantidade-de-vagas", value: data.properties.Vagas},
      {key: "taxa-de-inscricao", value: data.properties["Taxa Incrição"]},
      {
        key: "salario",
        value:
          data.properties.Remuneração?.toLocaleString("pt-br", {
            minimumFractionDigits: 2,
            currency: "BRL",
            style: "currency",
            currencyDisplay: "symbol",
          }) ?? "Não divulgado",
      },
      {key: "banca-examinadora", value: data.properties["Banca Examinadora"]},
      {key: "caracteristica", value: data.properties.Característica},
      {key: "escolaridade", value: data.properties.Escolaridade.join(", ")},
      {
        key: "data-da-prova",
        value: data.properties["Data da Prova"] ?
          formatDate(data.properties["Data da Prova"]) :
          "Não se aplica",
      },
      {key: "link-edital", value: data.properties["Link Edital"]},
      {key: "formato", value: data.properties.Formato},
      {key: "regiao", value: data.properties.Região},
      {key: "produto", value: data.properties.Produto},
      {key: "icone", value: ""},
      {key: "_icone", value: "field_65086a9e0f67c"},
      {key: "midia-externa_accordion", value: ""},
      {key: "midia-externa", value: ""},
      {key: "link-video", value: data.properties["Vídeo e-commerce"] ?? ""},
      {
        key: "inscricao",
        value: data.properties["Data Inscrição"] ?
          `${formatDate(data.properties["Data Inscrição"])} até ${formatDate(
            data.properties["Data da Prova"]
          )}` :
          "Não se aplica",
      },
      {key: "instituicao", value: ""},
      {key: "bonus_8", value: ""},
      {key: "bonus", value: data.properties["Bônus Incluídos"]},
      {key: "informacoes-do-concurso", value: ""},
      {key: "jupiterx_reading_time", value: "4 minutes"},
    ],
  };
}
