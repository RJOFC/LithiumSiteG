import axios from 'axios';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_FILE_PATH = process.env.GITHUB_FILE_PATH || 'downloads.json';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Validar autenticação
  const cookie = req.headers.cookie;
  if (!cookie || !cookie.includes('lithium_user=')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { downloads } = req.body;

    if (!Array.isArray(downloads)) {
      return res.status(400).json({ error: 'Invalid downloads array' });
    }

    // Obter SHA do arquivo existente
    let sha = null;
    try {
      const ghRes = await axios.get(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
        { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
      );
      sha = ghRes.data.sha;
    } catch (e) {
      // Arquivo não existe, tudo bem
    }

    // Upload para GitHub
    const response = await axios.put(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_FILE_PATH}`,
      {
        message: `Sync downloads.json - ${new Date().toLocaleString('pt-BR')}`,
        content: Buffer.from(JSON.stringify(downloads, null, 2)).toString('base64'),
        ...(sha ? { sha } : {}),
      },
      { headers: { Authorization: `token ${GITHUB_TOKEN}` } }
    );

    return res.json({ success: true, github: response.data });
  } catch (error) {
    console.error('GitHub error:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'github_error',
      details: error.response?.data?.message || error.message,
    });
  }
}