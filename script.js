// Corinvest SPA with Chart.js pie chart for investments
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  setupListeners();
  showRoute('home');
  updateUserUI();
 
});

const $ = s => document.querySelector(s);
const uid = () => '_' + Math.random().toString(36).slice(2,9);

// storage helpers
function storageGet(k,d=null){ try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } }
function storageSet(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function users(){ return storageGet('corinvest_users', []); }
function saveUsers(u){ storageSet('corinvest_users', u); }
function current(){ return storageGet('corinvest_current', null); }
function setCurrent(email){ storageSet('corinvest_current', email); updateUserUI(); }
function clearCurrent(){ localStorage.removeItem('corinvest_current'); updateUserUI(); }

function encodePass(p){ return btoa(p); }
function verifyPass(stored, provided){ return stored === encodePass(provided); }

// listeners and nav
function setupListeners(){
  document.querySelectorAll('.nav-btn').forEach(b => b.addEventListener('click', e => showRoute(e.currentTarget.dataset.route)));
  $('#btn-open-login').addEventListener('click', ()=> showRoute('login'));
  $('#btn-logout').addEventListener('click', ()=> { clearCurrent(); showRoute('home'); });
  $('#btn-delete-account').addEventListener('click', deleteAccountConfirm);
}



// route rendering
function showRoute(route){
  const container = $('#page-container');
  const allowed = ['home','login','chat','invest','myinv'];
  if(!allowed.includes(route)) route='home';
  if(route==='home') container.innerHTML = renderHome();
  if(route==='login') container.innerHTML = renderLogin();
  if(route==='chat') container.innerHTML = renderChat();
  if(route==='invest') container.innerHTML = renderInvest();
  if(route==='myinv') container.innerHTML = renderMyInvest();
  setTimeout(()=> attachBehavior(route), 60);
}

// update UI for login state
function updateUserUI(){
  const cur = current();
  if(cur){
    $('#user-info').classList.remove('hidden');
    $('#nav-chat').classList.remove('hidden');
    $('#nav-invest').classList.remove('hidden');
    $('#nav-myinv').classList.remove('hidden');
    $('#btn-logout').classList.remove('hidden');
    $('#btn-delete-account').classList.remove('hidden');
    $('#btn-open-login').classList.add('hidden');
    const u = users().find(x=>x.email===cur);
    if(u){ $('#ui-name').textContent = u.name; $('#ui-email').textContent = u.email; }
  } else {
    $('#user-info').classList.add('hidden');
    $('#nav-chat').classList.add('hidden');
    $('#nav-invest').classList.add('hidden');
    $('#nav-myinv').classList.add('hidden');
    $('#btn-logout').classList.add('hidden');
    $('#btn-delete-account').classList.add('hidden');
    $('#btn-open-login').classList.remove('hidden');
  }
}

// renderers
function renderHome(){
  const cur = current();
  const userData = cur ? users().find(u => u.email === cur) : null;
  const userName = userData ? userData.name : '';
  const userEmail = userData ? userData.email : '';

  return `
    <div class="card home-grid">
      <div class="left-col">

              <!-- Carrossel -->
        <div class="carousel" id="carousel">
          <img src="homem.jpg" class="active" alt="Investimento 1">
          <img src="mulher.jpg" alt="Investimento 2">
          <img src="grafico.jpg" alt="Logo">
        </div>

        ${cur ? `
          <div class="profile-card">
            <div class="profile-info">
              <div class="profile-avatar">${userName.charAt(0).toUpperCase()}</div>
              <div>
                <h3 id="profile-name">${userName}</h3>
                <p>${userEmail}</p>
              </div>
            </div>
            <div class="profile-actions">
              <button class="btn secondary" onclick="showRoute('myinv')">Ver Investimentos</button>
              <button class="btn" onclick="openProfileEdit()">Editar Perfil</button>
            </div>
          </div>
        ` : `
          <h2 class="h1">Bem-vindo</h2>
          <p class="small">Simulação front-end com funcionalidades de chat e gestão de investimentos.</p>
          
        `}

        <div class="info-cards">
          <div class="info-card"><h4>💡 Dica</h4><p class="small">Defina objetivos claros e mantenha aportes regulares.</p></div>
        </div>

      </div>
    </div>

    <!-- Modal de edição de perfil -->
    <div id="edit-profile-modal" class="modal hidden">
      <div class="modal-card">
        <h3>Editar Perfil</h3>
        <label for="edit-profile-name">Nome</label>
        <input id="edit-profile-name" class="input" placeholder="Novo nome" value="${userName}">
        <div class="modal-actions">
          <button class="btn" onclick="saveProfileEdit()">Salvar</button>
          <button class="btn secondary" onclick="closeProfileEdit()">Cancelar</button>
        </div>
      </div>
    </div>
  `;
}


// Carrossel automático
setInterval(() => {
  const imgs = document.querySelectorAll('#carousel img');
  const active = document.querySelector('#carousel img.active');
  if (!imgs.length) return;
  let idx = Array.from(imgs).indexOf(active);
  imgs[idx].classList.remove('active');
  imgs[(idx + 1) % imgs.length].classList.add('active');
}, 4000);


// Carrossel simples automático
setInterval(() => {
  const imgs = document.querySelectorAll('#carousel img');
  const active = document.querySelector('#carousel img.active');
  if (!imgs.length) return;
  let idx = Array.from(imgs).indexOf(active);
  imgs[idx].classList.remove('active');
  imgs[(idx + 1) % imgs.length].classList.add('active');
}, 4000);


function renderLogin(){
  return `
    <div class="login-centered">
      <div class="card" style="width:400px">
        <h3 class="h1" style="text-align:center;">Acesse sua conta</h3>

        <!-- Área de login -->
        <div id="auth-login">
          <input id="login-email" class="input" placeholder="E-mail" />
          <input id="login-pass" class="input" type="password" placeholder="Senha" />
          <button class="btn" id="btn-login" style="width:100%;">Entrar</button>
          <div style="margin-top:10px;text-align:center;" class="small">
            Não tem conta?
            <a href="#" id="link-show-register">Criar conta</a>
          </div>
        </div>

        <!-- Área de registro (inicialmente oculta) -->
        <div id="auth-register" style="display:none;margin-top:10px;">
          <input id="reg-name" class="input" placeholder="Nome completo" />
          <input id="reg-email" class="input" placeholder="E-mail" />
          <input id="reg-phone" class="input" placeholder="Telefone" />
          <select id="reg-sex" class="select">
            <option value="">Sexo</option>
            <option>Masculino</option>
            <option>Feminino</option>
            <option>Outro</option>
          </select>
          <input id="reg-pass" class="input" type="password" placeholder="Senha" />
          <button class="btn" id="btn-register" style="width:100%;">Registrar</button>
          <div style="margin-top:10px;text-align:center;" class="small">
            Já tem conta?
            <a href="#" id="link-show-login">Fazer login</a>
          </div>
        </div>
      </div>
    </div>
  `;
}



function renderChat(){
  if(!current()) return `<div class="card"><h2 class="h1">Chat</h2><p class="small">Faça login para usar o chat.</p><button class="btn" onclick="showRoute('login')">Entrar</button></div>`;
  return `
    <div class="card chat-card">
      <h2 class="h1">Chat com Consultor</h2>
      <div id="chat-history" class="chat-history"></div>

      <div class="chat-actions" id="chat-actions">
        <button class="chat-suggest">Bom dia</button>
       
        <button class="chat-suggest">Meus investimentos</button>
        <button class="chat-suggest">Taxa / Rendimentos</button>
        
      </div>

      <div style="margin-top:12px;display:flex;gap:12px;align-items:center">
        <button id="btn-to-invest" class="continue-invest">Continuar para Investimentos →</button>
        <div class="small" style="margin-left:auto">Clique nas sugestões para enviar rápido</div>
      </div>
    </div>
  `;
}

function renderInvest(){
  if(!current()) return `<div class="card"><p class="small">Faça login para cadastrar investimentos.</p><button class="btn" onclick="showRoute('login')">Entrar</button></div>`;
  return `
    <div class="card">
      <h2 class="h1">Cadastrar Investimento</h2>

      <div class="modal-row">
        <label>Tipo</label>
        <div class="type-select">
          <div class="type-option" data-type="Cripto">Criptomoedas</div>
          <div class="type-option" data-type="Ações">Ações</div>
          <div class="type-option" data-type="Bens">Bens pessoais</div>
        </div>
      </div>

      <div style="display:flex;gap:12px;margin-top:8px">
        <input id="inv-name" class="input" placeholder="Nome do investimento (ex: Bitcoin, VALE3)" />
        <input id="inv-value" class="input" placeholder="Valor (R$)" />
      </div>

      <div style="display:flex;gap:12px;margin-top:8px">
        <input id="inv-date" class="input" type="date" />
        <input id="inv-note" class="input" placeholder="Observação (opcional)" />
      </div>

      <div style="margin-top:12px;display:flex;gap:10px">
        <button class="btn" id="btn-save-inv">Salvar investimento</button>
        <button class="btn secondary" id="btn-view-myinv">Ver meus investimentos</button>
      </div>
    </div>
  `;
}

function renderMyInvest(){
  if(!current()) return `<div class="card"><p class="small">Faça login para ver seus investimentos.</p></div>`;
  const invs = storageGet(`corinvest_inv_${current()}`, []);
  const rows = invs.map(i => `
    <tr>
      <td>${escapeHtml(i.name)}</td>
      <td>${escapeHtml(i.type)}</td>
      <td>R$ ${Number(i.value).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td>
      <td>${i.date||'-'}</td>
      <td>${escapeHtml(i.note||'')}</td>
      <td>
        <button class="btn secondary" onclick="startEditInv('${i.id}')">Editar</button>
        <button class="btn secondary" onclick="deleteInvestment('${i.id}')">Excluir</button>
      </td>
    </tr>
  `).join('');
  return `
    <div class="card">
      <h2 class="h1">Meus Investimentos</h2>
      ${invs.length===0?'<p class="small">Nenhum investimento cadastrado.</p>':`
        <table class="table">
          <thead><tr><th>Nome</th><th>Tipo</th><th>Valor</th><th>Data</th><th>Observação</th><th>Ações</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      `}
      <div style="margin-top:12px">
        <button class="btn" onclick="showRoute('invest')">Cadastrar novo</button>
        <button class="btn secondary" onclick="showRoute('chat')">Voltar ao chat</button>
      </div>

      <div style="margin-top:18px" class="card">
        <h3 class="h1">Distribuição dos seus Investimentos</h3>
        <canvas id="pieChart" width="400" height="200"></canvas>
      </div>
    </div>
  `;
}

// attach behaviors
function attachBehavior(route){
  if(route==='home') initAutoFeed();
  if(route==='login') initAuth();
  if(route==='chat') initChat();
  if(route==='invest') initInvest();
  if(route==='myinv') { renderPieChart(); }

  // default: attach nav highlight
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(x=>x.dataset.route===route);
  if(activeBtn) activeBtn.classList.add('active');
}

// auto messages feed
const autoMessages = [
  "Comece a investir hoje — pequenas ações, grandes resultados.",
  "Dica: mantenha uma reserva de emergência antes de investimentos mais arriscados.",
  "Investir com disciplina e prazo traz resultados sólidos.",
  "Diversificar protege seu patrimônio contra volatilidade."
];
function initAutoFeed(){
  const feed = $('#auto-feed');
  feed.innerHTML = '';
  let idx=0;
  const push = ()=> {
    const p = document.createElement('div');
    p.className='small';
    p.style.marginBottom='8px';
    p.textContent = autoMessages[idx];
    feed.prepend(p);
    idx = (idx+1) % autoMessages.length;
  };
  for(let i=0;i<3;i++) push();
  if(window._autoFeedInterval) clearInterval(window._autoFeedInterval);
  window._autoFeedInterval = setInterval(push,6000);
}

// auth
function initAuth(){
  const showRegister = $('#link-show-register');
  const showLogin = $('#link-show-login');
  const boxLogin = $('#auth-login');
  const boxRegister = $('#auth-register');

  showRegister?.addEventListener('click', e => {
    e.preventDefault();
    boxLogin.style.display = 'none';
    boxRegister.style.display = 'block';
  });

  showLogin?.addEventListener('click', e => {
    e.preventDefault();
    boxLogin.style.display = 'block';
    boxRegister.style.display = 'none';
  });

  $('#btn-register')?.addEventListener('click', doRegister);
  $('#btn-login')?.addEventListener('click', doLogin);
}

function doRegister(){
  const name = $('#reg-name').value.trim();
  const email = $('#reg-email').value.trim().toLowerCase();
  const phone = $('#reg-phone').value.trim();
  const sex = $('#reg-sex').value;
  const pass = $('#reg-pass').value;
  if(!name||!email||!pass){ alert('Preencha nome, e-mail e senha.'); return; }
  const us = users();
  if(us.find(u=>u.email===email)){ alert('E-mail já cadastrado.'); return; }
  const id = uid();
  us.push({id,name,email,phone,sex,pass:encodePass(pass)});
  saveUsers(us);
  storageSet(`corinvest_chats_${email}`, []);
  storageSet(`corinvest_inv_${email}`, []);
  setCurrent(email);
  showRoute('chat');
}
function doLogin(){
  const email = $('#login-email').value.trim().toLowerCase();
  const pass = $('#login-pass').value;
  const u = users().find(x=>x.email===email);
  if(!u || !verifyPass(u.pass,pass)){ alert('Usuário ou senha incorretos.'); return; }
  setCurrent(email);
  showRoute('chat');
}

// chat
function initChat(){
  const hist = storageGet(`corinvest_chats_${current()}`, []);
  const ch = $('#chat-history'); ch.innerHTML='';
  if(hist.length===0){
    const w = "Olá! Sou o assistente virtual da CoorinInvest. Como posso ajudar hoje?";
    addBotMessage(w);
    pushChat('bot',w);
  } else hist.forEach(m=> renderMessage(m.sender,m.text));

  document.querySelectorAll('.chat-suggest').forEach(btn=>{
    btn.onclick = ()=> {
      const txt = btn.textContent.trim();
      addUserMessage(txt);
      const rep = botReplyFor(txt);
      setTimeout(()=>{ addBotMessage(rep); },350);
    };
  });

  $('#btn-to-invest').onclick = ()=> {
    $('#btn-to-invest').disabled=true;
    $('#btn-to-invest').textContent='Abrindo investimentos...';
    setTimeout(()=> { $('#btn-to-invest').disabled=false; $('#btn-to-invest').textContent='Continuar para Investimentos →'; showRoute('invest'); },700);
  };
}

function renderMessage(sender,text){
  const ch = $('#chat-history');
  const div = document.createElement('div'); div.className='msg '+(sender==='user'?'user':'bot');
  div.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  ch.appendChild(div); ch.scrollTop = ch.scrollHeight;
}
function addUserMessage(t){ renderMessage('user',t); pushChat('user',t); }
function addBotMessage(t){ renderMessage('bot',t); pushChat('bot',t); }
function pushChat(sender,text){
  const key = `corinvest_chats_${current()}`; const arr = storageGet(key,[]); arr.push({sender,text,iso:new Date().toISOString()}); storageSet(key,arr);
}
function botReplyFor(text){
  const t = text.toLowerCase();
  if(t.includes('bom')||t.includes('oi')) return "Olá! Bom dia. Posso mostrar seus investimentos ou explicar rentabilidade.";
  if(t.includes('quero ajuda')||t.includes('ajuda')) return "Claro — em que área deseja ajuda? Você pode ver sua carteira ou cadastrar novos investimentos.";
  if(t.includes('meus investimentos')||t.includes('investimentos')) return "Vou abrir sua tela de investimentos. Clique no botão grande para continuar.";
  if(t.includes('taxa')||t.includes('rendiment')) return "Rentabilidade prevista: renda fixa ~6-8% (exemplo). Renda variável depende do mercado.";
  if(t.includes('consultor')) return "Posso simular uma orientação básica. Deseja que eu gere uma sugestão de alocação?";
  return "Posso: (1) mostrar investimentos, (2) explicar rentabilidade, (3) ajudar a cadastrar um investimento.";
}

// investments
function initInvest(){
  $('#inv-date').value = new Date().toISOString().slice(0,10);
  // type selection buttons
  document.querySelectorAll('.type-option').forEach(el=>{
    el.onclick = ()=> {
      document.querySelectorAll('.type-option').forEach(x=>x.classList.remove('active'));
      el.classList.add('active');
    };
  });
  $('#btn-save-inv').onclick = saveInvestment;
  $('#btn-view-myinv').onclick = ()=> showRoute('myinv');
}

function saveInvestment(){
  const typeEl = document.querySelector('.type-option.active');
  if(!typeEl){ alert('Selecione o tipo de investimento.'); return; }
  const type = typeEl.dataset.type;
  const name = $('#inv-name').value.trim() || type;
  const value = $('#inv-value').value.trim().replace(',','.');
  const date = $('#inv-date').value;
  const note = $('#inv-note').value.trim();
  if(!value || isNaN(Number(value))){ alert('Preencha valor válido.'); return; }
  const key = `corinvest_inv_${current()}`; const arr = storageGet(key,[]);
  arr.push({id:uid(), name, type, value: Number(value), date, note});
  storageSet(key,arr);
  alert('Investimento salvo.');
  showRoute('myinv');
}

function deleteInvestment(id){
  if(!confirm('Excluir esse investimento?')) return;
  const key = `corinvest_inv_${current()}`;
  let arr = storageGet(key,[]); arr = arr.filter(i=>i.id!==id);
  storageSet(key,arr); showRoute('myinv');
}

// edit modal
let _editingId = null;
function startEditInv(id){
  _editingId = id;
  const key = `corinvest_inv_${current()}`; const arr = storageGet(key,[]);
  const inv = arr.find(x=>x.id===id); if(!inv) return;
  $('#modal-name').value = inv.name; $('#modal-add').value=''; $('#edit-modal').classList.remove('hidden');
  // set type buttons active in modal
  document.querySelectorAll('#edit-modal .type-btn').forEach(b=>{ b.classList.remove('active'); if(b.dataset.type===inv.type) b.classList.add('active'); b.onclick = ()=> { document.querySelectorAll('#edit-modal .type-btn').forEach(x=>x.classList.remove('active')); b.classList.add('active'); } });
  $('#modal-cancel').onclick = ()=> { _editingId=null; $('#edit-modal').classList.add('hidden'); };
  $('#modal-save').onclick = saveEditInv;
}

function saveEditInv(){
  const name = $('#modal-name').value.trim();
  const add = parseFloat($('#modal-add').value) || 0;
  const typeBtn = Array.from(document.querySelectorAll('#edit-modal .type-btn')).find(b=>b.classList.contains('active'));
  const newType = typeBtn ? typeBtn.dataset.type : null;
  if(!name){ alert('Nome não pode ficar vazio.'); return; }
  const key = `corinvest_inv_${current()}`; const arr = storageGet(key,[]);
  const inv = arr.find(x=>x.id===_editingId); if(!inv) return;
  inv.name = name; inv.value = Number(inv.value) + Number(add); if(newType) inv.type = newType;
  storageSet(key,arr); _editingId=null; $('#edit-modal').classList.add('hidden'); showRoute('myinv');
}

// pie chart
let pieChart = null;
function renderPieChart(){
  const invs = storageGet(`corinvest_inv_${current()}`, []);
  const totals = {};
  invs.forEach(i => { totals[i.type] = (totals[i.type] || 0) + Number(i.value); });
  const labels = Object.keys(totals);
  const data = labels.map(l => totals[l]);
  const colors = labels.map((_,idx)=> ['#F97316','#FB8F24','#1F2937'][idx % 3]);
  const ctx = document.getElementById('pieChart').getContext('2d');
  if(pieChart) pieChart.destroy();
  pieChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
        borderColor:'#ffffff',
        borderWidth:2
      }]
    },
    options: {
      responsive:true,
      plugins:{ legend:{ position:'bottom' } }
    }
  });
}

// delete account
function deleteAccountConfirm(){
  const cur = current(); if(!cur){ alert('Nenhuma conta logada.'); return; }
  if(!confirm('Tem certeza que deseja excluir sua conta? Todos os dados serão removidos deste navegador.')) return;
  let us = users().filter(u=>u.email!==cur); saveUsers(us);
  localStorage.removeItem(`corinvest_chats_${cur}`); localStorage.removeItem(`corinvest_inv_${cur}`);
  clearCurrent(); alert('Conta excluída.'); showRoute('home');
}

// util: escape
function escapeHtml(s){ return (s||'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
function storageGet(k,d=[]){ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch(e){return d;} }
function storageSet(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
