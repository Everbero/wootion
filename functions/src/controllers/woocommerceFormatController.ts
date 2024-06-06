type FormattedContent = {
    id: string;
    created_time: string;
    last_edited_time: string;
    properties: {
        Vagas: number;
        "Código Asaas": string | null;
        Responsável: Array<string | null>;
        "Taxa Incrição": number;
        "Display 01": string;
        Disciplinas: string | null;
        "Código e-commerce": string | null;
        Capa: Array<string>;
        "Display Responsável": string;
        "Link Inscrição": string | null;
        "Data Inscrição": string;
        Região: string;
        Vendas: string;
        Projetos: Array<string>;
        "Dia Semana": string | null;
        Carreira: string;
        "Prazo Início": string | null;
        Professores: Array<string>;
        "Unidades de Negócios": Array<string>;
        "Prazo Disponibilização": string | null;
        Remuneração: number | null;
        "Código Pagarme": string | null;
        Estados: Array<string>;
        "Data da Prova": string;
        Formato: string;
        "Nome Guru e Agendor": string;
        "Display Deadline": string | null;
        "Status do Curso": string;
        Aulas: Array<string>;
        "Link Edital": string;
        "Status das Aulas": string;
        Preço: number;
        "Banca Examinadora": string;
        Característica: string;
        "Drive Design": string | null;
        Escolaridade: Array<string>;
        Edital: string;
        "Fluxo de Disponibilização": string;
        "Vídeo e-commerce": string | null;
        "Aulas Disponibilizadas": Array<string>;
        Produto: string;
    };
    content: {
        short_description: string;
        description: string;
        "Script Headlines": string;
        "Script Comercial": string;
    };
};

type WooCommerceProduct = {
    name: string;
    type: string;
    regular_price: string;
    description: string;
    short_description: string;
    categories: Array<{ id: number }>;
    images: Array<{ src: string }>;
    meta_data: Array<{ key: string; value: any }>;
};

export function formatForWooCommerce(data: FormattedContent): WooCommerceProduct {
    return {
        name: data.properties["Nome Guru e Agendor"],
        type: "simple",
        regular_price: data.properties.Preço.toString(),
        description: data.content.description,
        short_description: data.content.short_description,
        categories: [{ id: 1 }], // Example category ID
        images: data.properties.Capa.map((url) => ({ src: url })),
        meta_data: [
            { key: "quantidade-de-vagas", value: data.properties.Vagas },
            { key: "taxa-de-inscricao", value: data.properties["Taxa Incrição"] },
            { key: "salario", value: data.properties.Remuneração ?? "" },
            { key: "banca-examinadora", value: data.properties["Banca Examinadora"] },
            { key: "caracteristica", value: data.properties.Característica },
            { key: "escolaridade", value: data.properties.Escolaridade.join(", ") },
            { key: "data-da-prova", value: data.properties["Data da Prova"] },
            { key: "link-edital", value: data.properties["Link Edital"] },
            { key: "formato", value: data.properties.Formato },
            { key: "regiao", value: data.properties.Região },
            { key: "produto", value: data.properties.Produto },
            { key: "icone", value: "" },
            { key: "_icone", value: "field_65086a9e0f67c" },
            { key: "midia-externa_accordion", value: "" },
            { key: "midia-externa", value: "" },
            { key: "link-video", value: data.properties["Vídeo e-commerce"] ?? "" },
            { key: "inscricao", value: `${data.properties["Data Inscrição"]} até ${data.properties["Data da Prova"]}` },
            { key: "instituicao", value: "" },
            { key: "bonus_8", value: "" },
            { key: "bonus", value: "" },
            { key: "informacoes-do-concurso", value: "" },
            { key: "jupiterx_reading_time", value: "4 minutes" }
        ]
    };
}
