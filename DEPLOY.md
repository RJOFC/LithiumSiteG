# 🚀 Guia de Deploy - Lithium

Instruções passo a passo para fazer deploy da aplicação Lithium em diferentes plataformas.

## Pré-requisitos

- Node.js 18+ instalado localmente
- Conta no GitHub
- Conta em uma plataforma de deploy (Vercel, Railway, Render, Heroku, etc.)
- Token Discord OAuth2
- Token GitHub PAT (Personal Access Token)

## 1️⃣ Preparar Repositório GitHub

```bash
# Clonar o repositório
git clone https://github.com/RJOFC/LithiumSite.git
cd LithiumSite

# Criar branch de deploy (opcional)
git checkout -b deploy

# Verificar que todos os arquivos estão prontos
ls -la backend/ public/ api/
```

**⚠️ Importante:** Certifique-se de que `.env` NÃO está no repositório (check `.gitignore`):
```bash
cat .gitignore | grep .env
# Deve incluir: .env, .env.local, *.sqlite
```

## 2️⃣ Configurar Credenciais

### Obter Discord OAuth2

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application"
3. Vá para "OAuth2" → "General"
4. Copie **Client ID** e **Client Secret**
5. Em "OAuth2" → "Redirects", adicione:
   - Localmente: `http://localhost:3000/auth/discord/callback`
   - Produção: `https://seu-dominio.com/auth/discord/callback`

### Obter GitHub Token

1. Acesse [GitHub Settings - Tokens](https://github.com/settings/tokens)
2. Clique em "Generate new token" → "Generate new token (classic)"
3. Nomeie como `lithium-deploy`
4. Marque permissões:
   - ✅ `repo` (completo acesso ao repositório)
5. Copie o token (você não verá de novo!)

### Gerar SESSION_SECRET

```bash
openssl rand -hex 32
# Exemplo de output: 
# a3f8c2d1e5b9f4c7a1d9e2f8c5b1a9d3e7f1c4a8b2d5e9f3c6a0b4d7e1f5
```

## 3️⃣ Deploy em Vercel (Recomendado)

### Passo a Passo

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Fazer login na Vercel**
   ```bash
   vercel login
   # Siga as instruções para autenticar
   ```

3. **Fazer deploy inicial**
   ```bash
   vercel
   # Será perguntado sobre o projeto, aceite os defaults
   ```

4. **Adicionar variáveis de ambiente**
   ```bash
   # Via CLI (método seguro)
   vercel env add DISCORD_CLIENT_ID production
   # Cole o valor quando solicitado
   
   vercel env add DISCORD_CLIENT_SECRET production
   vercel env add GITHUB_TOKEN production
   vercel env add GITHUB_OWNER production
   vercel env add GITHUB_REPO production
   vercel env add SESSION_SECRET production
   
   # Opcional (já tem valor padrão):
   vercel env add GITHUB_FILE_PATH production
   # Digite: downloads.json
   ```

5. **Atualizar Discord Callback URL**
   - Vá para [Discord Developer Portal](https://discord.com/developers/applications)
   - No seu app, adicione novo redirect:
     - `https://seu-projeto.vercel.app/auth/discord/callback`

6. **Fazer deploy final**
   ```bash
   vercel --prod
   ```

7. **Testar**
   - Acesse `https://seu-projeto.vercel.app/`
   - Clique em "Login" → deve redirecionar para Discord
   - Após autenticar, deve mostrar seu perfil

## 4️⃣ Deploy em Railway

1. **Criar conta em [railway.app](https://railway.app)**

2. **Conectar GitHub**
   - Clique em "New"
   - Selecione "GitHub Repo"
   - Autorize o Railway no seu GitHub
   - Selecione repositório `LithiumSite`

3. **Configurar Build Command**
   - Vá para "Settings"
   - Em "Build Command": `cd backend && npm install`
   - Em "Start Command": `cd backend && npm start`

4. **Adicionar variáveis de ambiente**
   - Vá para "Variables"
   - Clique em "New Variable"
   - Adicione cada uma (não use aspas):
     ```
     DISCORD_CLIENT_ID=xxxxx
     DISCORD_CLIENT_SECRET=xxxxx
     GITHUB_TOKEN=xxxxx
     GITHUB_OWNER=RJOFC
     GITHUB_REPO=LithiumSite
     SESSION_SECRET=xxxxx
     GITHUB_FILE_PATH=downloads.json
     ```

5. **Copiar URL do domínio**
   - Railroad vai gerar um domínio automático
   - Use esse domínio para atualizar Discord Callback URL

6. **Atualizar Discord Callback**
   - [Discord Developer Portal](https://discord.com/developers/applications)
   - Novo redirect: `https://seu-dominio-railway.app/auth/discord/callback`

7. **Redeploy**
   - Empurre um commit para GitHub
   - Railway fará deploy automático

## 5️⃣ Deploy em Render

1. **Criar conta em [render.com](https://render.com)**

2. **Criar novo Web Service**
   - Clique em "New"
   - Selecione "Web Service"
   - Conecte seu repositório GitHub
   - Selecione `LithiumSite`

3. **Configurar**
   - **Name:** `lithium`
   - **Region:** sua região mais próxima
   - **Branch:** `main`
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && npm start`
   - **Plan:** Free (ou pago se preferir)

4. **Adicionar Environment Variables**
   - Vá para "Environment"
   - Clique em "Add Environment Variable"
   - Adicione (use os valores reais):
     ```
     DISCORD_CLIENT_ID=xxxxx
     DISCORD_CLIENT_SECRET=xxxxx
     GITHUB_TOKEN=xxxxx
     GITHUB_OWNER=RJOFC
     GITHUB_REPO=LithiumSite
     SESSION_SECRET=xxxxx
     GITHUB_FILE_PATH=downloads.json
     ```

5. **Deploy**
   - Clique em "Create Web Service"
   - Render começará o build automaticamente

6. **Atualizar Discord Callback**
   - Copie a URL gerada pelo Render (ex: `lithium.onrender.com`)
   - [Discord Developer Portal](https://discord.com/developers/applications)
   - Novo redirect: `https://lithium.onrender.com/auth/discord/callback`

## 6️⃣ Deploy em Heroku

⚠️ **Heroku descontinuou plano free em 2022.** Use Vercel, Railway ou Render.

## ✅ Testes Após Deploy

1. **Teste página pública**
   ```bash
   curl https://seu-dominio.com/
   # Deve retornar HTML
   ```

2. **Teste login**
   - Abra https://seu-dominio.com/
   - Clique em "🔓 Login"
   - Deve redirecionar para Discord

3. **Teste painel admin**
   - Faça login com Discord
   - Acesse https://seu-dominio.com/admin-panel.html
   - Deve mostrar formulário de upload

4. **Teste API**
   ```bash
   curl https://seu-dominio.com/api/downloads
   # Deve retornar: []
   
   curl https://seu-dominio.com/api/logged-user
   # Deve retornar: {"user":null}
   ```

## 🔄 Atualizações e Rollback

### Atualizar código

```bash
# Fazer mudanças
git add .
git commit -m "Update: descrição"
git push origin main

# Vercel/Railway/Render deployam automaticamente
```

### Rollback (voltar versão anterior)

```bash
# Ver histórico
git log --oneline

# Reverter para commit anterior
git revert <commit-hash>
git push origin main

# Plataforma fará redeploy automático
```

## 🆘 Troubleshooting

### Erro 502 Bad Gateway
- Verifique se todas as variáveis de ambiente estão configuradas
- Confirme que o backend está rodando: `npm start`

### Discord login não funciona
- Confirme que `DISCORD_CALLBACK_URL` matches exatamente a URL registrada no Discord
- Verifique `DISCORD_CLIENT_ID` e `DISCORD_CLIENT_SECRET`

### GitHub sync não funciona
- Confirme que `GITHUB_TOKEN` tem permissão `repo`
- Verificar se `GITHUB_OWNER` e `GITHUB_REPO` existem
- Token pode ter expirado, gere um novo

### Banco de dados não persiste
- Em Vercel/Railway/Render, use banco de dados gerenciado (ex: Neon, CockroachDB)
- SQLite local não persiste entre deployments
- Alternativa: use banco de dados em nuvem

## 📚 Documentação Extra

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)
- [Discord OAuth2](https://discord.com/developers/docs/topics/oauth2)
- [GitHub API](https://docs.github.com/en/rest)

---

**Dúvidas?** Abra uma issue no repositório!
