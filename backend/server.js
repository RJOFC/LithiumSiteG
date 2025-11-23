require('dotenv').config();
const express = require("express");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const session = require("express-session");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

// SQLite Database Setup
const dbFile = path.join(__dirname, "downloads.sqlite");
const db = new sqlite3.Database(dbFile);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TEXT NOT NULL
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS users (
    discord_id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    avatar TEXT,
    created_at TEXT NOT NULL
  )`);
});

// Discord OAuth2 Setup
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

if (process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
  passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_CALLBACK_URL || "http://localhost:3000/auth/discord/callback",
    scope: ["identify"]
  }, (accessToken, refreshToken, profile, cb) => {
    // Salva usuário no banco
    db.run(
      "INSERT OR IGNORE INTO users (discord_id, username, avatar, created_at) VALUES (?, ?, ?, ?)",
      [profile.id, profile.username, profile.avatar, new Date().toISOString()]
    );
    return cb(null, profile);
  }));
} else {
  console.warn('⚠️  Discord OAuth not configured. Set DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET to enable login.');
}

// Middlewares
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: "not_authenticated" });
}

const app = express();

app.use(cors({
  credentials: true,
  origin: true
}));

app.use(session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: false,  // Permitir acesso via JS (segurança reduzida, mas necessário para debug)
    sameSite: 'lax',  // Permitir cross-site cookies
    secure: false     // HTTP permitido em localhost
  }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Servir arquivos públicos
app.use(express.static(path.join(__dirname, '../public')));

// ==================== AUTH ====================
const DISCORD_ENABLED = !!(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET);

if (DISCORD_ENABLED) {
  app.get("/auth/discord", passport.authenticate("discord"));

  app.get("/auth/discord/callback",
    passport.authenticate("discord", { failureRedirect: "/auth-callback.html?error=authentication_failed" }),
    (req, res) => {
      // Usuário autenticado com sucesso
      console.log('✅ Discord callback recebido. User:', req.user?.username);
      console.log('📌 req.isAuthenticated():', req.isAuthenticated());
      console.log('📌 req.sessionID:', req.sessionID);
      const code = req.query.code || "authenticated";
      res.redirect(`/auth-callback.html?code=${encodeURIComponent(code)}`);
    }
  );
} else {
  app.get('/auth/discord', (req, res) => {
    res.status(501).send('Discord OAuth não está configurado. Verifique suas variáveis de ambiente.');
  });

  app.get('/auth/discord/callback', (req, res) => {
    res.status(501).send('Discord OAuth não está configurado.');
  });
}

app.get("/api/logged-user", (req, res) => {
  console.log('🔍 /api/logged-user chamado. isAuth:', req.isAuthenticated(), 'user:', req.user?.username);
  res.json({ user: req.user || null });
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "logout_error" });
    res.redirect("/");
  });
});

// ==================== DOWNLOADS API ====================
app.get("/api/downloads", (req, res) => {
  db.all("SELECT * FROM downloads ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.json([]);
    }
    const items = rows.map(row => JSON.parse(row.data));
    res.json(items);
  });
});

app.post("/api/downloads", ensureAuthenticated, (req, res) => {
  const { item } = req.body;
  if (!item || !item.title) {
    return res.status(400).json({ error: "invalid_item" });
  }

  db.run(
    "INSERT INTO downloads (user_id, data, created_at) VALUES (?, ?, ?)",
    [req.user.id, JSON.stringify(item), new Date().toISOString()],
    function (err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "db_error" });
      }
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.post("/api/downloads/remove", ensureAuthenticated, (req, res) => {
  const { id } = req.body;
  db.run("DELETE FROM downloads WHERE id = ? AND user_id = ?", [id, req.user.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "db_error" });
    }
    res.json({ success: true });
  });
});

app.post("/api/downloads/clear", ensureAuthenticated, (req, res) => {
  db.run("DELETE FROM downloads WHERE user_id = ?", [req.user.id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "db_error" });
    }
    res.json({ success: true });
  });
});

// ==================== GITHUB API ====================
app.post("/api/push-github", ensureAuthenticated, async (req, res) => {
  db.all("SELECT * FROM downloads WHERE user_id = ? ORDER BY id DESC", [req.user.id], async (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "db_error" });
    }

    const items = rows.map(row => JSON.parse(row.data));

    try {
      let sha = null;

      // Tentar obter SHA do arquivo existente
      try {
        const ghRes = await axios.get(
          `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${process.env.GITHUB_FILE_PATH || "downloads.json"}`,
          { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
        );
        sha = ghRes.data.sha;
      } catch (e) {
        // Arquivo não existe ainda, tudo bem
        console.log("Arquivo não existe no GitHub, será criado");
      }

      // Fazer upload para GitHub
      const response = await axios.put(
        `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${process.env.GITHUB_FILE_PATH || "downloads.json"}`,
        {
          message: `Sync downloads.json - ${new Date().toLocaleString()}`,
          content: Buffer.from(JSON.stringify(items, null, 2)).toString("base64"),
          ...(sha ? { sha } : {})
        },
        { headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } }
      );

      res.json({ success: true, github_response: response.data });
    } catch (error) {
      console.error("GitHub Error:", error.response?.data || error.message);
      res.status(500).json({
        error: "github_error",
        details: error.response?.data?.message || error.message
      });
    }
  });
});

// ==================== ROOT ====================
app.get("/", (req, res) => res.redirect("/index.html"));

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Lithium rodando em http://localhost:${PORT}`);
  console.log(`📁 Banco de dados: ${dbFile}`);
});