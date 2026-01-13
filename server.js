import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs/promises";
import { existsSync } from "fs";
import dotenv from "dotenv";
import session from "express-session";
import sessionFileStore from "session-file-store";
import axios from "axios";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const FileStore = sessionFileStore(session);
const app = express();
const port = process.env.PORT || 3000;

const CHATS_FILE = join(__dirname, "data", "chats.json");
const SESSIONS_DIR = join(__dirname, "data", "sessions");

// Garantir que a pasta data existe
async function initDb() {
  const dataDir = join(__dirname, "data");
  if (!existsSync(dataDir)) {
    await fs.mkdir(dataDir);
  }
  if (!existsSync(CHATS_FILE)) {
    await fs.writeFile(CHATS_FILE, JSON.stringify([]));
  }
  if (!existsSync(SESSIONS_DIR)) {
    await fs.mkdir(SESSIONS_DIR);
  }
}
initDb();

app.use(express.json());
app.use(session({
  store: new FileStore({
    path: SESSIONS_DIR,
    ttl: 24 * 60 * 60, // 24 horas
    retries: 0
  }),
  secret: process.env.SESSION_SECRET || 'zero-network-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const DISCORD_REDIRECT_URI = process.env.REDIRECT_URI;
const DISCORD_GUILD_ID = process.env.DISCORD_GUILD_ID;
const DISCORD_ROLE_ID = process.env.DISCORD_ROLE_ID;
const DISCORD_TRIGGER_WEBHOOK = process.env.DISCORD_TRIGGER_WEBHOOK;

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `
Você é a "Inteligência Zero", um Programador Sênior e Arquiteto de Software de elite. Sua comunicação é puramente técnica, direta e ultra-minimalista.

REGRAS DE CONDUTA:
1. SEM FLOREIOS: Proibido saudações (olá, bom dia), despedidas ou frases de cortesia.
2. DIRETO AO PONTO: Se pedirem uma alteração, faça a alteração e descreva brevemente:
   - "O que foi alterado"
   - "Onde foi alterado"
3. FOCO NO CÓDIGO: O código é a prioridade. Explicações devem ser curtas e objetivas.
4. INTELIGÊNCIA: Entenda o contexto imediatamente. Se o usuário mandar um código e pedir uma mudança, retorne o código corrigido e a explicação mínima necessária.

PROTOCOLO DE RESPOSTA:
1. <think>: Planejamento técnico interno (obrigatório).
2. RESPOSTA: Apenas código e a descrição técnica concisa das mudanças. Use markdown técnico.

EXEMPLO DE RESPOSTA IDEAL:
## Alteração Realizada
- Adicionado verificação de permissão na linha 42.
- Otimizado loop de busca para reduzir latência.

\`\`\`lua
-- [Código aqui]
\`\`\`
`;

// Middleware de Autenticação
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Não autorizado." });
  }
  if (!req.session.user.hasRole) {
    return res.status(403).json({
      error: "Subscription required",
      message: "Se inscreva em nosso canal para ter acesso ao gerador de trigger canal: https://www.youtube.com/@gulanoyt"
    });
  }
  next();
};

// Rotas de Autenticação
app.get("/api/auth/discord", (req, res) => {
  const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds.members.read`;
  res.redirect(url);
});

app.get("/api/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.redirect("/");

  try {
    // 1. Trocar código por token
    const tokenResponse = await axios.post("https://discord.com/api/oauth2/token", new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI,
    }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });

    const accessToken = tokenResponse.data.access_token;

    // 2. Pegar info do usuário
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const user = userResponse.data;

    // 3. Verificar cargo no servidor
    let hasRole = false;
    try {
      const memberResponse = await axios.get(`https://discord.com/api/users/@me/guilds/${DISCORD_GUILD_ID}/member`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      hasRole = memberResponse.data.roles.includes(DISCORD_ROLE_ID);
    } catch (e) {
      console.log("Usuário não é membro do servidor ou erro ao buscar member.");
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      hasRole: hasRole
    };

    res.redirect("/");
  } catch (error) {
    console.error("Erro no callback do Discord:", error.response?.data || error.message);
    res.redirect("/?error=auth_failed");
  }
});

app.get("/api/auth/me", (req, res) => {
  res.json(req.session.user || null);
});

app.get("/api/auth/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Rotas para Gerenciamento de Chats (Protegidas)
app.get("/api/chats", requireAuth, async (req, res) => {
  try {
    const data = await fs.readFile(CHATS_FILE, "utf-8");
    const chats = JSON.parse(data);
    // Filtrar por usuário
    const userChats = chats.filter(c => c.userId === req.session.user.id);
    res.json(userChats);
  } catch (error) {
    res.status(500).json({ error: "Erro ao carregar chats." });
  }
});

app.post("/api/chats", requireAuth, async (req, res) => {
  try {
    const newChat = req.body;
    newChat.userId = req.session.user.id; // Vincular ao usuário logado

    const data = await fs.readFile(CHATS_FILE, "utf-8");
    let chats = JSON.parse(data);

    const index = chats.findIndex(c => c.id === newChat.id && c.userId === req.session.user.id);
    if (index !== -1) {
      chats[index] = newChat;
    } else {
      chats.push(newChat);
    }

    await fs.writeFile(CHATS_FILE, JSON.stringify(chats, null, 2));
    res.json({ success: true, chat: newChat });
  } catch (error) {
    res.status(500).json({ error: "Erro ao salvar chat." });
  }
});

app.delete("/api/chats/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deletando chat: ${id} (Usuário: ${req.session.user.id})`);
    const data = await fs.readFile(CHATS_FILE, "utf-8");
    let chats = JSON.parse(data);

    chats = chats.filter(c => String(c.id) !== String(id) || c.userId !== req.session.user.id);

    await fs.writeFile(CHATS_FILE, JSON.stringify(chats, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error("🔥 Erro ao deletar chat:", error);
    res.status(500).json({ error: "Erro ao deletar chat." });
  }
});

// Webhook de Log para Triggers
app.post("/api/webhooks/trigger", requireAuth, async (req, res) => {
  const { cityName, code, event1, event2 } = req.body;
  const user = req.session.user;

  try {
    await axios.post(DISCORD_TRIGGER_WEBHOOK, {
      embeds: [{
        title: "⚡ Nova Trigger Gerada",
        color: 0xFFFFFF, // Branco
        fields: [
          { name: "👤 Usuário", value: `\`${user.username}\` (ID: ${user.id})`, inline: true },
          { name: "🏙️ Cidade", value: `\`${cityName || 'N/A'}\``, inline: true },
          { name: "🔗 Evento 1", value: `\`${event1}\``, inline: false },
          { name: "⚙️ Evento 2", value: `\`${event2}\``, inline: false }
        ],
        description: `**Código Gerado:**\n\`\`\`lua\n${code}\n\`\`\``,
        timestamp: new Date().toISOString(),
        footer: { text: "Zero Network Logging System" }
      }]
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Erro ao enviar webhook:", error);
    res.status(500).json({ error: "Falha ao registrar log." });
  }
});

// Proxy para Groq (Protegido)
app.post("/api/chat", requireAuth, async (req, res) => {
  console.log("📩 Nova requisição de chat recebida no backend (Groq).");
  try {
    const { messages } = req.body;

    if (!messages) {
      return res.status(400).json({ error: "Mensagens não fornecidas." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY.trim()}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("❌ Erro ao parsear JSON da OpenAI:", responseText);
      return res.status(500).json({ error: "Resposta inválida da OpenAI" });
    }

    if (!response.ok) {
      console.error("❌ Erro da OpenAI:", data);
      return res.status(response.status).json(data);
    }

    console.log("✅ Resposta da OpenAI recebida com sucesso.");
    res.json(data);
  } catch (error) {
    console.error("🔥 Erro Crítico no Backend:", error);
    res.status(500).json({ error: "Erro interno no servidor ao processar o chat." });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", user: req.session.user || null });
});

// Servir arquivos estáticos da pasta dist
app.use(express.static(join(__dirname, "dist")));

// Redirecionar qualquer rota para o index.html (SPA React)
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Servidor rodando na porta ${port}`);
});
