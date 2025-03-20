const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Middleware para logar todas as requisições
app.use((req, res, next) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers,
    timestamp: new Date().toISOString(),
  };

  // Formatar os dados do log
  const logString = JSON.stringify(logData, null, 2) + "\n\n";

  // Defina o caminho do arquivo de log
  const logFilePath = path.join(
    __dirname,
    "logs",
    `log_${new Date().toISOString().split("T")[0]}.txt`
  );

  // Cria o diretório 'logs' se não existir
  if (!fs.existsSync(path.dirname(logFilePath))) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
  }

  // Escreve o log no arquivo
  fs.appendFile(logFilePath, logString, (err) => {
    if (err) {
      console.error("Erro ao escrever no arquivo de log:", err);
    }
  });

  next();
});

const routes = express.Router();

routes.post("/webhook", (req, res) => {
  console.log("Requisição recebida");
  const { body, params, query, headers } = req;
  console.log({ body, params, query, headers });
  return res.status(200).send();
});

app.use(routes);

app.listen(3000, () => {
  console.log("Server Up");
});
