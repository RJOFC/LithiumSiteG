# 📋 Checklist de Pré-Deploy

## ✅ Verificação Local

- [ ] **Backend rodando**
  - [ ] `cd backend && npm start` sem erros
  - [ ] Sem warnings de módulos faltantes
  - [ ] Servidor responde em `http://localhost:3000`

- [ ] **Páginas carregam**
  - [ ] `http://localhost:3000` mostra página pública
  - [ ] `/admin-panel.html` carrega
  - [ ] `/auth-callback.html` carrega

- [ ] **Testes passam**
  - [ ] Execute `./test-login.sh`
  - [ ] Todos os 10 testes devem passar com ✅

- [ ] **Funcionalidades testadas**
  - [ ] Página pública exibe "Lithium" e stats
  - [ ] Botão de login está visível
  - [ ] Selectors de CSS carregam (cores, fontes)
  - [ ] JavaScript console sem erros (F12)

---

## 🔐 Verificação de Segurança

- [ ] **Secrets não expostos**
  - [ ] Arquivo `.env` está em `.gitignore`
  - [ ] Arquivo `.env` não foi commitado (`git log -p --all -- backend/.env`)
  - [ ] Arquivo `.env.example` tem apenas placeholders

- [ ] **Verificar Git history**
  - [ ] `git log --all --oneline -- backend/.env` não mostra secrets
  - [ ] `git log --all --oneline -- .env` não mostra secrets
  - [ ] Se houver exposure, fazer `git filter-repo` para remover

- [ ] **Variáveis de ambiente válidas**
  - [ ] `backend/.env` tem todos os valores preenchidos
  - [ ] Testar credenciais Discord (verificar no Developer Portal)
  - [ ] Testar token GitHub (verificar em Settings - Tokens)

---

## 🌐 Configuração Discord

- [ ] **Discord Developer Portal**
  - [ ] Aplicação criada em https://discord.com/developers/applications
  - [ ] OAuth2 habilitado
  - [ ] Redirect URI **local**: `http://localhost:3000/auth/discord/callback`
  - [ ] CLIENT_ID copiado para `.env` (DISCORD_CLIENT_ID)
  - [ ] CLIENT_SECRET copiado para `.env` (DISCORD_CLIENT_SECRET)

- [ ] **Testar OAuth localmente**
  - [ ] Clicar em "🔓 Login"
  - [ ] Redireciona para Discord login
  - [ ] Faz login com sua conta
  - [ ] Retorna para página de callback (spinner visível)
  - [ ] Redireciona para home com sua foto/nome no header
  - [ ] Botão muda para "Sair" em vermelho

---

## 📚 Configuração GitHub (Opcional)

- [ ] **Se usar sincronização GitHub**
  - [ ] Repositório criado/existe no GitHub
  - [ ] Token gerado em https://github.com/settings/tokens
  - [ ] Permissões: `repo` (full control)
  - [ ] GITHUB_TOKEN preenchido em `.env`
  - [ ] GITHUB_OWNER e GITHUB_REPO preenchidos em `.env`

- [ ] **Testar sincronização (após login)**
  - [ ] Admin panel carrega
  - [ ] Adicionar um download (URL ou arquivo)
  - [ ] Clicar "📤 Sync"
  - [ ] Verificar se arquivo foi criado em GitHub

---

## 📦 Verificação de Deploy

- [ ] **Arquivos de configuração**
  - [ ] `vercel.json` existe e está correto
  - [ ] `backend/package.json` tem scripts: `start` e `dev`
  - [ ] `backend/.env` preenchido (para referência local)

- [ ] **Git está clean**
  - [ ] `git status` mostra "working tree clean"
  - [ ] Todos os arquivos foram commitados
  - [ ] Branch está atualizada com remoto (`git pull`)

- [ ] **Vercel CLI instalado**
  - [ ] `vercel --version` funciona
  - [ ] Está logado: `vercel login` (se necessário)

---

## 🚀 Deploy em Staging (Recomendado)

- [ ] **Primeiro fazer deploy de teste**
  - [ ] Execute: `vercel --scope seu_usuario` (sem `--prod`)
  - [ ] Teste a URL preview fornecida
  - [ ] Verifique se funciona igual ao local

- [ ] **Se staging funcionar, fazer deploy em produção**
  - [ ] Execute: `./vercel-deploy.sh` ou `vercel --prod`
  - [ ] Aguarde o build terminar
  - [ ] Copie o URL final

---

## 🔗 Configuração de Produção

- [ ] **Atualizar Discord Developer Portal**
  - [ ] Adicionar novo Redirect URI: `https://seu-projeto.vercel.app/auth/discord/callback`
  - [ ] NÃO remover `http://localhost:3000/auth/discord/callback` (ainda usar localmente)

- [ ] **Adicionar variáveis em Vercel**
  - [ ] Abrir projeto em Vercel Dashboard
  - [ ] Settings → Environment Variables
  - [ ] Adicionar 7 variáveis:
    - `DISCORD_CLIENT_ID`
    - `DISCORD_CLIENT_SECRET`
    - `DISCORD_CALLBACK_URL` = `https://seu-projeto.vercel.app/auth/discord/callback`
    - `GITHUB_TOKEN`
    - `GITHUB_OWNER`
    - `GITHUB_REPO`
    - `SESSION_SECRET` (novo valor seguro)

- [ ] **Verificar logs de deploy**
  - [ ] Deployments → Logs
  - [ ] Procurar por erros
  - [ ] Backend inicializou corretamente

---

## ✨ Teste Final em Produção

- [ ] **Página pública**
  - [ ] Abre em `https://seu-projeto.vercel.app`
  - [ ] Mostra logo e stats
  - [ ] Botão de login está presente

- [ ] **Login em produção**
  - [ ] Clicar em "🔓 Login"
  - [ ] Faz login com Discord
  - [ ] Retorna com foto/nome
  - [ ] Dados persistem ao recarregar página

- [ ] **Admin panel**
  - [ ] Acessível em `/admin-panel.html`
  - [ ] Pode adicionar downloads
  - [ ] Aparecem na página pública
  - [ ] Botão "📋 Link" copia URL compartilhável

---

## 🔄 Rollback (Se necessário)

- [ ] **Em caso de erro**
  - [ ] Vercel Dashboard → Deployments
  - [ ] Encontrar último deployment estável
  - [ ] Clicar em "Promote to Production"
  - [ ] OU fazer rollback automático (se configurado)

- [ ] **Verificar logs**
  - [ ] Deployment → Functions → Ver logs completos
  - [ ] Procurar por stack traces
  - [ ] Adicionar logs em `backend/server.js` se necessário

---

## 📝 Documentação Final

- [ ] **Atualizar README**
  - [ ] Adicionar URL de produção
  - [ ] Adicionar instruções de administração
  - [ ] Adicionar forma de reportar bugs

- [ ] **Compartilhar com usuários**
  - [ ] Fornecer link de acesso
  - [ ] Instruções de como fazer login
  - [ ] Instruções de como compartilhar downloads

---

## 🎉 Pronto para Produção?

Se todos os itens acima estão marcados com ✅, seu site está pronto!

**Próximos passos:**
1. Executar `./vercel-deploy.sh`
2. Ou fazer deploy manualmente: `vercel --prod`
3. Monitorar em https://vercel.com/dashboard
4. Compartilhar o link com usuários

**Dúvidas?**
- Leia `LOGIN_FLOW.md` para entender o fluxo de autenticação
- Leia `VERCEL_DEPLOY.md` para guia detalhado de deploy
- Leia `DEPLOY.md` para opções de deploy em outras plataformas
