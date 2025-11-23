# 📥 Lithium Downloads

Sistema moderno e responsivo para gerenciar downloads com backend Node.js, autenticação Discord OAuth2, banco de dados SQLite e sincronização automática com GitHub.

## 📁 Estrutura

```
LithiumDownloads/
├── public/
│   ├── index.html              # Página pública
│   ├── admin-panel.html        # Painel de administração
│   ├── Favicon.png
│   ├── css/
│   │   └── styles.css
│   └── js/
│       └── app.js
├── backend/
│   ├── server.js               # Backend Express
│   ├── package.json
│   ├── .env.example
│   └── downloads.sqlite        # Banco de dados
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Como Usar

### Opção 1: Rodar Localmente
#### 1.1 Instalar dependências

```bash
cd backend
npm install
cd ..
```

#### 1.2 Configurar variáveis de ambiente

Crie um arquivo `backend/.env` com seus valores (baseado em `backend/.env.example`):

```bash
cp backend/.env.example backend/.env
```

Edite `backend/.env` com:
- `DISCORD_CLIENT_ID` e `DISCORD_CLIENT_SECRET` (do [Discord Developer Portal](https://discord.com/developers/applications))
- `DISCORD_CALLBACK_URL` = `http://localhost:3000/auth/discord/callback`
- `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO` (do [GitHub Settings - Tokens](https://github.com/settings/tokens))
- `SESSION_SECRET` = `$(openssl rand -hex 32)` (gere uma string aleatória forte)


#### 1.3 Iniciar o servidor

```bash
cd backend
npm start
```

Backend rodará em `http://localhost:3000`

#### 1.4 Testar o login Discord

1. Abra [http://localhost:3000](http://localhost:3000) no navegador
2. Clique no botão **"🔓 Login"** (canto superior direito)
3. Você será redirecionado para Discord
4. Faça login e autorize o acesso
5. Você verá uma página "Autenticando com Discord..." com um spinner
6. Após sucesso, será redirecionado para home com seu **nome e foto do Discord** exibidos

**Pronto!** Você está autenticado. Agora pode:
- Ver as **estatísticas** na página inicial (total de downloads, links, arquivos)
- Acessar `/admin-panel.html` para adicionar/gerenciar downloads
- Clicar em "📋 Link" para copiar o link compartilhável
- Clicar em "📤 Sync" para sincronizar com GitHub

**Ver Fluxo Completo:** Leia [LOGIN_FLOW.md](./LOGIN_FLOW.md) para entender todo o processo
cd backend
npm start
```

Acesse:
- **Página Pública**: http://localhost:3000
- **Painel Admin**: http://localhost:3000/admin-panel.html

### Opção 2: Deploy na Nuvem

#### Vercel (Recomendado)

1. **Push seu repositório para GitHub**
   ```bash
   git push origin main
   ```

2. **Conectar com Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

3. **Adicionar variáveis de ambiente via CLI ou painel**
   ```bash
   vercel env add DISCORD_CLIENT_ID production
   vercel env add DISCORD_CLIENT_SECRET production
   vercel env add DISCORD_CALLBACK_URL production
   vercel env add GITHUB_TOKEN production
   vercel env add GITHUB_OWNER production
   vercel env add GITHUB_REPO production
   vercel env add SESSION_SECRET production
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

#### Railway, Render ou Heroku

1. Crie uma conta na plataforma (ex: railway.app, render.com, heroku.com)
2. Conecte seu repositório GitHub
3. Configure as variáveis de ambiente no painel da plataforma
4. Defina o comando de início: `cd backend && npm start`
5. Deploy!

## 🔐 Segurança - Variáveis de Ambiente

**Importante: Nunca commite seus `.env` com valores reais!**

- Arquivo `.env` está em `.gitignore` — é seguro local
- Para produção, use o painel da sua plataforma (Vercel, Railway, etc.)
- Gere um `SESSION_SECRET` forte:
  ```bash
  openssl rand -hex 32
  ```

Exemplo de configuração segura:

```bash
# Localmente (máquina pessoal):
export $(cat backend/.env | xargs)
npm start

# Em produção (Vercel/Railway):
# - Use o painel para adicionar variáveis
# - Não faça push de valores reais
```

## ✨ Funcionalidades

- ✅ Login via Discord OAuth2
- ✅ Upload de arquivos e links
- ✅ Imagens customizadas
- ✅ Banco de dados SQLite
- ✅ Sincronização com GitHub
- ✅ Download em JSON
- ✅ Responsivo (mobile/desktop)
- ✅ Interface moderna

## 🔐 Segurança

- As rotas de upload/delete requerem autenticação Discord
- Cada usuário só pode ver/editar seus próprios downloads
- Token GitHub não é exposto no frontend
- `.env` não é versionado

## 🌍 Deploy na Nuvem

Veja a seção "Opção 2: Deploy na Nuvem" acima para instruções completas.

## 📝 Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `SESSION_SECRET` | Chave secreta para sessões |
| `DISCORD_CLIENT_ID` | ID da aplicação Discord |
| `DISCORD_CLIENT_SECRET` | Secret da aplicação Discord |
| `DISCORD_CALLBACK_URL` | URL de callback (prod: seu domínio) |
| `GITHUB_TOKEN` | Token de acesso GitHub |
| `GITHUB_OWNER` | Seu usuário GitHub |
| `GITHUB_REPO` | Seu repositório |
| `GITHUB_FILE_PATH` | Caminho do arquivo (default: `downloads.json`) |
| `PORT` | Porta (default: 3000) |

## 🛠️ Personalização

### Cores
Edite `public/css/styles.css`:

```css
:root {
  --accent: #ff914d;      /* Cor principal */
  --bg: #101010;          /* Fundo */
  --text-main: #f7f7f7;   /* Texto */
}
```

### Logo
Substitua `public/Favicon.png`

### Nome
Edite `<span class="site-name">Lithium</span>` nos HTMLs

## 📞 Suporte

Dúvidas? Abra uma issue no repositório!

## 📄 Licença

MIT © 2024

---

**Desenvolvido com 💜 por RJOFC**