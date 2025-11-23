export default async function handler(req, res) {
  // Simulado com JSON (em produção, use banco de dados real)
  // Para Vercel, você pode usar PostgreSQL, MongoDB, ou apenas localStorage no frontend

  if (req.method === 'GET') {
    // Retorna array vazio ou dados salvos
    return res.json([]);
  }

  if (req.method === 'POST') {
    // Valida autenticação
    const cookie = req.headers.cookie;
    if (!cookie || !cookie.includes('lithium_user=')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { item } = req.body;
    if (!item || !item.title) {
      return res.status(400).json({ error: 'Invalid item' });
    }

    // Aqui você salvaria no banco de dados
    return res.json({ success: true, item });
  }

  res.status(405).json({ error: 'Method not allowed' });
}