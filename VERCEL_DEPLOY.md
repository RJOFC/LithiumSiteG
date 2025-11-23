# 🚀 Deploy Vercel - Guia Interativo para Lithium

## ✅ Checklist Pré-Deploy

Antes de começar, você precisa ter:

- [ ] Token do Discord (Client ID + Secret)
- [ ] Token do GitHub (PAT - Personal Access Token)
- [ ] Nome do seu repositório GitHub
- [ ] Conta no Vercel
- [ ] Git instalado e commits sincronizados

---

## 📋 Passo 1: Preparar Repositório GitHub

```bash
# Você está em /workspaces/LithiumSite-
cd /workspaces/LithiumSite-

# Verificar commits pendentes
git log --oneline | head -3

# Enviar para GitHub
git push origin main
# Se der erro de autenticação, configure:
# git config --global user.email "seu-email@github.com"
# git config --global user.name "Seu Nome"
```

**Resultado esperado:** Ver mensagem "Your branch is up to date with 'origin/main'"

---

## 🔐 Passo 2: Preparar Credenciais

Você vai precisar de 7 valores. Cole-os neste formato quando solicitado:

### Obter do Discord

1. Acesse: https://discord.com/developers/applications
2. Abra sua aplicação (ou crie uma nova)
3. Vá para "OAuth2" → "General"
4. Copie os valores:
   - **Client ID** → vou chamar de `DISCORD_CLIENT_ID`
   - **Client Secret** → vou chamar de `DISCORD_CLIENT_SECRET`

### Obter do GitHub

1. Acesse: https://github.com/settings/tokens
2. Clique "Generate new token" → "Generate new token (classic)"
3. Nome: `lithium-vercel`
4. Marque ✅ `repo` (completo)
5. Copie o token → vou chamar de `GITHUB_TOKEN`

### Gerar SESSION_SECRET

```bash
# Execute este comando e copie o resultado:
openssl rand -hex 32
# Resultado: algo como a3f8c2d1e5b9f4c7a1d9e2f8c5b1a9d3
```

---

## 🎛️ Passo 3: Fazer Login no Vercel

```bash
# Instale Vercel CLI (já foi feito)
npm install -g vercel

# Faça login no Vercel
vercel login

# Se não tiver conta, crie em https://vercel.com/signup
# Use GitHub para login rápido
```

**Resultado esperado:** Mensagem "Logged in to Vercel"

---

## 🚀 Passo 4: Deploy Inicial

```bash
# Na pasta raiz do projeto
cd /workspaces/LithiumSite-

# Faça o primeiro deploy (ele vai perguntar algumas coisas)
vercel

# Responda às perguntas:
# "Set up and deploy ~/workspaces/LithiumSite-? [Y/n]" → Y
# "Which scope do you want to deploy to?" → Seu usuário
# "Link to existing project? [y/N]" → N (primeira vez)
# "What's your project's name?" → lithium (ou seu nome preferido)
# "In which directory is your code located?" → .
# "Want to modify these settings? [y/N]" → N
```

**Resultado esperado:**
```
✅ Deployed to https://seu-projeto.vercel.app
```

Copie essa URL — você vai usar para configurar Discord callback.

---

## 🔑 Passo 5: Adicionar Variáveis de Ambiente

Agora você vai adicionar seus segredos. Use este comando para cada um:

```bash
vercel env add NOME_VARIAVEL production
# Digite o valor quando solicitado
```

**Execute estes comandos em ordem:**

```bash
# 1. Discord
vercel env add DISCORD_CLIENT_ID production
# Cole aqui: seu_client_id_do_discord

vercel env add DISCORD_CLIENT_SECRET production
# Cole aqui: seu_client_secret_do_discord

# 2. GitHub
vercel env add GITHUB_TOKEN production
# Cole aqui: seu_github_token_pat

vercel env add GITHUB_OWNER production
# Cole aqui: RJOFC (seu usuário GitHub)

vercel env add GITHUB_REPO production
# Cole aqui: LithiumSite (seu nome do repositório)

# 3. Segurança
vercel env add SESSION_SECRET production
# Cole aqui: resultado do openssl rand -hex 32

# 4. Arquivo (mantém padrão)
vercel env add GITHUB_FILE_PATH production
# Cole aqui: downloads.json
```

**Resultado esperado:** Para cada um, deve aparecer:
```
✅ Added Environment Variable NOME_VARIAVEL to production
```

---

## 🎯 Passo 6: Configurar Discord Callback URL

Agora você precisa atualizar sua aplicação Discord com a URL do Vercel.

1. Acesse: https://discord.com/developers/applications
2. Abra sua aplicação
3. Vá para "OAuth2" → "Redirects"
4. Clique "Add Another"
5. Cole: `https://seu-projeto.vercel.app/auth/discord/callback`
   - (Substitua `seu-projeto` pela sua URL do Vercel)
6. Clique "Save Changes"

**Exemplo real:**
```
https://lithium-app.vercel.app/auth/discord/callback
```

---

## ♻️ Passo 7: Fazer Deploy Final

Agora que as variáveis estão configuradas, faça um redeploy:

```bash
vercel --prod
```

**Resultado esperado:**
```
✅ Production: https://seu-projeto.vercel.app [in 2s]
```

---

## ✅ Passo 8: Testar Tudo

### Teste 1: Página pública carrega
```bash
curl https://seu-projeto.vercel.app/
# Deve retornar HTML da página
```

### Teste 2: API de downloads
```bash
curl https://seu-projeto.vercel.app/api/downloads
# Deve retornar: []
```

### Teste 3: Login Discord (browser)
1. Acesse: https://seu-projeto.vercel.app/
2. Clique em "🔓 Login"
3. Deve redirecionar para Discord
4. Após autenticar, volta com seu perfil visível

### Teste 4: Painel admin
1. Faça login (teste 3)
2. Acesse: https://seu-projeto.vercel.app/admin-panel.html
3. Deve mostrar formulário para adicionar downloads

---

## 🆘 Troubleshooting

### Erro: "DISCORD_CLIENT_ID is undefined"
**Solução:** Você não adicionou as variáveis de ambiente.
```bash
# Verifique
vercel env list production
# Deve listar todas as 7 variáveis
```

### Erro 502 Bad Gateway
**Solução:** Aguarde 1-2 minutos para o deployment completar. Depois acesse novamente.

### Discord login redireciona para erro
**Solução:** Verifique se a URL de callback no Discord matches exatamente com a URL do Vercel.
```
✅ Correto:   https://seu-projeto.vercel.app/auth/discord/callback
❌ Errado:    https://seu-projeto.vercel.app/api/auth/callback
```

### GitHub sync não funciona
**Solução:** 
1. Confirme que `GITHUB_TOKEN` foi adicionado
2. Token tem permissão `repo`?
3. `GITHUB_OWNER` e `GITHUB_REPO` existem e estão corretos?

---

## 📊 Ver Logs em Tempo Real

```bash
# Ver logs do Vercel
vercel logs https://seu-projeto.vercel.app

# Ou com tail (atualiza em tempo real)
vercel logs https://seu-projeto.vercel.app --follow
```

---

## 🔄 Atualizar Código

Toda vez que você faz push para GitHub, o Vercel redeploy automaticamente:

```bash
# Faça mudanças nos arquivos
git add .
git commit -m "Sua mensagem"
git push origin main

# Vercel vai automaticamente fazer deploy
# Verifique em: https://vercel.com/dashboard
```

---

## 📱 Acessar do Mobile

Seu site agora está acessível globalmente:

```
https://seu-projeto.vercel.app
```

Teste em seu celular abrindo esse link no navegador.

---

## ✨ Pronto!

Seu Lithium está rodando em produção! 🎉

**O que você tem agora:**
- ✅ Página pública com downloads
- ✅ Login com Discord
- ✅ Painel admin para gerenciar
- ✅ Sincronização com GitHub
- ✅ Banco de dados SQLite
- ✅ HTTPS automático
- ✅ CDN global do Vercel

---

## 🆘 Precisa de ajuda?

1. Verifique os logs: `vercel logs`
2. Revise este guia passo a passo
3. Abra uma issue no GitHub
4. Contate suporte Vercel: https://vercel.com/support

---

**Sucesso! Aproveite seu Lithium em produção! 🚀**
