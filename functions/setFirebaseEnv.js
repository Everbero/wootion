const { exec } = require("child_process");
// Carrega as variáveis do .env
require("dotenv").config();

const setFirebaseEnv = () => {
  const envVars = [
    `myconfig.woocommerce_api_url="${process.env.WOOCOMMERCE_API_URL}"`,
    `myconfig.woocommerce_consumer_key="${process.env.WOOCOMMERCE_CONSUMER_KEY}"`,
    `myconfig.woocommerce_consumer_secret="${process.env.WOOCOMMERCE_CONSUMER_SECRET}"`,
    `myconfig.notion_api_key="${process.env.NOTION_API_KEY}"`,
    `myconfig.notion_database_id="${process.env.NOTION_DATABASE_ID}"`,
    `myconfig.admin_email="${process.env.ADMIN_EMAIL}"`,
  ];

  const command = `firebase functions:config:set ${envVars.join(" ")}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao definir variáveis de ambiente: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Erro: ${stderr}`);
      return;
    }
    console.log(`Saída: ${stdout}`);
  });
};

// Executa a função para definir as variáveis de ambiente no Firebase
setFirebaseEnv();
