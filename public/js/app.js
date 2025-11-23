async function loadDownloads() {
  try {
    // Tenta carregar do backend primeiro
    const resp = await fetch('/api/downloads');
    if (resp.ok) {
      return await resp.json();
    }
  } catch (e) {
    console.warn('Erro ao carregar downloads do backend:', e);
  }
  // Fallback para localStorage
  try {
    return JSON.parse(localStorage.getItem('lithium_downloads')) || [];
  } catch {
    return [];
  }
}

async function checkUserLogin() {
  try {
    const resp = await fetch('/api/logged-user', { credentials: 'include' });
    if (resp.ok) {
      const data = await resp.json();
      return data.user || null;
    }
  } catch (e) {
    console.warn('Erro ao verificar login:', e);
  }
  return null;
}

function updateUserProfile(user) {
  const loginBtn = document.getElementById('login-public');
  const userProfile = document.getElementById('user-profile');
  const userAvatar = document.getElementById('user-avatar');
  const userName = document.getElementById('user-name');
  const logoutBtn = document.getElementById('logout-public');

  if (user) {
    loginBtn.style.display = 'none';
    userProfile.style.display = 'flex';
    userName.textContent = user.username || 'Usuário';
    
    // Construir URL do avatar (Discord CDN)
    if (user.avatar) {
      const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`;
      userAvatar.src = avatarUrl;
    }
    
    logoutBtn.onclick = () => {
      window.location.href = '/logout';
    };
  } else {
    loginBtn.style.display = 'inline-flex';
    userProfile.style.display = 'none';
  }
}

async function renderStats(downloads) {
  const statsContainer = document.getElementById('stats-container');
  
  if (!downloads || downloads.length === 0) {
    statsContainer.innerHTML = '';
    return;
  }

  // Contar total
  const totalDownloads = downloads.length;

  // Estatísticas
  const statsHTML = `
    <div class="stat-card">
      <div class="stat-value">${totalDownloads}</div>
      <div class="stat-label">📦 Downloads</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${downloads.filter(d => d.isExternal).length}</div>
      <div class="stat-label">🔗 Links</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${downloads.filter(d => !d.isExternal).length}</div>
      <div class="stat-label">📄 Arquivos</div>
    </div>
  `;
  
  statsContainer.innerHTML = statsHTML;
}

async function renderPublicList(container) {
  const downloads = await loadDownloads();
  
  // Renderizar estatísticas
  await renderStats(downloads);
  
  container.innerHTML = '';

  if (!downloads.length) {
    container.innerHTML = '<div class="card" style="font-size:12px;color:var(--text-muted);">Nenhum download disponível.</div>';
    return;
  }

  downloads.forEach((item) => {
    const el = document.createElement('article');
    el.className = 'download-item';

    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    if (item.imageDataUrl) {
      const img = document.createElement('img');
      img.src = item.imageDataUrl;
      img.alt = item.title;
      thumb.appendChild(img);
    } else {
      thumb.textContent = 'Sem imagem';
    }

    const info = document.createElement('div');
    info.className = 'download-info';

    const title = document.createElement('div');
    title.className = 'download-title';
    title.textContent = item.title || 'Sem título';

    const desc = document.createElement('div');
    desc.className = 'download-desc';
    desc.textContent = item.description || '';

    const actions = document.createElement('div');
    actions.className = 'download-actions';

    const a = document.createElement('a');
    a.className = 'btn primary';
    a.textContent = 'Baixar';

    if (item.jsonDataUrl) {
      a.href = item.jsonDataUrl;
      a.download = item.downloadName + '.json';
    } else if (item.isExternal) {
      a.href = item.externalLink;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.href = item.fileDataUrl;
      a.download = item.downloadName;
    }

    actions.appendChild(a);
    info.appendChild(title);
    info.appendChild(desc);
    info.appendChild(actions);

    el.appendChild(thumb);
    el.appendChild(info);
    container.appendChild(el);
  });
}

async function init() {
  const page = document.body.dataset.page;
  
  if (page === 'public') {
    // Verificar login ao iniciar
    const user = await checkUserLogin();
    updateUserProfile(user);

    // Botão de login
    const loginBtn = document.getElementById('login-public');
    loginBtn.onclick = () => {
      window.location.href = '/auth/discord';
    };

    // Carregar e renderizar downloads
    const list = document.getElementById('downloads-list');
    await renderPublicList(list);
    
    // Recarrega a cada 5 segundos
    setInterval(() => renderPublicList(list), 5000);
  }
}

document.addEventListener('DOMContentLoaded', init);
