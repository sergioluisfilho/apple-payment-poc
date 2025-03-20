const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Middleware para logar todas as requisições
app.use((req, res, next) => {
  if (req.method === "POST") {
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
  }

  next();
});

const routes = express.Router();

routes.post("/webhook", (req, res) => {
  console.log("Requisição recebida");
  const { body, params, query, headers } = req;
  console.log({ body, params, query, headers });
  return res.status(200).send();
});

// Rota GET para retornar todos os logs
routes.get("/events", (req, res) => {
  const logsDirectory = path.join(__dirname, "logs");

  // Verificar se a pasta 'logs' existe
  if (!fs.existsSync(logsDirectory)) {
    return res.status(404).json({ message: "Logs directory not found" });
  }

  // Ler os arquivos de log na pasta 'logs'
  fs.readdir(logsDirectory, (err, files) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Erro ao ler os arquivos de log", error: err });
    }

    // Filtrar apenas os arquivos .txt
    const logFiles = files.filter((file) => file.endsWith(".txt"));

    if (logFiles.length === 0) {
      return res
        .status(404)
        .json({ message: "Nenhum arquivo de log encontrado" });
    }

    // Ler o conteúdo de todos os arquivos .txt e juntar os logs
    const logs = [];
    logFiles.forEach((file, index) => {
      const filePath = path.join(logsDirectory, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const logEntries = fileContent
        .trim()
        .split("\n\n")
        .map((entry) => JSON.parse(entry));

      logs.push(...logEntries); // Adiciona as entradas de log no array
    });

    // Retorna os logs no formato JSON
    return res.status(200).json(logs);
  });
});

app.use(routes);

app.listen(3000, () => {
  console.log("Server Up");
});
