// ==================== STATE ====================
let currentUser = null;
let downloads = [];

// ==================== API ====================
async function apiGetUser() {
  const resp = await fetch('/api/logged-user');
  if (!resp.ok) return null;
  const data = await resp.json();
  return data.user || null;
}

async function apiDiscordLogin() {
  window.location.href = '/auth/discord';
}

async function apiLogout() {
  window.location.href = '/logout';
}

async function apiGetDownloads() {
  const resp = await fetch('/api/downloads');
  if (!resp.ok) return [];
  return await resp.json();
}

async function apiAddDownload(item) {
  const resp = await fetch('/api/downloads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ item }),
  });
  if (!resp.ok) throw new Error('Erro ao salvar');
  return await resp.json();
}

async function apiPushGitHub(downloads) {
  const resp = await fetch('/api/push-github', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ downloads }),
  });
  if (!resp.ok) throw new Error('Erro ao sincronizar');
  return await resp.json();
}

// ==================== HELPERS ====================
function createId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function jsonToDataUrl(obj) {
  const json = JSON.stringify(obj);
  const base64 = btoa(unescape(encodeURIComponent(json)));
  return 'data:application/json;base64,' + base64;
}

function copyToClipboard(text, label = 'Copiado!') {
  navigator.clipboard.writeText(text).then(() => {
    // Mostrar mensagem de sucesso
    const msg = document.createElement('div');
    msg.textContent = label;
    msg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--accent); color: #1a1209; padding: 10px 16px; border-radius: 999px; font-size: 12px; z-index: 9999; font-weight: 500;';
    document.body.appendChild(msg);
    setTimeout(() => msg.remove(), 2000);
  });
}

async function fileToDataUrl(file) {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}

function loadDownloadsLocal() {
  try {
    const raw = localStorage.getItem('lithium_downloads');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveDownloadsLocal(items) {
  localStorage.setItem('lithium_downloads', JSON.stringify(items));
}

// ==================== RENDER ====================
async function renderAdminList(container) {
  downloads = await apiGetDownloads();
  container.innerHTML = '';

  if (!downloads.length) {
    container.innerHTML = '<div style="font-size:11px;color:var(--text-muted);">Nenhum item cadastrado.</div>';
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

    info.appendChild(title);
    info.appendChild(desc);

    const actions = document.createElement('div');
    actions.className = 'download-actions';

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn danger small';
    removeBtn.textContent = 'Remover';
    removeBtn.onclick = async () => {
      try {
        await fetch('/api/downloads/remove', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ id: item.id })
        });
        downloads = downloads.filter(x => x.id !== item.id);
        await renderAdminList(container);
      } catch (e) {
        alert('Erro ao remover: ' + e.message);
      }
    };

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'btn small';
    copyBtn.textContent = '📋 Link';
    copyBtn.onclick = () => {
      const baseUrl = window.location.origin;
      copyToClipboard(`${baseUrl}/#${item.id}`, '✅ Link copiado!');
    };

    actions.appendChild(copyBtn);
    actions.appendChild(removeBtn);
    el.appendChild(thumb);
    el.appendChild(info);
    el.appendChild(actions);
    container.appendChild(el);
  });
}

// ==================== MAIN ====================
async function init() {
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const discordLoginBtn = document.getElementById('discord-login');
  const syncGithubBtn = document.getElementById('sync-github');
  const loginPrompt = document.getElementById('login-prompt');
  const form = document.getElementById('upload-form');
  const adminList = document.querySelector('.admin-list');
  const listContainer = document.getElementById('admin-downloads-list');
  const clearAllBtn = document.getElementById('clear-all');

  const radios = form.querySelectorAll('input[name="downloadType"]');
  const fileField = form.querySelector('[data-download-file]');
  const linkField = form.querySelector('[data-download-link]');

  // Verificar login status
  currentUser = await apiGetUser();
  const isLogged = !!currentUser;

  loginBtn.style.display = isLogged ? 'none' : 'inline-flex';
  logoutBtn.style.display = isLogged ? 'inline-flex' : 'none';
  syncGithubBtn.style.display = isLogged ? 'inline-flex' : 'none';
  loginPrompt.style.display = isLogged ? 'none' : 'block';
  form.style.display = isLogged ? 'flex' : 'none';
  adminList.style.display = isLogged ? 'flex' : 'none';

  if (isLogged) {
    await renderAdminList(listContainer);
  }

  // Event listeners
  loginBtn.onclick = apiDiscordLogin;
  logoutBtn.onclick = apiLogout;
  discordLoginBtn.onclick = apiDiscordLogin;

  syncGithubBtn.onclick = async () => {
    syncGithubBtn.disabled = true;
    syncGithubBtn.textContent = '⏳ Sincronizando...';
    try {
      await apiPushGitHub(downloads);
      alert('✅ Sincronizado com GitHub!');
    } catch (e) {
      alert('❌ Erro: ' + e.message);
    }
    syncGithubBtn.disabled = false;
    syncGithubBtn.textContent = '📤 Sync';
  };

  clearAllBtn.onclick = async () => {
    if (confirm('Apagar todos os downloads?')) {
      try {
        await fetch('/api/downloads/clear', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        });
        downloads = [];
        await renderAdminList(listContainer);
      } catch (e) {
        alert('Erro ao limpar: ' + e.message);
      }
    }
  };

  // Toggle file/link
  const updateTypeVisibility = () => {
    const selected = [...radios].find(r => r.checked)?.value || 'file';
    fileField.classList.toggle('hidden', selected !== 'file');
    linkField.classList.toggle('hidden', selected === 'file');
  };

  radios.forEach(r => r.addEventListener('change', updateTypeVisibility));
  updateTypeVisibility();

  // Form submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = form.title.value.trim();
    const description = form.description.value.trim();
    const imageFile = form.image.files[0];
    const downloadType = [...radios].find(r => r.checked)?.value || 'file';

    if (!title) {
      alert('Coloque um nome.');
      return;
    }

    let imageDataUrl = null;
    if (imageFile) {
      imageDataUrl = await fileToDataUrl(imageFile);
    }

    const item = {
      id: createId(),
      title,
      description,
      imageDataUrl,
      downloadName: title.replace(/\s+/g, '_'),
      isExternal: downloadType === 'link',
    };

    let jsonPayload = null;

    if (downloadType === 'link') {
      const url = form.externalLink.value.trim();
      if (!url) {
        alert('Coloque o link.');
        return;
      }
      item.externalLink = url;
      jsonPayload = {
        type: 'link',
        title,
        description,
        url,
        createdAt: new Date().toISOString(),
      };
    } else {
      const file = form.file.files[0];
      if (!file) {
        alert('Selecione um arquivo.');
        return;
      }
      const fileDataUrl = await fileToDataUrl(file);
      item.fileDataUrl = fileDataUrl;
      item.downloadName = file.name;
      jsonPayload = {
        type: 'file',
        title,
        description,
        fileName: file.name,
        dataUrl: fileDataUrl,
        createdAt: new Date().toISOString(),
      };
    }

    if (jsonPayload) {
      item.jsonDataUrl = jsonToDataUrl(jsonPayload);
    }

    downloads.unshift(item);
    
    try {
      await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ item })
      });
    } catch (e) {
      console.error('Erro ao salvar no backend:', e);
    }
    
    form.reset();
    updateTypeVisibility();
    await renderAdminList(listContainer);
    alert('✅ Download salvo!');
  });
}

document.addEventListener('DOMContentLoaded', init);