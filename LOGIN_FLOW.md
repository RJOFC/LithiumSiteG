# 🔐 Sistema de Login Discord - Fluxo Completo

## 📋 Como Funciona o Login

### **Fluxo Visual**

```
Usuário em http://localhost:3000
    ↓
Clica em "🔓 Login"
    ↓
Redireciona para /auth/discord
    ↓
Backend faz redirect para Discord OAuth
    ↓
Usuário faz login no Discord
    ↓
Discord redireciona para /auth/discord/callback com código
    ↓
Backend valida código com Discord API
    ↓
Sessão criada (Passport.js)
    ↓
Redireciona para /auth-callback.html?code=...
    ↓
Página mostra "Autenticando com Discord..." (spinner)
    ↓
JavaScript verifica /api/logged-user a cada 1 segundo
    ↓
Após sucesso, mostra "✓ Login bem-sucedido!"
    ↓
Redireciona automaticamente para /
    ↓
Página mostra nome e foto do Discord no canto superior direito
```

---

## 🔧 Componentes do Sistema

### **1. Página Pública** (`public/index.html`)
```html
<button id="login-public" class="btn small primary">🔓 Login</button>
```
- Botão no canto superior direito
- Clique redireciona para `/auth/discord`

### **2. Backend Express** (`backend/server.js`)
```javascript
app.get("/auth/discord", passport.authenticate("discord"));

app.get("/auth/discord/callback",
  passport.authenticate("discord", { ... }),
  (req, res) => res.redirect(`/auth-callback.html?code=authenticated`)
);
```
- Inicializa OAuth2 com Discord
- Valida callback e cria sessão
- Redireciona para página de callback

### **3. Página de Callback** (`public/auth-callback.html`)
```html
<div id="loading">
  <div class="spinner"></div>
  <div class="message">Autenticando com Discord...</div>
</div>
```
- Mostra spinner enquanto processa
- JavaScript verifica `/api/logged-user` a cada segundo
- Redireciona automaticamente após sucesso

### **4. API de Verificação** (`backend/server.js`)
```javascript
app.get("/api/logged-user", (req, res) => {
  res.json({ user: req.user || null });
});
```
- Retorna dados do usuário autenticado
- Usada pela página de callback e frontend

### **5. Frontend App** (`public/js/app.js`)
```javascript
async function checkUserLogin() {
  const resp = await fetch('/api/logged-user', { credentials: 'include' });
  const data = await resp.json();
  return data.user || null;
}

function updateUserProfile(user) {
  // Mostra nome + foto do Discord
}
```
- Verifica login ao carregar página
- Exibe perfil do usuário se autenticado

---

## 🧪 Testando Localmente

### **Pré-requisito**
Você precisa ter Discord OAuth configurado. Verifique em `backend/.env`:
```bash
DISCORD_CLIENT_ID=seu_client_id
DISCORD_CLIENT_SECRET=seu_client_secret
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
```

### **Passo a Passo de Teste**

#### 1️⃣ Verificar que o backend está rodando
```bash
curl http://localhost:3000/
# Deve retornar HTML da página pública
```

#### 2️⃣ Abrir página pública
```bash
# No navegador, abra:
http://localhost:3000/
```

Você deve ver:
- Logo e nome "Lithium"
- Botão "🔓 Login" no canto superior direito
- 3 cards de estatísticas (zerados inicialmente)
- Mensagem "Nenhum download disponível"

#### 3️⃣ Clicar em "🔓 Login"
```
Esperado: Redirecionar para Discord login
```

#### 4️⃣ Fazer login no Discord
```
Esperado: Autorizar acesso ao Lithium
```

#### 5️⃣ Callback automático
```
Esperado: Ver página com spinner e "Autenticando com Discord..."
```

#### 6️⃣ Após autenticação
```
Esperado: Ver "✓ Login bem-sucedido!" e redirecionar para home
```

#### 7️⃣ Verificar que está autenticado
Na página inicial, você deve ver:
- Foto do Discord (avatar pequeno)
- Seu nome no Discord
- Botão "Sair" em vermelho

---

## ❌ Troubleshooting

### **Erro: "Discord OAuth não está configurado"**
**Solução:** Adicionar variáveis de ambiente:
```bash
export DISCORD_CLIENT_ID=seu_client_id
export DISCORD_CLIENT_SECRET=seu_client_secret
cd backend && npm start
```

### **Erro: "Você negou acesso à sua conta Discord"**
**O quê:** Você clicou em "Cancelar" no Discord
**Solução:** Clique em "🔓 Login" novamente e autorize

### **Página de callback fica carregando indefinidamente**
**Possível causa:** 
- Backend não salvou a sessão corretamente
- Cookie não está sendo enviado

**Solução:**
1. Abra DevTools (F12)
2. Vá para "Application" → "Cookies"
3. Verifique se tem cookie `connect.sid`
4. Se não houver, verifique os logs do backend:
```bash
tail -f backend/server.out
```

### **Página carrega mas não mostra perfil do usuário**
**Possível causa:** Fetch `/api/logged-user` retorna null

**Testar:**
```bash
curl http://localhost:3000/api/logged-user
# Deve retornar: {"user": {...dados do Discord...}}
```

---

## 🚀 Em Produção (Vercel)

### **Diferenças principais:**

1. **DISCORD_CALLBACK_URL** muda para seu domínio:
   ```
   https://seu-projeto.vercel.app/auth/discord/callback
   ```

2. **Atualizar no Discord Developer Portal:**
   - OAuth2 → Redirects
   - Remover: `http://localhost:3000/auth/discord/callback`
   - Adicionar: `https://seu-projeto.vercel.app/auth/discord/callback`

3. **Variáveis no Vercel:**
   ```bash
   vercel env add DISCORD_CALLBACK_URL production
   # Cole: https://seu-projeto.vercel.app/auth/discord/callback
   ```

---

## 📊 Dados Armazenados na Sessão

Quando o usuário faz login, o Passport.js armazena:
```javascript
{
  id: "123456789",           // Discord user ID
  username: "seu_usuario",   // Nome no Discord
  avatar: "hash_da_foto",    // Hash do avatar
  discriminator: "0",        // Tag (#0000)
  locale: "pt-BR",          // Idioma
  email: "seu_email@...",   // Email (se público)
  verified: true,           // Verificado
  flags: 0,                 // Flags da conta
  premium_type: 0           // Premium ou não
}
```

Acessível via:
```javascript
fetch('/api/logged-user', { credentials: 'include' })
```

---

## 🔒 Segurança

✅ **Implementado:**
- Sessions com Passport.js
- CORS habilitado
- Credenciais incluídas em requests (cookies)
- Secrets não expostos no frontend
- Validação de estado (CSRF protection implícita)

✅ **Recomendações:**
- Usar HTTPS em produção (Vercel oferece)
- Renovar `SESSION_SECRET` regularmente
- Limitar acesso a rotas autenticadas (POST, DELETE)
- Auditar permissões do token Discord

---

## 📚 Recursos

- [Passport.js Documentation](http://www.passportjs.org/)
- [Discord OAuth2 Guide](https://discord.com/developers/docs/topics/oauth2)
- [Express Sessions](https://expressjs.com/en/resources/middleware/session.html)
- [SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)

---

**Status:** ✅ Sistema de login totalmente funcional!

Dúvidas? Abra uma issue no repositório ou teste localmente.
