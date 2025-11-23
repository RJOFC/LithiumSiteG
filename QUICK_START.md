# ⚡ Quick Start - Lithium Downloads

## 🎯 Comece Agora em 5 Minutos

### 1️⃣ Backend Rodando
```bash
cd backend
npm start
```
✅ Backend rodará em `http://localhost:3000`

### 2️⃣ Abra no Navegador
```
http://localhost:3000
```
Você verá:
- Logo "Lithium" no topo
- Botão "🔓 Login" no canto superior direito
- 3 cards com estatísticas (zerados)
- Mensagem "Nenhum download disponível"

### 3️⃣ Teste o Login
1. Clique em **"🔓 Login"**
2. Autorize no Discord
3. Volte para a página com sua **foto + nome**

### 4️⃣ Admin Panel
Acesse: `http://localhost:3000/admin-panel.html`
- Adicione um novo download
- Clique "📤 Sync" para sincronizar com GitHub
- Volte para home e veja aparecer

### 5️⃣ Pronto! 🎉

---

## 📋 Testes Rápidos

Rodar testes automáticos:
```bash
./test-login.sh
```

Todos os 10 testes devem passar com ✅

---

## 🚀 Deploy em Produção

Quando estiver pronto para colocar online:

```bash
./vercel-deploy.sh
```

Ou siga o passo-a-passo em [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md)

---

## 🔑 Primeiro Setup?

Se estiver criando tudo do zero:

### Discord OAuth
1. Vá para https://discord.com/developers/applications
2. Clique em "New Application"
3. Na aba OAuth2 → General:
   - Copie **CLIENT ID** para `.env` (DISCORD_CLIENT_ID)
   - Copie **CLIENT SECRET** para `.env` (DISCORD_CLIENT_SECRET)
4. Em OAuth2 → Redirects, adicione:
   - `http://localhost:3000/auth/discord/callback`

### GitHub Token (Opcional)
1. Vá para https://github.com/settings/tokens
2. Clique em "Generate new token"
3. Selecione permissão `repo` (full control)
4. Copie o token para `.env` (GITHUB_TOKEN)
5. Preencha GITHUB_OWNER e GITHUB_REPO

### Arquivo `.env`
Crie `backend/.env`:
```bash
DISCORD_CLIENT_ID=seu_id_aqui
DISCORD_CLIENT_SECRET=seu_secret_aqui
DISCORD_CALLBACK_URL=http://localhost:3000/auth/discord/callback
GITHUB_TOKEN=seu_token_aqui
GITHUB_OWNER=seu_usuario
GITHUB_REPO=seu_repositorio
SESSION_SECRET=chave_aleatoria_aqui
PORT=3000
```

---

## 📚 Documentação Completa

| Documento | Conteúdo |
|-----------|----------|
| [README.md](./README.md) | Setup e instruções gerais |
| [LOGIN_FLOW.md](./LOGIN_FLOW.md) | Fluxo de autenticação Discord |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Visão geral técnica do projeto |
| [CHECKLIST.md](./CHECKLIST.md) | Verificação pré-deploy |
| [VERCEL_DEPLOY.md](./VERCEL_DEPLOY.md) | Deploy passo-a-passo |
| [DEPLOY.md](./DEPLOY.md) | Deploy em 5 plataformas |

---

## ❓ Problemas Comuns

### ❌ "Backend não inicia"
```bash
# Verifique se tem todas as dependências
cd backend
npm install

# Se ainda não funcionar, verifique .env
cat backend/.env | grep DISCORD
```

### ❌ "Login não funciona"
1. Abra DevTools (F12) e procure por erros no console
2. Verifique que DISCORD_CLIENT_ID está preenchido em `.env`
3. Verifique que Redirect URI está correto no Discord Developer Portal

### ❌ "Admin panel retorna 401"
1. Faça logout (botão "Sair")
2. Faça login novamente
3. Se ainda não funcionar, limpe cookies (F12 → Application → Cookies)

---

## 🎓 Entender o Projeto

### Arquitetura Simples
```
Navegador (HTML/JS/CSS)
        ↓
Express Backend (Node.js)
        ↓
SQLite Database
        ↓
GitHub (sincronização)
```

### Como Funciona
1. **Página pública** mostra downloads de todos
2. **Usuário faz login** com Discord
3. **Admin panel** permite gerenciar downloads
4. **Estatísticas** atualizam em tempo real
5. **GitHub sync** exporta dados para repositório

---

## 🚀 Comandos Úteis

```bash
# Iniciar backend
cd backend && npm start

# Rodar testes
./test-login.sh

# Deploy Vercel
./vercel-deploy.sh

# Ver logs do backend
tail -f backend/server.out

# Parar backend (se rodar em background)
pkill -f "node server.js"

# Ver status das portas
netstat -tuln | grep 3000

# Limpar banco de dados (CUIDADO!)
rm backend/downloads.sqlite
```

---

## 📞 Precisa de Ajuda?

1. **Leia o README.md** para setup básico
2. **Leia LOGIN_FLOW.md** para entender autenticação
3. **Rode ./test-login.sh** para validar endpoints
4. **Abra DevTools (F12)** para ver erros no console
5. **Verifique backend.out** para logs do servidor

---

## ✅ Seu Site em 30 Segundos

```bash
# 1. Instalar (primeiro setup apenas)
cd backend && npm install && cd ..

# 2. Rodar
cd backend && npm start

# 3. Abrir navegador
# http://localhost:3000

# 4. Clicar em "Login"

# 5. Pronto! 🎉
```

---

**Status**: ✅ Pronto para usar  
**Próximo passo**: Clique em "🔓 Login" para testar!
