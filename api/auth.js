import fetch from 'node-fetch';

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const CALLBACK_URL = process.env.DISCORD_CALLBACK_URL;

export default async function handler(req, res) {
  const { path } = req.query;
  const action = Array.isArray(path) ? path[0] : path;

  // REDIRECT PARA LOGIN DISCORD
  if (action === 'discord') {
    const scope = 'identify';
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(CALLBACK_URL)}&response_type=code&scope=${scope}`;
    return res.redirect(authUrl);
  }

  // CALLBACK DO DISCORD
  if (action === 'callback' && req.method === 'GET') {
    const code = req.query.code;

    if (!code) {
      return res.redirect('/admin-panel.html?error=no_code');
    }

    try {
      // Trocar código por token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: CALLBACK_URL,
          scope: 'identify',
        }),
      });

      if (!tokenResponse.ok) {
        return res.redirect('/admin-panel.html?error=token_failed');
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Obter dados do usuário
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!userResponse.ok) {
        return res.redirect('/admin-panel.html?error=user_failed');
      }

      const userData = await userResponse.json();

      // Salvar no cookie (sem sessão, usando JWT simples)
      const userJson = Buffer.from(JSON.stringify(userData)).toString('base64');
      res.setHeader('Set-Cookie', `lithium_user=${userJson}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`);

      return res.redirect('/admin-panel.html?logged=true');
    } catch (error) {
      console.error('Auth error:', error);
      return res.redirect('/admin-panel.html?error=auth_failed');
    }
  }

  // LOGOUT
  if (action === 'logout') {
    res.setHeader('Set-Cookie', 'lithium_user=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
    return res.redirect('/');
  }

  // GET USER
  if (action === 'me' && req.method === 'GET') {
    const cookie = req.headers.cookie;
    if (!cookie) {
      return res.json({ user: null });
    }

    const userCookie = cookie
      .split('; ')
      .find(c => c.startsWith('lithium_user='));

    if (!userCookie) {
      return res.json({ user: null });
    }

    try {
      const userJson = userCookie.split('=')[1];
      const userData = JSON.parse(Buffer.from(userJson, 'base64').toString());
      return res.json({ user: userData });
    } catch {
      return res.json({ user: null });
    }
  }

  res.status(404).json({ error: 'Not found' });
}