// ============================================================
// BUCHTAUSCH SCHWEIZ – App Logic
// ============================================================

const SUPABASE_URL = 'https://ppklhjglbhmrcervmpsr.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwa2xoamdsYmhtcmNlcnZtcHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MjYxMzMsImV4cCI6MjA5MTMwMjEzM30.GcbSa1GvxOc6YrUlLIpN1zxCW3HR-ZiGf1JB1Sa8peE';

const { createClient } = supabase;
const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let currentProfile = null;
let currentLang = 'de';
let searchTimer = null;
let currentConversationId = null;

// ── i18n ──────────────────────────────────────────────────
const T = {
  de: {
    nav_suchen: 'Bücher suchen', nav_karte: 'Karte',
    nav_bibliothek: 'Meine Bücher', nav_matches: 'Matches',
    nav_nachrichten: 'Nachrichten', nav_login: 'Anmelden',
    nav_register: 'Registrieren', nav_profil: 'Profil',
    nav_wunschliste: 'Wunschliste', nav_logout: 'Abmelden',
    hero_badge: '🇨🇭 Die Schweizer Buchtausch-Plattform',
    hero_title: 'Bücher tauschen,\nFreude teilen',
    hero_sub: 'Tausche Bücher direkt oder mit Buchpunkten. Finde Tauschpartner in deiner Nähe – kostenlos und nachhaltig.',
    hero_cta: 'Jetzt mitmachen', hero_browse: 'Bücher entdecken',
    stat_buecher: 'Bücher', stat_nutzer: 'Nutzer', stat_tausche: 'Tausche',
    how_title: "So funktioniert's",
    step1_title: 'Bücher eintragen', step1_text: 'Trage deine Bücher ein und erstelle deine Wunschliste.',
    step2_title: 'Match finden', step2_text: 'Das System findet automatisch passende Tauschpartner in deiner Nähe.',
    step3_title: 'Tauschen', step3_text: 'Tausche direkt oder nutze Buchpunkte. Persönlich oder per Post.',
    recent_title: 'Zuletzt eingetragen',
    suchen_title: 'Bücher suchen',
    karte_title: 'Deponie-Standorte', karte_sub: 'Orte wo du Bücher hinterlegen und abholen kannst',
    login_title: 'Willkommen zurück', login_sub: 'Melde dich an um Bücher zu tauschen', login_btn: 'Anmelden',
    register_title: 'Konto erstellen', register_btn: 'Konto erstellen',
    bibliothek_title: 'Meine Bücher', bibliothek_add: '+ Buch hinzufügen',
    tab_angebote: 'Meine Angebote', tab_wunschliste: 'Wunschliste',
    matches_title: 'Meine Matches', matches_sub: 'Automatisch gefundene Tauschpartner',
    nachrichten_title: 'Nachrichten',
    profil_title: 'Mein Profil',
    match_perfekt: '🎯 Perfekter Match', match_punkte: '🪙 Punkte-Match',
    tausch_anfragen: 'Tausch anfragen', wunschliste_add: '+ Wunschliste',
    zustand_neuwertig: 'Neuwertig', zustand_gut: 'Gut', zustand_akzeptabel: 'Akzeptabel',
    uebergabe_persoenlich: 'Persönlich', uebergabe_versand: 'Versand', uebergabe_beides: 'Persönlich & Versand',
    no_books: 'Noch keine Bücher vorhanden', no_books_sub: 'Sei der Erste und trage ein Buch ein!',
    no_my_books: 'Du hast noch keine Bücher eingetragen', no_my_books_sub: 'Klicke auf "+ Buch hinzufügen" um loszulegen.',
    no_wishlist: 'Deine Wunschliste ist leer', no_wishlist_sub: 'Füge Bücher hinzu die du gerne lesen möchtest.',
    no_matches: 'Noch keine Matches gefunden', no_matches_sub: 'Trage Bücher ein und füge Wünsche hinzu um Matches zu finden.',
    toast_added: '✅ Buch eingetragen!', toast_wish_added: '❤️ Zur Wunschliste hinzugefügt!',
    toast_deleted: '🗑️ Buch entfernt', toast_saved: '✅ Gespeichert!',
    toast_login_required: '🔒 Bitte zuerst anmelden',
    toast_error: '❌ Fehler aufgetreten',
    km_away: 'km entfernt',
    deponie_empty: 'Noch keine Deponie-Standorte eingetragen. Admin fügt diese bald hinzu.',
    notif_empty: 'Keine Benachrichtigungen vorhanden.',
    send: 'Senden', message_placeholder: 'Nachricht schreiben...',
  },
  fr: {
    nav_suchen: 'Chercher des livres', nav_karte: 'Carte',
    nav_bibliothek: 'Mes livres', nav_matches: 'Correspondances',
    nav_nachrichten: 'Messages', nav_login: "S'identifier",
    nav_register: "S'inscrire", nav_profil: 'Profil',
    nav_wunschliste: 'Liste de souhaits', nav_logout: 'Déconnexion',
    hero_badge: '🇨🇭 La plateforme suisse d\'échange de livres',
    hero_title: 'Échangez des livres,\npartagez la joie',
    hero_sub: 'Échangez des livres directement ou avec des points. Trouvez des partenaires près de chez vous – gratuitement et durablement.',
    hero_cta: 'Participer maintenant', hero_browse: 'Découvrir des livres',
    stat_buecher: 'Livres', stat_nutzer: 'Utilisateurs', stat_tausche: 'Échanges',
    how_title: 'Comment ça marche',
    step1_title: 'Ajouter des livres', step1_text: 'Entrez vos livres et créez votre liste de souhaits.',
    step2_title: 'Trouver une correspondance', step2_text: 'Le système trouve automatiquement des partenaires près de chez vous.',
    step3_title: 'Échanger', step3_text: 'Échangez directement ou utilisez des points. En personne ou par courrier.',
    recent_title: 'Récemment ajoutés',
    suchen_title: 'Chercher des livres',
    karte_title: 'Points de dépôt', karte_sub: 'Endroits où vous pouvez déposer et récupérer des livres',
    login_title: 'Bon retour', login_sub: 'Connectez-vous pour échanger des livres', login_btn: 'Se connecter',
    register_title: 'Créer un compte', register_btn: 'Créer un compte',
    bibliothek_title: 'Mes livres', bibliothek_add: '+ Ajouter un livre',
    tab_angebote: 'Mes offres', tab_wunschliste: 'Liste de souhaits',
    matches_title: 'Mes correspondances', matches_sub: 'Partenaires trouvés automatiquement',
    nachrichten_title: 'Messages',
    profil_title: 'Mon profil',
    match_perfekt: '🎯 Correspondance parfaite', match_punkte: '🪙 Correspondance par points',
    tausch_anfragen: 'Demander un échange', wunschliste_add: '+ Liste de souhaits',
    zustand_neuwertig: 'Comme neuf', zustand_gut: 'Bon', zustand_akzeptabel: 'Acceptable',
    uebergabe_persoenlich: 'En personne', uebergabe_versand: 'Envoi postal', uebergabe_beides: 'Les deux',
    no_books: 'Aucun livre disponible', no_books_sub: 'Soyez le premier à ajouter un livre!',
    no_my_books: "Vous n'avez pas encore ajouté de livres", no_my_books_sub: 'Cliquez sur "+ Ajouter un livre" pour commencer.',
    no_wishlist: 'Votre liste de souhaits est vide', no_wishlist_sub: 'Ajoutez des livres que vous souhaitez lire.',
    no_matches: 'Aucune correspondance trouvée', no_matches_sub: 'Ajoutez des livres et des souhaits pour trouver des correspondances.',
    toast_added: '✅ Livre ajouté!', toast_wish_added: '❤️ Ajouté à la liste de souhaits!',
    toast_deleted: '🗑️ Livre supprimé', toast_saved: '✅ Enregistré!',
    toast_login_required: '🔒 Veuillez vous connecter d\'abord',
    toast_error: '❌ Une erreur s\'est produite',
    km_away: 'km de distance',
    deponie_empty: 'Aucun point de dépôt encore. L\'admin les ajoutera bientôt.',
    notif_empty: 'Aucune notification.',
    send: 'Envoyer', message_placeholder: 'Écrire un message...',
  },
  it: {
    nav_suchen: 'Cercare libri', nav_karte: 'Mappa',
    nav_bibliothek: 'I miei libri', nav_matches: 'Abbinamenti',
    nav_nachrichten: 'Messaggi', nav_login: 'Accedi',
    nav_register: 'Registrati', nav_profil: 'Profilo',
    nav_wunschliste: 'Lista desideri', nav_logout: 'Disconnetti',
    hero_badge: '🇨🇭 La piattaforma svizzera di scambio libri',
    hero_title: 'Scambia libri,\ncondividi la gioia',
    hero_sub: 'Scambia libri direttamente o con punti libro. Trova partner di scambio vicino a te – gratuitamente e in modo sostenibile.',
    hero_cta: 'Partecipa ora', hero_browse: 'Scopri libri',
    stat_buecher: 'Libri', stat_nutzer: 'Utenti', stat_tausche: 'Scambi',
    how_title: 'Come funziona',
    step1_title: 'Inserisci libri', step1_text: 'Inserisci i tuoi libri e crea la tua lista dei desideri.',
    step2_title: 'Trova abbinamento', step2_text: 'Il sistema trova automaticamente partner di scambio vicino a te.',
    step3_title: 'Scambia', step3_text: 'Scambia direttamente o usa punti libro. Di persona o per posta.',
    recent_title: 'Aggiunti di recente',
    suchen_title: 'Cercare libri',
    karte_title: 'Punti di deposito', karte_sub: 'Luoghi dove puoi depositare e ritirare libri',
    login_title: 'Bentornato', login_sub: 'Accedi per scambiare libri', login_btn: 'Accedi',
    register_title: 'Crea account', register_btn: 'Crea account',
    bibliothek_title: 'I miei libri', bibliothek_add: '+ Aggiungi libro',
    tab_angebote: 'Le mie offerte', tab_wunschliste: 'Lista desideri',
    matches_title: 'I miei abbinamenti', matches_sub: 'Partner trovati automaticamente',
    nachrichten_title: 'Messaggi',
    profil_title: 'Il mio profilo',
    match_perfekt: '🎯 Abbinamento perfetto', match_punkte: '🪙 Abbinamento a punti',
    tausch_anfragen: 'Richiedere scambio', wunschliste_add: '+ Lista desideri',
    zustand_neuwertig: 'Come nuovo', zustand_gut: 'Buono', zustand_akzeptabel: 'Accettabile',
    uebergabe_persoenlich: 'Di persona', uebergabe_versand: 'Per posta', uebergabe_beides: 'Entrambi',
    no_books: 'Nessun libro disponibile', no_books_sub: 'Sii il primo ad aggiungere un libro!',
    no_my_books: 'Non hai ancora aggiunto libri', no_my_books_sub: 'Clicca su "+ Aggiungi libro" per iniziare.',
    no_wishlist: 'La tua lista desideri è vuota', no_wishlist_sub: 'Aggiungi libri che vorresti leggere.',
    no_matches: 'Nessun abbinamento trovato', no_matches_sub: 'Aggiungi libri e desideri per trovare abbinamenti.',
    toast_added: '✅ Libro aggiunto!', toast_wish_added: '❤️ Aggiunto alla lista desideri!',
    toast_deleted: '🗑️ Libro rimosso', toast_saved: '✅ Salvato!',
    toast_login_required: '🔒 Effettua prima l\'accesso',
    toast_error: '❌ Si è verificato un errore',
    km_away: 'km di distanza',
    deponie_empty: 'Nessun punto di deposito ancora. L\'admin li aggiungerà presto.',
    notif_empty: 'Nessuna notifica.',
    send: 'Invia', message_placeholder: 'Scrivi un messaggio...',
  }
};

function t(key) { return T[currentLang][key] || T['de'][key] || key; }

function setLang(lang) {
  currentLang = lang;
  document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById('lang-' + lang);
  if (btn) btn.classList.add('active');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      el.innerHTML = t(key).replace(/\n/g, '<br>');
    }
  });
  if (currentProfile) {
    sb.from('profiles').update({ sprache: lang }).eq('id', currentUser.id);
  }
}

// ── NAV & PAGES ──────────────────────────────────────────
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + page);
  if (el) el.classList.add('active');
  document.getElementById('userDropdown')?.classList.remove('open');

  if (page === 'home') loadRecentBooks();
  if (page === 'suchen') loadSearchResults();
  if (page === 'karte') loadDeponieStandorte();
  if (page === 'bibliothek') loadMyBooks();
  if (page === 'matches') loadMatches();
  if (page === 'nachrichten') loadConversations();
  if (page === 'profil') loadProfile();
  if (page === 'benachrichtigungen') loadNotifications();
}

function requireAuth(page) {
  if (!currentUser) { showToast(t('toast_login_required'), 'error'); showPage('login'); return; }
  showPage(page);
}

function toggleUserMenu() {
  document.getElementById('userDropdown').classList.toggle('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.user-menu') && !e.target.closest('.user-dropdown')) {
    document.getElementById('userDropdown')?.classList.remove('open');
  }
});

function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tabs .tab').forEach(t => t.classList.remove('active'));
  document.getElementById('tab-' + tabId)?.classList.add('active');
  if (btn) btn.classList.add('active');
  if (tabId === 'wunschliste-tab') loadWishlist();
}

function switchModalTab(tabId, btn) {
  document.querySelectorAll('.modal-tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.modal-tabs .tab').forEach(t => t.classList.remove('active'));
  document.getElementById('modal-' + tabId)?.classList.add('active');
  if (btn) btn.classList.add('active');
}

// ── AUTH ─────────────────────────────────────────────────
async function login() {
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPassword').value;
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  if (!email || !pw) { errEl.textContent = 'Bitte E-Mail und Passwort eingeben.'; errEl.style.display = 'block'; return; }
  const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
  if (error) { errEl.textContent = error.message; errEl.style.display = 'block'; return; }
  currentUser = data.user;
  await loadCurrentProfile();
  updateNavAuth();
  checkNotifications();
  showPage('home');
}

async function register() {
  const vorname = document.getElementById('registerVorname').value.trim();
  const nachname = document.getElementById('registerNachname').value.trim();
  const username = document.getElementById('registerUsername').value.trim().toLowerCase();
  const email = document.getElementById('registerEmail').value.trim();
  const plz = document.getElementById('registerPlz').value.trim();
  const ort = document.getElementById('registerOrt').value.trim();
  const pw = document.getElementById('registerPassword').value;
  const sprache = document.getElementById('registerSprache').value;
  const errEl = document.getElementById('registerError');
  const succEl = document.getElementById('registerSuccess');
  errEl.style.display = 'none'; succEl.style.display = 'none';

  if (!vorname || !username || !email || !pw) {
    errEl.textContent = 'Bitte alle Pflichtfelder ausfüllen.'; errEl.style.display = 'block'; return;
  }
  if (pw.length < 6) {
    errEl.textContent = 'Passwort muss mindestens 6 Zeichen haben.'; errEl.style.display = 'block'; return;
  }

  const { error } = await sb.auth.signUp({
    email, password: pw,
    options: { data: { username, full_name: `${vorname} ${nachname}`.trim(), plz, ort, sprache } }
  });

  if (error) { errEl.textContent = error.message; errEl.style.display = 'block'; }
  else {
    // Update profile with plz/ort/sprache after signup
    succEl.textContent = 'Konto erstellt! Du kannst dich jetzt anmelden.';
    succEl.style.display = 'block';
    setTimeout(() => showPage('login'), 2000);
  }
}

async function logout() {
  await sb.auth.signOut();
  currentUser = null; currentProfile = null;
  updateNavAuth();
  showPage('home');
  showToast('👋 Abgemeldet');
}

// ── SESSION ───────────────────────────────────────────────
sb.auth.onAuthStateChange(async (event, session) => {
  currentUser = session?.user || null;
  if (currentUser) {
    await loadCurrentProfile();
    updateNavAuth();
    checkNotifications();
  } else {
    updateNavAuth();
  }
});

async function loadCurrentProfile() {
  const { data } = await sb.from('profiles').select('*').eq('id', currentUser.id).single();
  currentProfile = data;
  if (data?.sprache) setLang(data.sprache);
  return data;
}

function updateNavAuth() {
  const authArea = document.getElementById('navAuthArea');
  const userArea = document.getElementById('navUserArea');
  if (currentUser && currentProfile) {
    authArea.style.display = 'none';
    userArea.style.display = 'flex';
    document.getElementById('userName').textContent = currentProfile.username || '';
    document.getElementById('userAvatar').textContent = (currentProfile.username || 'U')[0].toUpperCase();
  } else if (currentUser) {
    authArea.style.display = 'none';
    userArea.style.display = 'flex';
  } else {
    authArea.style.display = 'flex';
    userArea.style.display = 'none';
  }
}

// ── BOOKS ─────────────────────────────────────────────────
function bookCard(buch, bibliothek, opts = {}) {
  const zustandMap = { neuwertig: t('zustand_neuwertig'), gut: t('zustand_gut'), akzeptabel: t('zustand_akzeptabel') };
  const uebergabeMap = { persoenlich: t('uebergabe_persoenlich'), versand: t('uebergabe_versand'), beides: t('uebergabe_beides') };
  const distBadge = opts.dist ? `<span class="badge badge-distance">📍 ${opts.dist} ${t('km_away')}</span>` : '';
  const isOwn = currentUser && bibliothek?.user_id === currentUser.id;

  let actions = '';
  if (isOwn) {
    actions = `<button class="btn-sm btn-delete" onclick="deleteBook('${bibliothek.id}')">🗑️ Entfernen</button>`;
  } else {
    actions = `
      <button class="btn-sm btn-wish" onclick="addToWishlist('${buch.id}')">❤️</button>
      ${currentUser ? `<button class="btn-sm btn-tausch" onclick="requestTausch('${bibliothek.id}')">🔄 ${t('tausch_anfragen')}</button>` : ''}
    `;
  }

  return `
    <div class="book-card">
      <div class="book-cover">📚<span class="book-lang-badge">${buch.sprache?.toUpperCase()}</span></div>
      <div class="book-title">${buch.titel}</div>
      <div class="book-author">${buch.autor}</div>
      <div class="book-meta">
        <span class="badge badge-zustand">${zustandMap[bibliothek?.zustand] || ''}</span>
        <span class="badge badge-uebergabe">${uebergabeMap[bibliothek?.uebergabe_art] || ''}</span>
        ${distBadge}
      </div>
      <div class="book-actions">${actions}</div>
    </div>`;
}

function wishCard(buch, wunsch) {
  return `
    <div class="book-card">
      <div class="book-cover">❤️<span class="book-lang-badge">${buch.sprache?.toUpperCase()}</span></div>
      <div class="book-title">${buch.titel}</div>
      <div class="book-author">${buch.autor}</div>
      <div class="book-actions">
        <button class="btn-sm btn-delete" onclick="removeWish('${wunsch.id}')">🗑️ Entfernen</button>
      </div>
    </div>`;
}

async function loadRecentBooks() {
  const el = document.getElementById('recentBooks');
  el.innerHTML = '<div class="loading-spinner"></div>';
  const { data } = await sb.from('bibliothek')
    .select('*, buecher(*)')
    .eq('aktiv', true)
    .order('created_at', { ascending: false })
    .limit(8);

  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📚</div><h3>${t('no_books')}</h3><p>${t('no_books_sub')}</p></div>`;
    return;
  }
  el.innerHTML = data.map(b => bookCard(b.buecher, b)).join('');

  // Load stats
  const [bData, nData] = await Promise.all([
    sb.from('bibliothek').select('id', { count: 'exact', head: true }),
    sb.from('profiles').select('id', { count: 'exact', head: true })
  ]);
  document.getElementById('statBuecher').textContent = bData.count || 0;
  document.getElementById('statNutzer').textContent = nData.count || 0;
  document.getElementById('statTausche').textContent = '0';
}

async function loadSearchResults() {
  const el = document.getElementById('searchResults');
  el.innerHTML = '<div class="loading-spinner"></div>';
  const q = document.getElementById('searchInput')?.value.trim();
  const sprache = document.getElementById('filterSprache')?.value;
  const uebergabe = document.getElementById('filterUebergabe')?.value;

  let query = sb.from('bibliothek')
    .select('*, buecher(*), profiles(plz, ort)')
    .eq('aktiv', true);

  if (sprache) query = query.eq('buecher.sprache', sprache);
  if (uebergabe) query = query.eq('uebergabe_art', uebergabe);
  if (q) query = query.or(`titel.ilike.%${q}%,autor.ilike.%${q}%,isbn.ilike.%${q}%`, { foreignTable: 'buecher' });

  const { data } = await query.order('created_at', { ascending: false }).limit(40);

  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><h3>${t('no_books')}</h3><p>${t('no_books_sub')}</p></div>`;
    return;
  }
  el.innerHTML = data.map(b => bookCard(b.buecher, b)).join('');
}

function searchBooks() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadSearchResults, 300);
}

async function loadMyBooks() {
  if (!currentUser) return;
  const el = document.getElementById('myBooks');
  el.innerHTML = '<div class="loading-spinner"></div>';
  const { data } = await sb.from('bibliothek')
    .select('*, buecher(*)')
    .eq('user_id', currentUser.id)
    .eq('aktiv', true)
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📚</div><h3>${t('no_my_books')}</h3><p>${t('no_my_books_sub')}</p></div>`;
    return;
  }
  el.innerHTML = data.map(b => bookCard(b.buecher, b)).join('');
}

async function loadWishlist() {
  if (!currentUser) return;
  const el = document.getElementById('myWishlist');
  el.innerHTML = '<div class="loading-spinner"></div>';
  const { data } = await sb.from('wunschliste')
    .select('*, buecher(*)')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">❤️</div><h3>${t('no_wishlist')}</h3><p>${t('no_wishlist_sub')}</p></div>`;
    return;
  }
  el.innerHTML = data.map(w => wishCard(w.buecher, w)).join('');
}

function showAddBookModal() {
  if (!currentUser) { showToast(t('toast_login_required'), 'error'); return; }
  document.getElementById('addBookModal').style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

async function addBook(typ) {
  if (!currentUser) return;
  const isAngebot = typ === 'angebot';
  const titel = document.getElementById(isAngebot ? 'bookTitel' : 'wishTitel').value.trim();
  const autor = document.getElementById(isAngebot ? 'bookAutor' : 'wishAutor').value.trim();
  const isbn = document.getElementById(isAngebot ? 'bookIsbn' : 'wishIsbn').value.trim();
  const sprache = document.getElementById(isAngebot ? 'bookSprache' : 'wishSprache').value;

  if (!titel || !autor) { showToast('Bitte Titel und Autor eingeben', 'error'); return; }

  // Upsert Buch
  let buchId;
  if (isbn) {
    const { data: existing } = await sb.from('buecher').select('id').eq('isbn', isbn).single();
    if (existing) { buchId = existing.id; }
  }
  if (!buchId) {
    const { data: newBuch, error } = await sb.from('buecher').insert({ titel, autor, isbn: isbn || null, sprache }).select('id').single();
    if (error) { showToast(t('toast_error'), 'error'); return; }
    buchId = newBuch.id;
  }

  if (isAngebot) {
    const zustand = document.getElementById('bookZustand').value;
    const uebergabe_art = document.getElementById('bookUebergabe').value;
    const notiz = document.getElementById('bookNotiz').value.trim();
    const { error } = await sb.from('bibliothek').insert({ user_id: currentUser.id, buch_id: buchId, zustand, uebergabe_art, notiz: notiz || null });
    if (error) { showToast(error.message.includes('unique') ? 'Dieses Buch ist bereits in deiner Bibliothek' : t('toast_error'), 'error'); return; }
    showToast(t('toast_added'), 'success');
    await runMatchAlgorithm(currentUser.id, buchId, 'neu_angebot');
  } else {
    const { error } = await sb.from('wunschliste').insert({ user_id: currentUser.id, buch_id: buchId });
    if (error) { showToast(error.message.includes('unique') ? 'Dieses Buch ist bereits auf deiner Wunschliste' : t('toast_error'), 'error'); return; }
    showToast(t('toast_wish_added'), 'success');
    await runMatchAlgorithm(currentUser.id, buchId, 'neu_wunsch');
  }

  closeModal('addBookModal');
  loadMyBooks();
}

async function deleteBook(bibliothekId) {
  if (!confirm('Buch wirklich entfernen?')) return;
  await sb.from('bibliothek').update({ aktiv: false }).eq('id', bibliothekId);
  showToast(t('toast_deleted'));
  loadMyBooks();
}

async function removeWish(wunschId) {
  await sb.from('wunschliste').delete().eq('id', wunschId);
  showToast(t('toast_deleted'));
  loadWishlist();
}

async function addToWishlist(buchId) {
  if (!currentUser) { showToast(t('toast_login_required'), 'error'); return; }
  const { error } = await sb.from('wunschliste').insert({ user_id: currentUser.id, buch_id: buchId });
  if (error) { showToast('Bereits auf der Wunschliste', 'error'); return; }
  showToast(t('toast_wish_added'), 'success');
}

// ── MATCH ALGORITHM ───────────────────────────────────────
async function runMatchAlgorithm(userId, buchId, typ) {
  if (typ === 'neu_angebot') {
    // Mein neues Buch – suche wer es auf der Wunschliste hat
    const { data: wuensche } = await sb.from('wunschliste').select('user_id').eq('buch_id', buchId).neq('user_id', userId);
    if (!wuensche || wuensche.length === 0) return;

    const { data: meinBib } = await sb.from('bibliothek').select('id').eq('user_id', userId).eq('buch_id', buchId).single();
    if (!meinBib) return;

    for (const w of wuensche) {
      // Prüfe ob er auch etwas anbietet das ich will
      const { data: meinWunsch } = await sb.from('wunschliste').select('buch_id').eq('user_id', userId);
      const meineWuenscheIds = (meinWunsch || []).map(x => x.buch_id);

      const { data: seinAngebot } = await sb.from('bibliothek').select('id, buch_id').eq('user_id', w.user_id).eq('aktiv', true).in('buch_id', meineWuenscheIds.length > 0 ? meineWuenscheIds : ['none']);

      if (seinAngebot && seinAngebot.length > 0) {
        // Perfekter Match!
        for (const sa of seinAngebot) {
          await sb.from('matches').upsert({
            user_a_id: userId, user_b_id: w.user_id,
            buch_a_id: meinBib.id, buch_b_id: sa.id,
            match_typ: 'direkt'
          }, { onConflict: 'buch_a_id,buch_b_id' });
        }
      } else {
        // Punkte-Match – er kann mit Punkten zahlen
        const { data: bibEntry } = await sb.from('bibliothek').select('id').eq('user_id', w.user_id).eq('aktiv', true).limit(1).single();
        if (bibEntry) {
          await sb.from('matches').upsert({
            user_a_id: userId, user_b_id: w.user_id,
            buch_a_id: meinBib.id, buch_b_id: bibEntry.id,
            match_typ: 'punkte'
          }, { onConflict: 'buch_a_id,buch_b_id' });
        }
      }
    }
  }
}

// ── MATCHES ───────────────────────────────────────────────
async function loadMatches() {
  if (!currentUser) return;
  const el = document.getElementById('matchesList');
  el.innerHTML = '<div class="loading-spinner"></div>';

  const { data } = await sb.from('matches')
    .select(`*, 
      buch_a:buch_a_id(*, buecher(*)),
      buch_b:buch_b_id(*, buecher(*)),
      user_a:user_a_id(username, plz, ort),
      user_b:user_b_id(username, plz, ort)`)
    .or(`user_a_id.eq.${currentUser.id},user_b_id.eq.${currentUser.id}`)
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🎯</div><h3>${t('no_matches')}</h3><p>${t('no_matches_sub')}</p></div>`;
    return;
  }

  el.innerHTML = data.map(m => {
    const isA = m.user_a_id === currentUser.id;
    const meinBuch = isA ? m.buch_a : m.buch_b;
    const seinBuch = isA ? m.buch_b : m.buch_a;
    const partner = isA ? m.user_b : m.user_a;
    const typeLabel = m.match_typ === 'direkt' ? t('match_perfekt') : t('match_punkte');
    const typeClass = m.match_typ === 'direkt' ? 'perfekt' : 'punkte';

    return `
      <div class="match-card ${typeClass}">
        <div>
          <div class="match-type-badge ${typeClass}">${typeLabel}</div>
          <div class="match-distance">👤 @${partner?.username || '?'} ${partner?.ort ? '· ' + partner.ort : ''}</div>
        </div>
        <div class="match-books">
          <div class="match-book">
            <div class="book-title">📤 ${meinBuch?.buecher?.titel || '?'}</div>
            <div class="book-author">${meinBuch?.buecher?.autor || ''}</div>
          </div>
          <div class="match-arrow">⇄</div>
          <div class="match-book">
            <div class="book-title">📥 ${seinBuch?.buecher?.titel || '?'}</div>
            <div class="book-author">${seinBuch?.buecher?.autor || ''}</div>
          </div>
        </div>
        <div class="match-actions">
          <button class="btn-primary btn-sm" onclick="requestTausch('${seinBuch?.id}')">🔄 ${t('tausch_anfragen')}</button>
        </div>
      </div>`;
  }).join('');
}

// ── TAUSCH ────────────────────────────────────────────────
async function requestTausch(zielBibliothekId) {
  if (!currentUser) { showToast(t('toast_login_required'), 'error'); return; }
  showToast('Tausch-Funktion kommt bald! 🚀');
}

// ── DEPONIE ───────────────────────────────────────────────
async function loadDeponieStandorte() {
  const el = document.getElementById('deponieList');
  el.innerHTML = '<div class="loading-spinner"></div>';
  const { data } = await sb.from('deponie_standorte').select('*').eq('aktiv', true).order('ort');
  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🗺️</div><p>${t('deponie_empty')}</p></div>`;
    return;
  }
  const typIcons = { bibliothek: '📚', cafe: '☕', buchhandlung: '🏪', andere: '📍' };
  el.innerHTML = data.map(d => `
    <div class="deponie-card">
      <div class="deponie-typ">${typIcons[d.typ] || '📍'} ${d.typ}</div>
      <h3>${d.name}</h3>
      <p>${d.adresse}, ${d.plz} ${d.ort}</p>
    </div>`).join('');
}

// ── NACHRICHTEN ───────────────────────────────────────────
async function loadConversations() {
  if (!currentUser) return;
  const el = document.getElementById('conversationsList');
  el.innerHTML = '<div class="loading-spinner"></div>';
  const { data } = await sb.from('tausch_anfragen')
    .select('*, von_user:von_user_id(username), an_user:an_user_id(username)')
    .or(`von_user_id.eq.${currentUser.id},an_user_id.eq.${currentUser.id}`)
    .order('created_at', { ascending: false });

  if (!data || data.length === 0) {
    el.innerHTML = '<div style="padding:1rem;color:var(--brown-light);font-size:0.875rem;">Keine Konversationen</div>';
    return;
  }
  el.innerHTML = data.map(t => {
    const partner = t.von_user_id === currentUser.id ? t.an_user : t.von_user;
    return `<div class="conversation-item" onclick="openConversation('${t.id}', '${partner?.username}')">
      <div class="conv-name">@${partner?.username || '?'}</div>
      <div class="conv-preview">${t.status}</div>
    </div>`;
  }).join('');
}

async function openConversation(tauschId, partnerName) {
  currentConversationId = tauschId;
  document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
  event?.target?.closest('.conversation-item')?.classList.add('active');

  const thread = document.getElementById('messageThread');
  thread.innerHTML = `
    <div style="padding:1rem;border-bottom:1px solid var(--border);font-weight:500;">💬 @${partnerName}</div>
    <div class="messages-list" id="messagesList"></div>
    <div class="message-input-wrap">
      <input class="message-input" id="msgInput" placeholder="${t('message_placeholder')}" onkeydown="if(event.key==='Enter')sendMessage()" />
      <button class="btn-send" onclick="sendMessage()">➤</button>
    </div>`;

  const { data: msgs } = await sb.from('nachrichten')
    .select('*, von_user:von_user_id(username)')
    .eq('tausch_id', tauschId)
    .order('created_at', { ascending: true });

  const msgList = document.getElementById('messagesList');
  if (!msgs || msgs.length === 0) {
    msgList.innerHTML = '<div style="text-align:center;color:var(--brown-light);padding:2rem;font-size:0.875rem;">Noch keine Nachrichten. Schreibe die erste!</div>';
    return;
  }
  msgList.innerHTML = msgs.map(m => `
    <div class="message ${m.von_user_id === currentUser.id ? 'mine' : 'theirs'}">
      <div class="message-bubble">${m.inhalt}</div>
      <div class="message-time">${new Date(m.created_at).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>`).join('');
  msgList.scrollTop = msgList.scrollHeight;
}

async function sendMessage() {
  if (!currentConversationId) return;
  const input = document.getElementById('msgInput');
  const inhalt = input.value.trim();
  if (!inhalt) return;
  input.value = '';
  await sb.from('nachrichten').insert({ tausch_id: currentConversationId, von_user_id: currentUser.id, inhalt });
  const tauschId = currentConversationId;
  const { data: partner } = await sb.from('tausch_anfragen').select('von_user_id, an_user_id').eq('id', tauschId).single();
  if (partner) {
    const partnerUserId = partner.von_user_id === currentUser.id ? partner.an_user_id : partner.von_user_id;
    const partnerName = partnerUserId === partner.von_user_id ? '' : '';
    openConversation(tauschId, partnerName);
  }
}

// ── PROFIL ────────────────────────────────────────────────
async function loadProfile() {
  if (!currentUser) return;
  const profile = currentProfile || await loadCurrentProfile();
  if (!profile) return;
  document.getElementById('profilUsername').value = profile.username || '';
  document.getElementById('profilVorname').value = profile.full_name || '';
  document.getElementById('profilPlz').value = profile.plz || '';
  document.getElementById('profilOrt').value = profile.ort || '';
  document.getElementById('profilPunkte').textContent = profile.punkte || 0;
  document.getElementById('profilAvatar').textContent = (profile.username || 'U')[0].toUpperCase();
  if (document.getElementById('profilSprache')) {
    document.getElementById('profilSprache').value = profile.sprache || 'de';
  }
}

async function saveProfile() {
  if (!currentUser) return;
  const username = document.getElementById('profilUsername').value.trim();
  const full_name = document.getElementById('profilVorname').value.trim();
  const plz = document.getElementById('profilPlz').value.trim();
  const ort = document.getElementById('profilOrt').value.trim();
  const sprache = document.getElementById('profilSprache')?.value || 'de';

  const { error } = await sb.from('profiles').update({ username, full_name, plz, ort, sprache }).eq('id', currentUser.id);
  if (error) { showToast(t('toast_error'), 'error'); return; }
  currentProfile = { ...currentProfile, username, full_name, plz, ort, sprache };
  showToast(t('toast_saved'), 'success');
  updateNavAuth();
  setLang(sprache);
}

// ── BENACHRICHTIGUNGEN ────────────────────────────────────
async function checkNotifications() {
  if (!currentUser) return;
  const { count } = await sb.from('benachrichtigungen').select('id', { count: 'exact', head: true }).eq('user_id', currentUser.id).eq('gelesen', false);
  const badge = document.getElementById('notifBadge');
  if (count && count > 0) { badge.textContent = count; badge.style.display = 'flex'; }
  else { badge.style.display = 'none'; }
}

async function loadNotifications() {
  if (!currentUser) return;
  const el = document.getElementById('notifList');
  el.innerHTML = '<div class="loading-spinner"></div>';
  const { data } = await sb.from('benachrichtigungen').select('*').eq('user_id', currentUser.id).order('created_at', { ascending: false }).limit(20);

  // Mark all as read
  await sb.from('benachrichtigungen').update({ gelesen: true }).eq('user_id', currentUser.id).eq('gelesen', false);
  document.getElementById('notifBadge').style.display = 'none';

  if (!data || data.length === 0) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🔔</div><p>${t('notif_empty')}</p></div>`;
    return;
  }
  const icons = { match_gefunden: '🎯', tausch_anfrage: '🔄', tausch_akzeptiert: '✅', tausch_abgelehnt: '❌', nachricht: '💬', punkte_erhalten: '🪙' };
  el.innerHTML = data.map(n => `
    <div class="notif-item ${n.gelesen ? '' : 'unread'}">
      <div class="notif-icon">${icons[n.typ] || '🔔'}</div>
      <div class="notif-body">
        <div class="notif-title">${n['titel_' + currentLang] || n.titel_de}</div>
        <div class="notif-text">${n['inhalt_' + currentLang] || n.inhalt_de || ''}</div>
      </div>
      <div class="notif-time">${new Date(n.created_at).toLocaleDateString('de-CH')}</div>
    </div>`).join('');
}

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  setTimeout(() => { el.className = 'toast'; }, 3000);
}

// ── INIT ──────────────────────────────────────────────────
(async () => {
  setLang('de');
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) {
    currentUser = session.user;
    await loadCurrentProfile();
    updateNavAuth();
    checkNotifications();
  }
  showPage('home');
})();
