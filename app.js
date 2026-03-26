// --- CONFIGURAÇÃO SUPABASE ---
// Usamos window.supabaseClient como fonte única da verdade para evitar conflitos de variáveis.
if (!window.supabaseClient) {
    const url = 'https://cvqzsshhgzxmhbmafrui.supabase.co';
    const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cXpzc2hoZ3p4bWhibWFmcnVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MDg2NjQsImV4cCI6MjA4OTk4NDY2NH0.Oqwzivjw9g7rcaJieZNHAw2dKwbQRLQhfWbD0WknxF8';
    if (window.supabase) {
        window.supabaseClient = window.supabase.createClient(url, key);
    }
}

var sb = window.supabaseClient;


// --- CONFIGURAÇÃO DO ESTADO ---
var state = {
    user: null,
    points: 0,
    level: 'Iniciante',
    rankingPosition: 150,
    activities: [
        { id: 1, category: 'Módulo Primeiros Passos', text: 'Ler as regras do desafio', pts: 10, completed: false },
        { id: 2, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Base - Escritura x Matrícula', pts: 10, completed: false },
        { id: 3, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Princípios Essenciais', pts: 10, completed: false },
        { id: 4, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Princípios Fundamentais', pts: 10, completed: false },
        { id: 5, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Primeiros Passos', pts: 10, completed: false },
        { id: 6, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Aplicação prática', pts: 10, completed: false },
        { id: 7, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Método - Linha do Tempo', pts: 10, completed: false },
        { id: 8, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Identificação documentos', pts: 10, completed: false },
        { id: 9, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Transcrições', pts: 10, completed: false },
        { id: 10, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Transmissão de propriedade', pts: 10, completed: false },
        { id: 11, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Posse x Propriedade', pts: 10, completed: false },
        { id: 12, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Usufruto', pts: 10, completed: false },
        { id: 13, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Regularizações frequentes', pts: 10, completed: false },
        { id: 14, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Retificação de área', pts: 10, completed: false },
        { id: 15, category: 'Módulo Primeiros Passos', text: 'Assistir a aula: Desmembramento', pts: 10, completed: false },

        { id: 16, category: 'Presença Digital', text: 'CRIAR perfil do INSTAGRAM', pts: 20, completed: false },
        { id: 17, category: 'Presença Digital', text: 'BOA FOTO DE PERFIL', pts: 20, completed: false },
        { id: 18, category: 'Presença Digital', text: 'DESCRIÇÃO NA BIO', pts: 20, completed: false },
        { id: 19, category: 'Presença Digital', text: 'CTA WHATSAPP', pts: 20, completed: false },
        { id: 20, category: 'Presença Digital', text: 'WHATSAPP PROFISSIONAL', pts: 60, completed: false },
        { id: 21, category: 'Presença Digital', text: 'GOOGLE MEU NEGÓCIO', pts: 120, completed: false },

        { id: 22, category: 'Análise Documental', text: 'CONSEGUIR UM CASO', pts: 120, completed: false },
        { id: 23, category: 'Análise Documental', text: 'JUNTAR DOCUMENTAÇÃO', pts: 120, completed: false },
        { id: 24, category: 'Análise Documental', text: 'MONTAR LINHA DO TEMPO', pts: 120, completed: false },

        { id: 25, category: 'Análise do Caso Concreto', text: 'IDENTIFICAR IRREGULARIDADES', pts: 120, completed: false },
        { id: 26, category: 'Análise do Caso Concreto', text: 'COMO RESOLVER AS IRREGULARIDADES', pts: 120, completed: false },

        { id: 27, category: 'Prospecção Ativa', text: 'REELS 1', pts: 60, completed: false },
        { id: 28, category: 'Prospecção Ativa', text: 'REELS 2', pts: 60, completed: false },
        { id: 29, category: 'Prospecção Ativa', text: 'REELS 3', pts: 60, completed: false },
        { id: 30, category: 'Prospecção Ativa', text: 'REELS 4', pts: 60, completed: false },
        { id: 31, category: 'Prospecção Ativa', text: 'REELS 5', pts: 60, completed: false },
        { id: 32, category: 'Prospecção Ativa', text: 'BOCA A BOCA SEGUNDA', pts: 60, completed: false },
        { id: 33, category: 'Prospecção Ativa', text: 'BOCA A BOCA TERÇA', pts: 60, completed: false },
        { id: 34, category: 'Prospecção Ativa', text: 'BOCA A BOCA QUARTA', pts: 60, completed: false },
        { id: 35, category: 'Prospecção Ativa', text: 'BOCA A BOCA QUINTA', pts: 60, completed: false },
        { id: 36, category: 'Prospecção Ativa', text: 'BOCA A BOCA SEXTA', pts: 60, completed: false },

        { id: 37, category: 'Faturamento Total (selecione apenas uma das opções)', text: 'FATURAMENTO TOTAL ATÉ R$ 2.000', pts: 1000, completed: false, milestone: true },
        { id: 38, category: 'Faturamento Total (selecione apenas uma das opções)', text: 'FATURAMENTO TOTAL ATÉ R$ 5.000', pts: 2000, completed: false, milestone: true },
        { id: 39, category: 'Faturamento Total (selecione apenas uma das opções)', text: 'FATURAMENTO TOTAL ATÉ R$ 10.000', pts: 4000, completed: false, milestone: true },
        { id: 40, category: 'Faturamento Total (selecione apenas uma das opções)', text: 'FATURAMENTO TOTAL ATÉ R$ 25.000', pts: 8000, completed: false, milestone: true },
        { id: 41, category: 'Faturamento Total (selecione apenas uma das opções)', text: 'FATURAMENTO TOTAL ATÉ R$ 50.000', pts: 12000, completed: false, milestone: true },
        { id: 42, category: 'Resultado', text: 'DEPOIMENTOS CLIENTES', pts: 500, completed: false, milestone: true }
    ],
    muralPosts: [],
    communityTopics: [],
    servicosPosts: [],
    isModerator: false,
    allUsers: []
};

var LEVELS = ['PARAQUEDISTA', 'Posicionado', 'Investigador', 'Analista', 'Desenrolado', 'expert'];

function calculateRank(pts) {
    if (pts > 1610) return 'expert';
    if (pts > 1010) return 'Desenrolado';
    if (pts > 770) return 'Analista';
    if (pts > 410) return 'Investigador';
    if (pts > 150) return 'Posicionado';
    return 'PARAQUEDISTA';
}

function getUserRankBadge(emailOrName) {
    let pts = 0;
    if (state.user && (state.user.email === emailOrName || state.user.name === emailOrName)) {
        pts = state.points;
    } else {
        const u = state.allUsers.find(x => x.email === emailOrName || x.name === emailOrName);
        if (u && u.points !== undefined) pts = u.points;
    }
    const rank = calculateRank(pts);
    return `<span class="rank-badge rank-${rank.toLowerCase()}">${rank}</span>`;
}

function formatPoints(pts) {
    return Number(pts || 0).toLocaleString('pt-BR');
}

function animatePoints(elementId, start, end, duration = 1000) {
    const obj = document.getElementById(elementId);
    if (!obj) return;
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        obj.textContent = `${formatPoints(current)} pts`;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    console.log('Acta Members: DOM pronto.');
    init();
});

function init() {
    loadState();
    setupEventListeners();
    refreshIcons();
    
    // Check Supabase session instead of localStorage
    checkSession();
    setupRealtime();
}

async function checkSession() {
    console.log('Acta Members: Verificando sessão...');
    if (!sb) { console.error('Supabase não disponível no checkSession'); return; }

    const { data: { session }, error } = await sb.auth.getSession();
    console.log('Acta Members: Sessão encontrada?', !!session, error || '');

    if (session) {
        console.log('Acta Members: Sessão ativa, chamando showMainApp...');
        showMainApp();
    }

    sb.auth.onAuthStateChange((event, session) => {
        console.log('Acta Members: Auth State Change:', event, !!session);
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
            showMainApp();
        } else if (event === 'SIGNED_OUT') {
            document.getElementById('main-layout').classList.remove('active');
            document.getElementById('login-view').classList.add('active');
        }
    });
}

// --- AUTH SCREEN SWITCHER (global so onclick links work immediately) ---
window.appSwitchAuthTab = (tab) => {
    ['login', 'signup', 'forgot'].forEach(t => {
        const el = document.getElementById(`auth-${t}`);
        if (el) el.style.display = t === tab ? 'block' : 'none';
    });
};

function setupRealtime() {
    // Escutar mudanças no Mural
    sb
        .channel('public:mural_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'mural_posts' }, async () => {
            const { data } = await sb.from('mural_posts').select('*').order('created_at', { ascending: false });
            state.muralPosts = data || [];
            if (document.getElementById('mural-view').classList.contains('active')) renderMural();
        })
        .subscribe();

    // Escutar mudanças na Comunidade (Tópicos)
    sb
        .channel('public:community_topics')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_topics' }, async () => {
            const { data } = await sb.from('community_topics').select('*').order('created_at', { ascending: false });
            state.communityTopics = data || [];
            if (document.getElementById('community-view').classList.contains('active')) {
                const searchInput = document.getElementById('community-search');
                renderCommunity(state.currentTheme || null, searchInput ? searchInput.value : null);
            }
        })
        .subscribe();

    // Escutar mudanças na Comunidade (Respostas)
    sb
        .channel('public:community_replies')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'community_replies' }, async (payload) => {
            if (state.currentTopicId) {
                // If the user is currently looking at a topic, we might need to re-render it
                if (payload.new && payload.new.topic_id === state.currentTopicId) {
                    window.appShowTopic(state.currentTopicId);
                }
            }
        })
        .subscribe();

    // ESCUTAR MUDANÇAS NO RANKING (Tabela users)
    sb
        .channel('public:users')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, async () => {
            const { data } = await sb.from('users').select('*');
            state.allUsers = data || [];
            updateLevel();
            updateGlobalUI();
            if (document.getElementById('ranking-view').classList.contains('active')) renderRanking();
            if (document.getElementById('users-view').classList.contains('active')) renderUsers();
        })
        .subscribe();
    // Escutar mudanças nos Serviços (Anúncios)
    sb
        .channel('public:servicos_posts')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'servicos_posts' }, async () => {
            const { data } = await sb.from('servicos_posts').select('*').order('created_at', { ascending: false });
            state.servicosPosts = data || [];
            if (document.getElementById('servicos-view').classList.contains('active')) {
                const searchInput = document.getElementById('servicos-search-input');
                renderServicos(searchInput ? searchInput.value : '');
            }
        })
        .subscribe();

    // Escutar mudanças nos Serviços (Respostas)
    sb
        .channel('public:servicos_replies')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'servicos_replies' }, async () => {
            if (document.getElementById('servicos-view').classList.contains('active')) {
                const searchInput = document.getElementById('servicos-search-input');
                renderServicos(searchInput ? searchInput.value : '');
            }
        })
        .subscribe();
}

function setupEventListeners() {

    // --- LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-btn');
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;
            const errorEl = document.getElementById('login-error');
            errorEl.textContent = '';

            if (!sb) {
                errorEl.textContent = 'Erro: serviço indisponível. Recarregue a página.';
                return;
            }

            try {
                window.appSetButtonLoading(btn, true);
                const { error } = await sb.auth.signInWithPassword({ email, password });
                window.appSetButtonLoading(btn, false);
                if (error) {
                    errorEl.textContent = (error.message.includes('Invalid login') || error.message.includes('invalid_credentials'))
                        ? 'E-mail ou senha incorretos.'
                        : error.message;
                }
            } catch(err) {
                window.appSetButtonLoading(btn, false);
                errorEl.textContent = 'Erro inesperado: ' + err.message;
                console.error('Login error:', err);
            }
        };
    }

    // --- CADASTRO ---
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('signup-btn');
            const name = document.getElementById('signup-name').value.trim();
            const email = document.getElementById('signup-email').value.trim().toLowerCase();
            const password = document.getElementById('signup-password').value;
            const errorEl = document.getElementById('signup-error');
            errorEl.style.color = '#FF3B30';
            errorEl.textContent = '';

            if (!name || !email || !password) {
                errorEl.textContent = 'Preencha todos os campos.';
                return;
            }
            if (password.length < 6) {
                errorEl.textContent = 'A senha deve ter no mínimo 6 caracteres.';
                return;
            }
            if (!sb) {
                errorEl.textContent = 'Erro: serviço indisponível. Recarregue a página.';
                return;
            }

            try {
                window.appSetButtonLoading(btn, true);
                const { data, error } = await sb.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } }
                });
                window.appSetButtonLoading(btn, false);

                console.log('SignUp result:', data, error);

                if (error) {
                    errorEl.textContent = error.message.includes('already registered')
                        ? 'Este e-mail já está cadastrado. Tente fazer login.'
                        : error.message;
                } else {
                    errorEl.style.color = 'var(--gold)';
                    errorEl.textContent = '✓ Conta criada com sucesso! Faça login agora.';
                    setTimeout(() => window.appSwitchAuthTab('login'), 2000);
                }
            } catch(err) {
                window.appSetButtonLoading(btn, false);
                errorEl.textContent = 'Erro inesperado: ' + err.message;
                console.error('Signup error:', err);
            }
        };
    }

    // --- ESQUECI A SENHA ---
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
        forgotForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('forgot-btn');
            const email = document.getElementById('forgot-email').value.trim().toLowerCase();
            const errorEl = document.getElementById('forgot-error');
            const successEl = document.getElementById('forgot-success');
            errorEl.textContent = '';
            successEl.textContent = '';

            window.appSetButtonLoading(btn, true);
            const { error } = await sb.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + window.location.pathname
            });
            window.appSetButtonLoading(btn, false);

            if (error) {
                errorEl.textContent = error.message;
            } else {
                successEl.textContent = '✓ Link de recuperação enviado para o seu e-mail!';
            }
        };
    }

    // --- LOGOUT ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await sb.auth.signOut();
            localStorage.clear();
            location.reload();
        };
    }

    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(item => {
        item.onclick = () => {
            const viewName = item.getAttribute('data-view');
            switchSubView(viewName);
        };
    });
}


// --- NAVEGAÇÃO ---
async function showMainApp() {
    console.log('Acta Members: Iniciando showMainApp...');
    try {
        if (!sb) return;
        const { data: { user }, error: userError } = await sb.auth.getUser();
        if (userError || !user) {
            console.error('Erro ao obter usuário auth:', userError);
            return;
        }

        const ownerEmail = 'charlesnunes77@yahoo.com.br'.toLowerCase();
        const userEmail = user.email.toLowerCase();
        const isOwner = userEmail === ownerEmail; // Estritamente logado como dono
        
        // 1. SET BASIC STATE AND SHOW MAIN UI IMMEDIATELY
        localStorage.setItem('userEmail', userEmail);
        localStorage.setItem('isLoggedIn', 'true'); // For recovery

        state.user = { 
            email: userEmail, 
            name: user.user_metadata.full_name || userEmail.split('@')[0], 
            isModerator: isOwner 
        };
        console.log('Acta Members: Admin Status:', isOwner);

        document.getElementById('login-view').classList.remove('active');
        document.getElementById('main-layout').classList.add('active');

        // 2. FORCE ADMIN TAB VISIBILITY BEFORE DB CALLS
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = isOwner ? (el.tagName === 'LI' ? 'flex' : 'block') : 'none';
        });

        updateGlobalUI();
        switchSubView('dashboard');

        // 3. BACKGROUND: FETCH DB PROFILE (NON-BLOCKING)
        (async () => {
            try {
                // Fetch ALL Users for Ranking
                const { data: allUsers } = await sb.from('users').select('*');
                if (allUsers) {
                    state.allUsers = allUsers;
                    renderRanking();
                    renderUsers();
                }

                // Fetch or Create My Profile
                let profile = state.allUsers.find(u => u.email === user.email);
                if (!profile) {
                    const { data } = await sb.from('users').select('*').eq('email', user.email).maybeSingle();
                    profile = data;
                }

                if (profile) {
                    state.user.name = profile.name || state.user.name;
                    // Auto-fix Visual: Se o dono estiver como "Aluno" no banco, força Administrador no App
                    if (isOwner && profile.role !== 'Administrador') {
                        profile.role = 'Administrador';
                        console.log('Acta Members: Forçando cargo de Administrador para o Dono.');
                        // Tenta corrigir no banco (pode falhar por RLS, mas o UI fica certo)
                        sb.from('users').update({ role: 'Administrador' }).eq('email', user.email).then();
                    }
                    state.user.isModerator = profile.role === 'Administrador' || isOwner;
                    state.points = profile.points || 0;
                    const completedIds = profile.completed_activities || [];
                    state.activities.forEach(a => { a.completed = completedIds.includes(a.id); });
                } else {
                    console.log('Acta Members: Criando novo perfil para', user.email);
                    const newProfile = {
                        id: user.id,
                        email: user.email,
                        name: state.user.name || userEmail.split('@')[0],
                        profession: 'Estudante',
                        joined_date: new Date().toLocaleDateString('pt-BR'),
                        role: isOwner ? 'Administrador' : 'Aluno',
                        points: 0,
                        completed_activities: []
                    };
                    
                    try {
                        let { data: created, error: upsertError } = await sb.from('users').upsert(newProfile, { onConflict: 'email' }).select().maybeSingle();
                        
                        // FALLBACK: Se falhar (ex: RLS bloqueando 'Administrador'), tenta criar como 'Aluno'
                        if (upsertError && isOwner) {
                            console.warn('Acta Members: Falha ao criar como Admin (RLS?). Tentando como Aluno...');
                            newProfile.role = 'Aluno';
                            const fallback = await sb.from('users').upsert(newProfile, { onConflict: 'email' }).select().maybeSingle();
                            created = fallback.data;
                            if (fallback.error) console.error('Acta Members: Falha total na criação do perfil:', fallback.error);
                        }

                        if (created) {
                            state.points = created.points || 0;
                            if (!state.allUsers.find(u => u.email === created.email)) state.allUsers.push(created);
                            console.log('Acta Members: Perfil sincronizado com sucesso.');
                        } else {
                            console.warn('Acta Members: Perfil não foi retornado pelo banco (sem erro crítico).');
                        }
                    } catch (upsertCatch) {
                        console.error('Acta Members: Exceção no upsert:', upsertCatch);
                    }
                }
                updateLevel();
                updateGlobalUI();
                renderProgress();
            } catch (err) {
                console.warn('Erro ao carregar dados do banco:', err);
            }
        })();

    } catch (e) {
        console.error('Falha crítica no showMainApp:', e);
    }
}

function updateGlobalUI() {
    const greeting = document.getElementById('greeting-text');
    const headerPoints = document.getElementById('header-points');
    const user = state.allUsers.find(u => u.email === state.user.email) || {};

    if (greeting) {
        let photoHtml = user.photo ? `<img src="${user.photo}" class="topbar-avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 10px; vertical-align: middle;">` : `<div class="topbar-avatar-placeholder" style="width: 32px; height: 32px; border-radius: 50%; background: var(--gold); color: black; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-weight: bold; font-size: 14px; vertical-align: middle;">${state.user.name.charAt(0).toUpperCase()}</div>`;
        greeting.innerHTML = `<div style="display: flex; align-items: center;">
            ${photoHtml}
            <div style="display: flex; flex-direction: column; line-height: 1.2;">
                <span>Olá, ${state.user.name}!</span>
                ${getUserRankBadge(state.user.email)}
            </div>
        </div>`;
    }
    if (headerPoints) {
        // We only animate if the value actually changed and it's not the initial load
        const currentVal = parseInt(headerPoints.textContent.replace(/\./g, '')) || 0;
        if (currentVal !== state.points) {
            animatePoints('header-points', currentVal, state.points);
        } else {
            headerPoints.textContent = `${formatPoints(state.points)} pts`;
        }
    }
}

function switchSubView(viewId) {
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(nav => {
        if (nav.getAttribute('data-view') === viewId) {
            nav.classList.add('active');
        } else {
            nav.classList.remove('active');
        }
    });

    document.querySelectorAll('.sub-view').forEach(view => {
        if (view.id === `${viewId}-view`) {
            view.classList.add('active');
        } else {
            view.classList.remove('active');
        }
    });

    renderContent(viewId);
}

function renderContent(viewId) {
    switch (viewId) {
        case 'dashboard': renderDashboard(); break;
        case 'progress': renderProgress(); break;
        case 'ranking': renderRanking(); break;
        case 'community': renderCommunity(); break;
        case 'servicos': renderServicos(); break;
        case 'mural': renderMural(); break;
        case 'users': renderUsers(); break;
        case 'perfil': renderPerfil(); break;
    }
    refreshIcons();
}

// --- COMPONENTES ---

function renderDashboard() {
    const nextLevel = LEVELS[LEVELS.indexOf(state.level) + 1] || 'Limites Alcançados';
    
    let progressPercent = 0;
    if (state.points <= 1610) {
        progressPercent = (state.points / 1610) * 85; 
    } else {
        progressPercent = 85 + Math.min(13, ((state.points - 1610) / 15000) * 13);
    }

    const dash = document.getElementById('dashboard-view');
    if (!dash) return;

    dash.innerHTML = `
        <div class="view-header">
            <h2>Bem-vindo à sua Evolução</h2>
            <p>“Você está evoluindo na regularização de imóveis. Continue.”</p>
        </div>
        <div class="dashboard-grid">
            <div class="card gold-border">
                <div class="card-title">Nível Atual</div>
                <div class="stat-value" style="font-size: 1.8rem; color: var(--gold);">${state.level}</div>
                <div class="progress-info">Objetivo: ${nextLevel}</div>
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${progressPercent}%"></div>
                </div>
            </div>
            <div class="card">
                <div class="card-title">Sua Pontuação</div>
                <div class="stat-value" id="dash-points">${formatPoints(state.points)}</div>
                <p>Acumule pontos marcando seu progresso.</p>
            </div>
            <div class="card">
                <div class="card-title">Posição no Ranking</div>
                <div class="stat-value">#${state.rankingPosition}</div>
                <p>Mantenha a constância para subir!</p>
            </div>
        </div>
        <div class="card" style="margin-top: 20px; text-align: center; border-top: 5px solid var(--gold);">
            <h3>Pronto para registrar mais um passo?</h3>
            <button class="btn btn-primary" style="margin-top: 15px;" onclick="window.appShowProgress()">Marcar Meu Progresso</button>
        </div>
    `;
}
window.appShowProgress = () => switchSubView('progress');

function renderProgress() {
    const categories = ['Módulo Primeiros Passos', 'Presença Digital', 'Análise Documental', 'Análise do Caso Concreto', 'Prospecção Ativa', 'Faturamento Total (selecione apenas uma das opções)', 'Resultado'];
    const view = document.getElementById('progress-view');
    if (!view) return;

    let html = `
        <div class="view-header">
            <h2>Meu Progresso</h2>
            <p>Marque aqui as atividades que você concluiu.</p>
        </div>
        <div class="activity-card">
    `;

    categories.forEach(cat => {
        html += `
            <div class="category-group">
                <div class="category-title">${cat}</div>
                <div class="activity-list">
                    ${state.activities.filter(a => a.category === cat).map(a => `
                        <div class="activity-item ${a.completed ? 'completed' : ''}" onclick="window.appToggleActivity(${a.id})">
                            <div class="check-box">
                                ${a.completed ? '✓' : ''}
                            </div>
                            <div class="activity-text">${a.text}</div>
                            <div class="activity-pts">+${a.pts}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    });

    html += `</div>`;
    view.innerHTML = html;
}

var EXCLUSIVE_CATEGORY = 'Faturamento Total (selecione apenas uma das opções)';

window.appToggleActivity = (id) => {
    const act = state.activities.find(a => a.id === id);
    if (!act) return;

    // If this is an exclusive category item being turned ON, deselect all others first
    if (!act.completed && act.category === EXCLUSIVE_CATEGORY) {
        state.activities
            .filter(a => a.category === EXCLUSIVE_CATEGORY && a.completed && a.id !== id)
            .forEach(a => {
                a.completed = false;
                state.points -= a.pts;
            });
    }

    act.completed = !act.completed;
    state.points += act.completed ? act.pts : -act.pts;
    
    if (act.completed && act.milestone) triggerConfetti();
    
    updateLevel();
    saveState();
    updateGlobalUI();
    
    const dashPoints = document.getElementById('dash-points');
    if (dashPoints) {
        const currentVal = parseInt(dashPoints.textContent.replace(/\./g, '')) || 0;
        animatePoints('dash-points', currentVal, state.points);
    }
    
    renderProgress();
    renderRanking(); // Keep ranking position in sync after activity/points change
};

async function saveState() {
    if (!state.user || !state.user.email) return;
    try {
        const u = state.allUsers.find(x => x.email === state.user.email);
        const completedIds = state.activities.filter(a => a.completed).map(a => a.id);
        
        // Sempre salva LocalStorage como fallback
        const localData = {
            points: state.points,
            completed_activities: completedIds
        };
        if (u) {
            localData.name = u.name;
            localData.profession = u.profession;
            localData.phone = u.phone;
            localData.city = u.city;
            localData.photo = u.photo;
        }
        localStorage.setItem(`progress_${state.user.email}`, JSON.stringify(localData));

        if (u) {
            const { error } = await sb.from('users').update({ 
                points: state.points, completed_activities: completedIds,
                name: u.name, profession: u.profession, phone: u.phone, city: u.city, photo: u.photo
            }).eq('email', state.user.email);
            if (error) {
                if (state.user.email === 'charlesnunes77@yahoo.com.br') {
                    console.error('ERRO SUPABASE: Seu usuário Auth perdeu o vínculo com a tabela users.', error);
                    window.appShowToast('Erro de Permissão (RLS). Veja o aviso que mandei no chat.', 'error');
                }
                throw error;
            }
        } else {
            const { error } = await sb.from('users').update({ 
                points: state.points, completed_activities: completedIds
            }).eq('email', state.user.email);
            if (error) throw error;
        }
    } catch (e) {
        console.error('Erro ao salvar no servidor (usando cache local):', e);
    }
}

function loadState() {
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        const cached = localStorage.getItem(`progress_${userEmail}`);
        if (cached) {
            try {
                const data = JSON.parse(cached);
                state.points = data.points || 0;
                const completedIds = data.completed_activities || [];
                state.activities.forEach(a => {
                    a.completed = completedIds.includes(a.id);
                });
                // Recuperar perfil do cache
                if (data.profession !== undefined || data.city !== undefined) {
                    let u = state.allUsers.find(x => x.email === userEmail);
                    if (!u) {
                        u = { email: userEmail };
                        state.allUsers.push(u);
                    }
                    if (data.name) u.name = data.name;
                    if (data.profession) u.profession = data.profession;
                    if (data.phone) u.phone = data.phone;
                    if (data.city) u.city = data.city;
                    if (data.photo) u.photo = data.photo;
                }
            } catch(e) {}
        }
    }
}

function renderRanking() {
    const view = document.getElementById('ranking-view');
    if (!view) return;

    // O ranking utiliza state.allUsers que já é sincronizado com o Supabase no init() e no setupRealtime()
    const rankingList = [...state.allUsers];
    if (state.user && !rankingList.find(x => x.email === state.user.email)) {
        rankingList.push({ name: state.user.name, email: state.user.email, points: state.points });
    }
    if (rankingList.length === 0) {
        view.innerHTML = `<div class="view-header"><h2>Ranking Geral</h2></div><div class="card"><p style="color:var(--text-muted);text-align:center;padding:40px">Nenhum aluno no ranking ainda.</p></div>`;
        return;
    }
    rankingList.sort((a, b) => (b.points || 0) - (a.points || 0));

    const getTrophy = (index) => {
        if (index === 0) return ' 🏆'; // Ouro
        if (index === 1) return ' 🥈'; // Prata
        if (index === 2) return ' 🥉'; // Bronze
        return '';
    };

    view.innerHTML = `
        <div class="view-header"><h2>Ranking Geral</h2></div>
        <div class="card" style="padding: 0; overflow: hidden;">
            <div class="table-container">
                <table class="premium-table" style="width: 100%; text-align: left; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <th style="padding: 15px 20px;">Pos</th>
                            <th style="padding: 15px 20px;">Aluno</th>
                            <th style="padding: 15px 20px;">Pontos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rankingList.map((u, i) => {
                            const isMe = state.user && u.email === state.user.email;
                            const rowStyle = isMe ? 'background: rgba(212, 175, 55, 0.1); border-left: 4px solid var(--gold); border-bottom: 1px solid rgba(255,255,255,0.05);' : 'border-bottom: 1px solid rgba(255,255,255,0.05);';
                            const nameHtml = isMe ? `<strong>Você</strong> (${u.name})` : u.name;
                            return `
                                <tr style="${rowStyle}">
                                    <td style="padding: 15px 20px; font-weight: 700; color: ${i < 3 ? 'var(--white)' : 'var(--text-muted)'};">${i + 1}º</td>
                                    <td style="padding: 15px 20px;">
                                        <div style="font-size: 1.05rem; display: flex; align-items: center; gap: 8px;">
                                            ${nameHtml}${getTrophy(i)}
                                        </div>
                                        <div style="margin-top: 5px;">${getUserRankBadge(u.email)}</div>
                                    </td>
                                    <td style="padding: 15px 20px; font-size: 1.2rem; font-weight: 800; color: var(--gold);">${formatPoints(u.points)}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

async function renderCommunity(selectedTheme = null, searchQuery = null) {
    const tabs = ['Usucapião', 'Construção', 'Venda e Compra', 'Judiciais', 'Documentação', 'Dúvidas Gerais'];
    const view = document.getElementById('community-view');
    if (!view) return;

    state.currentTheme = selectedTheme;
    state.currentTopicId = null; // Clear topic being viewed

    // Fetch topics if empty or need refresh
    if (state.communityTopics.length === 0) {
        view.innerHTML = `<div style="text-align:center; padding: 50px; color: var(--gold);">Carregando comunidade...</div>`;
        const { data } = await sb.from('community_topics').select('*').order('created_at', { ascending: false });
        state.communityTopics = data || [];
    }

    let html = `<div class="view-header"><h2>Comunidade por Temas</h2></div>`;
    
    // Search Bar
    html += `
        <div class="search-container">
            <i data-lucide="search" class="search-icon"></i>
            <input type="text" id="community-search" class="search-input" placeholder="Pesquisar por temas ou palavras-chave..." 
                   onkeyup="if(event.key === 'Enter') window.appSearchCommunity(this.value)"
                   value="${searchQuery || ''}">
        </div>
    `;

    // Tabs
    html += `
        <div style="display: flex; gap: 10px; overflow-x: auto; margin-bottom: 20px; padding: 10px 0;">
            ${tabs.map(t => `
                <button class="btn" onclick="renderCommunity('${t}')" style="padding: 10px 20px; font-size: 0.95rem; background: ${selectedTheme === t && !searchQuery ? 'var(--gold)' : 'white'}; color: ${selectedTheme === t && !searchQuery ? 'black' : 'var(--navy-deep)'}; border: 1px solid #DDD; white-space: nowrap; font-weight: ${selectedTheme === t && !searchQuery ? '700' : '500'};">
                    ${t}
                </button>
            `).join('')}
        </div>
    `;

    let filteredTopics = state.communityTopics;
    if (searchQuery) {
        filteredTopics = state.communityTopics.filter(t => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            t.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.theme.toLowerCase().includes(searchQuery.toLowerCase())
        );
    } else if (selectedTheme) {
        filteredTopics = state.communityTopics.filter(t => t.theme === selectedTheme);
    }

    if (searchQuery || selectedTheme) {
        html += `
            <div id="forum-content">
                ${selectedTheme && !searchQuery ? `
                    <div class="forum-form">
                        <h3>Criar Novo Tópico em ${selectedTheme}</h3>
                        <input type="text" id="topic-title" class="input-styled" placeholder="Título da sua dúvida ou conquista">
                        <textarea id="topic-text" class="textarea-styled" placeholder="Descreva em detalhes..."></textarea>
                        <button class="btn btn-primary" onclick="window.appPostTopic('${selectedTheme}', this)">Publicar Tópico</button>
                    </div>
                ` : ''}
                
                ${searchQuery ? `<div style="margin-bottom: 20px; color: var(--gold); font-size: 1.1rem;">Resultados para: <strong>"${searchQuery}"</strong> (${filteredTopics.length})</div>` : ''}

                <div class="topic-list scroll-container">
                    ${filteredTopics.map(t => `
                        <div class="topic-item" onclick="window.appShowTopic(${t.id})">
                            <div class="topic-header">
                                <span style="display: flex; align-items: center; gap: 8px;">[${t.theme}] Por <strong>${t.user_name || 'Desconhecido'}</strong> ${getUserRankBadge(t.user_name || '')}</span>
                                <span>${new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                            <div class="topic-title">${t.title}</div>
                            <div class="topic-meta">
                                <span style="text-decoration: underline;">Ver discussão</span>
                                ${state.user.isModerator ? `<button class="btn-delete" onclick="event.stopPropagation(); window.appDeleteTopic(${t.id})"><i data-lucide="trash-2"></i> Excluir</button>` : ''}
                            </div>
                        </div>
                    `).join('') || '<div class="empty-state"><i data-lucide="message-square-dashed"></i><p>Nenhum tópico encontrado. Seja o primeiro a iniciar uma discussão!</p></div>'}
                </div>
            </div>
        `;
    } else {
        html += `<div class="card"><p style="text-align:center; padding: 40px; color: var(--text-muted);">Selecione um tema acima ou use a busca para interagir com a comunidade.</p></div>`;
    }

    view.innerHTML = html;
    refreshIcons();
}

window.appSearchCommunity = (query) => {
    if (!query) return renderCommunity();
    renderCommunity(null, query);
};

window.appShowTopic = async (topicId) => {
    state.currentTopicId = topicId;
    const topic = state.communityTopics.find(t => t.id === topicId);
    if (!topic) return;

    // Fetch replies for this specific topic
    const { data: replies, error } = await sb
        .from('community_replies')
        .select('*')
        .eq('topic_id', topicId)
        .order('created_at', { ascending: true });

    const view = document.getElementById('community-view');
    view.innerHTML = `
        <div class="view-header"><h2>Discussão</h2></div>
        <button class="back-btn" onclick="renderCommunity('${topic.theme}')">← Voltar para ${topic.theme}</button>
        
        <div class="card" style="border-left: 5px solid var(--gold); margin-bottom: 30px;">
            <div class="topic-header" style="display: flex; align-items: center; gap: 8px;">
                <strong>${topic.user_name}</strong> ${getUserRankBadge(topic.user_name)} • ${new Date(topic.created_at).toLocaleDateString('pt-BR')}
            </div>
            <h1 style="color: var(--white); margin: 15px 0;">${topic.title}</h1>
            <p style="font-size: 1.1rem; line-height: 1.8;">${topic.text}</p>
        </div>

        <h3>Respostas (${replies ? replies.length : 0})</h3>
        <div class="replies-list" style="margin: 20px 0;">
            ${(replies && replies.length > 0) ? replies.map(r => `
                <div class="reply-item">
                    <div class="topic-header" style="margin-bottom: 10px; display: flex; align-items: center; gap: 8px;">
                        <strong>${r.user_name}</strong> ${getUserRankBadge(r.user_name)} • ${new Date(r.created_at).toLocaleDateString('pt-BR')}
                    </div>
                    <p>${r.text}</p>
                    ${(state.user.isModerator || r.user_email === state.user.email) ? `<button class="btn-delete-small" onclick="window.appDeleteReply(${topic.id}, ${r.id})">Excluir</button>` : ''}
                </div>
            `).join('') : '<div class="empty-state" style="padding: 30px;"><i data-lucide="message-circle"></i><p>Nenhuma resposta ainda. Seja o primeiro a ajudar!</p></div>'}
        </div>

        <div class="forum-form" style="margin-top: 40px;">
            <h3>Deixar uma Resposta</h3>
            <textarea id="reply-text" class="textarea-styled" placeholder="Sua resposta..."></textarea>
            <button class="btn btn-primary" onclick="window.appPostReply(${topic.id}, this)">Enviar Resposta</button>
        </div>
    `;
    refreshIcons();
};

window.appPostReply = async (topicId, btn) => {
    const replyEl = document.getElementById('reply-text');
    if (!replyEl.value) {
        window.appShowToast('A resposta não pode estar vazia.', 'error');
        return;
    }

    window.appSetButtonLoading(btn, true);

    const { error } = await sb.from('community_replies').insert({
        topic_id: topicId,
        user_email: state.user.email,
        user_name: state.user.name,
        text: replyEl.value
    });

    if (error) {
        window.appShowToast('Erro ao enviar resposta: ' + error.message, 'error');
    } else {
        window.appShowTopic(topicId);
        window.appShowToast('Resposta enviada!', 'success');
    }
    window.appSetButtonLoading(btn, false);
};

window.appDeleteTopic = async (topicId) => {
    if (!confirm('Deseja realmente excluir este tópico e todas as respostas?')) return;
    const { error } = await sb.from('community_topics').delete().eq('id', topicId);
    if (error) {
        window.appShowToast('Erro ao excluir tópico: ' + error.message, 'error');
    } else {
        window.appShowToast('Tópico excluído.', 'success');
        // Realtime will update the list
    }
};

window.appPostTopic = async (theme, btn) => {
    const titleEl = document.getElementById('topic-title');
    const textEl = document.getElementById('topic-text');
    if (!titleEl || !textEl || !titleEl.value || !textEl.value) {
        window.appShowToast('Por favor, preencha o título e o texto do tópico.', 'error');
        return;
    }

    window.appSetButtonLoading(btn, true);

    const { error } = await sb.from('community_topics').insert({
        theme: theme,
        user_email: state.user.email,
        user_name: state.user.name,
        title: titleEl.value,
        text: textEl.value
    });

    if (error) {
        window.appShowToast('Erro ao criar tópico: ' + error.message, 'error');
    } else {
        renderCommunity(theme);
        window.appShowToast('Tópico criado com sucesso!', 'success');
    }
    window.appSetButtonLoading(btn, false);
};

window.appDeleteReply = async (topicId, replyId) => {
    if (!confirm('Deseja excluir esta resposta?')) return;
    const { error } = await sb.from('community_replies').delete().eq('id', replyId);
    if (error) {
        window.appShowToast('Erro ao excluir resposta: ' + error.message, 'error');
    } else {
        window.appShowTopic(topicId);
        window.appShowToast('Resposta excluída.', 'success');
    }
};

async function renderMural() {
    const view = document.getElementById('mural-view');
    if (!view) return;

    // Fetch posts if they haven't been fetched or are empty
    if (state.muralPosts.length === 0) {
        view.innerHTML = `<div style="text-align:center; padding: 50px; color: var(--gold);">Carregando mural...</div>`;
        const { data } = await sb.from('mural_posts').select('*').order('created_at', { ascending: false });
        state.muralPosts = data || [];
    }

    view.innerHTML = `
        <div class="view-header"><h2>Mural de Conquistas</h2></div>
        
        <div class="mural-form">
            <h3>Postar Minha Conquista</h3>
            <textarea id="mural-text" class="textarea-styled" placeholder="O que você conquistou hoje? Deixe sua mensagem para a comunidade..."></textarea>
            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                <select id="mural-cat" class="input-styled" style="margin-bottom: 0;">
                    <option value="Conquista">Conquista</option>
                    <option value="Faturamento">Faturamento</option>
                    <option value="Regularização">Regularização</option>
                    <option value="Evolução">Evolução</option>
                </select>
                <button class="btn btn-primary" style="white-space: nowrap;" onclick="window.appPostToMural(this)">Publicar no Mural</button>
            </div>
        </div>

        <div class="dashboard-grid">
            ${state.muralPosts.length > 0 ? state.muralPosts.map(p => {
                const hasLiked = p.liked_by && p.liked_by.includes(state.user.email);
                return `
                <div class="card" style="border-top: 3px solid var(--gold); animation: fadeIn 0.5s ease-out;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
                        <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--gold); color: black; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${p.user_name ? p.user_name.charAt(0).toUpperCase() : '?'}</div>
                        <div style="display: flex; flex-direction: column;">
                            <strong>${p.user_name || 'Desconhecido'}</strong>
                            ${getUserRankBadge(p.user_name || '')}
                        </div>
                    </div>
                    <p style="font-size: 1rem; margin: 10px 0; color: #EEE;">${p.text}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                        <button class="btn-like" onclick="window.appToggleMuralLike(${p.id}, this)">
                            <i data-lucide="heart" style="${hasLiked ? 'fill: #FF3B30; color: #FF3B30;' : 'color: var(--text-muted);'}"></i> 
                            <span class="like-count">${p.likes || 0}</span>
                        </button>
                        <div style="font-size: 0.8rem; color: var(--gold); font-weight: 700;">#${p.category}</div>
                        ${(state.user.isModerator || state.user.email === p.user_email) ? `<button class="btn-delete-small" onclick="window.appDeleteMuralPost(${p.id})">Excluir</button>` : ''}
                    </div>
                </div>
                `;
            }).join('') : '<div class="empty-state" style="grid-column: 1 / -1;"><i data-lucide="award"></i><p>O mural está vazio. Compartilhe a primeira conquista da comunidade!</p></div>'}
        </div>
    `;
    refreshIcons();
}

window.appPostToMural = async (btn) => {
    const textEl = document.getElementById('mural-text');
    const catEl = document.getElementById('mural-cat');
    if (!textEl.value) {
        window.appShowToast('Escreva algo para publicar no mural.', 'error');
        return;
    }

    window.appSetButtonLoading(btn, true);

    const { error } = await sb.from('mural_posts').insert({
        user_email: state.user.email,
        user_name: state.user.name,
        text: textEl.value,
        category: catEl.value,
        liked_by: []
    });

    window.appSetButtonLoading(btn, false);

    if (error) {
        window.appShowToast('Erro ao publicar: ' + error.message, 'error');
    } else {
        textEl.value = '';
        window.appShowToast('Conquista publicada com sucesso!', 'success');
        // Realtime will update the list
    }
};

window.appToggleMuralLike = async (postId, btnElement) => {
    const post = state.muralPosts.find(p => p.id === postId);
    if (!post) return;
    
    if (!post.liked_by) post.liked_by = [];
    
    const userEmail = state.user.email;
    const hasLiked = post.liked_by.includes(userEmail);

    let newLikedBy = [];
    if (hasLiked) {
        newLikedBy = post.liked_by.filter(e => e !== userEmail);
    } else {
        newLikedBy = [...post.liked_by, userEmail];
    }

    const { error } = await sb
        .from('mural_posts')
        .update({ 
            liked_by: newLikedBy,
            likes: newLikedBy.length
        })
        .eq('id', postId);

    if (error) {
        window.appShowToast('Erro ao curtir: ' + error.message, 'error');
    }
};

window.appDeleteMuralPost = async (postId) => {
    if (!confirm('Deseja excluir esta postagem do mural?')) return;
    const { error } = await sb.from('mural_posts').delete().eq('id', postId);
    if (error) {
        window.appShowToast('Erro ao excluir: ' + error.message, 'error');
    } else {
        window.appShowToast('Postagem excluída.', 'success');
    }
};

// --- SERVIÇOS ---

async function renderServicos(searchQuery = '') {
    const view = document.getElementById('servicos-view');
    if (!view) return;

    const currentUserEmail = state.user.email;
    const isMod = state.user.isModerator;

    // Fetch posts and replies
    if (state.servicosPosts.length === 0) {
        view.innerHTML = `<div style="text-align:center; padding: 50px; color: var(--gold);">Carregando serviços...</div>`;
    }
    const { data: posts } = await sb.from('servicos_posts').select('*').order('created_at', { ascending: false });
    const { data: allReplies } = await sb.from('servicos_replies').select('*').order('created_at', { ascending: true });
    
    state.servicosPosts = posts || [];
    const servicosReplies = allReplies || [];

    const filteredPosts = state.servicosPosts.filter(p => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return p.city.toLowerCase().includes(q) || p.need.toLowerCase().includes(q);
    });

    view.innerHTML = `
        <div class="view-header">
            <h2>Espaço de Serviços e Parcerias</h2>
            <p>Conecte-se com outros alunos para prestação de serviços ou contratações.</p>
        </div>

        <div class="search-container" style="max-width: 600px; margin: 0 auto 30px auto;">
            <i data-lucide="search" class="search-icon"></i>
            <input type="text" id="servicos-search-input" class="search-input" placeholder="Buscar por cidade ou palavra-chave..." 
                   value="${searchQuery}" onkeyup="if(event.key === 'Enter') window.appSearchServicos()">
        </div>
        
        <div class="servico-form">
            <h3>Anunciar Parceria / Serviço</h3>
            <div class="form-grid">
                <input type="text" id="servico-city" class="input-styled" placeholder="Cidade / Estado">
                <input type="text" id="servico-need" class="input-styled" placeholder="O que você precisa? (Ex: Parceria para regularização)">
            </div>
            <button class="btn btn-primary" onclick="window.appPostServico(this)">Publicar Anúncio</button>
        </div>

        <div class="servicos-list">
            ${filteredPosts.length > 0 ? filteredPosts.map(p => {
                const isOwner = p.user_email === currentUserEmail;
                const canManage = isOwner || isMod;
                const postReplies = servicosReplies.filter(r => r.post_id === p.id);
                const userPhoto = state.allUsers.find(u => u.email === p.user_email)?.photo;

                return `
                <div class="card servico-card ${p.finalized ? 'status-finalized' : ''}">
                    <div class="servico-card-header">
                        <div class="user-info" style="display: flex; align-items: center; gap: 10px;">
                            ${userPhoto ? `<img src="${userPhoto}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">` : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--gold); color: black; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${p.user_name ? p.user_name.charAt(0).toUpperCase() : '?'}</div>`}
                            <div>
                                <div style="display: flex; align-items: center; gap: 8px;"><strong>${p.user_name}</strong> ${getUserRankBadge(p.user_name)}</div>
                                <span class="servico-date" style="display: block;">${new Date(p.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                        </div>
                        <div class="servico-status-badge ${p.finalized ? 'finalized' : 'active'}">
                            ${p.finalized ? 'Finalizado' : 'Ativo'}
                        </div>
                    </div>
                    
                    <div class="servico-content">
                        <div class="servico-location">
                            <i data-lucide="map-pin"></i> <span>${p.city}</span>
                        </div>
                        <div class="servico-need-text">${p.need}</div>
                    </div>

                    <div class="servico-actions">
                        ${isOwner ? `
                            <button class="btn-action-small ${p.finalized ? 'btn-reactivate' : 'btn-finalize'}" onclick="window.appToggleServicoStatus(${p.id})">
                                <i data-lucide="${p.finalized ? 'rotate-ccw' : 'check-circle'}"></i> ${p.finalized ? 'Reativar' : 'Marcar como Finalizado'}
                            </button>
                        ` : ''}
                        
                        ${canManage ? `
                            <button class="btn-delete-small" onclick="window.appAskDeleteServico(${p.id})">
                                <i data-lucide="trash-2"></i> Excluir
                            </button>
                        ` : ''}
                    </div>

                    <div class="servico-comments">
                        <h4>Respostas / Contatos</h4>
                        <div class="comments-list">
                            ${postReplies.length > 0 ? postReplies.map(r => `
                                <div class="comment-item">
                                    <div class="comment-header" style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                                        <strong>${r.user_name}</strong> ${getUserRankBadge(r.user_name)} • ${new Date(r.created_at).toLocaleDateString('pt-BR')}
                                        ${(r.user_email === currentUserEmail || isMod) ? `<button class="btn-delete-x" onclick="window.appAskDeleteServicoComment(${p.id}, ${r.id})">&times;</button>` : ''}
                                    </div>
                                    <p>${r.text}</p>
                                </div>
                            `).join('') : '<div class="empty-state" style="padding: 20px;"><i data-lucide="message-square"></i><p>Nenhum contato ainda.</p></div>'}
                        </div>
                        <div class="comment-input-area">
                            <input type="text" id="comment-input-${p.id}" class="comment-input" placeholder="Responder ou deixar contato...">
                            <button class="btn-send-comment" onclick="window.appPostServicoComment(${p.id}, this)"><i data-lucide="send"></i></button>
                        </div>
                    </div>
                </div>
                `;
            }).join('') : '<div class="empty-state"><i data-lucide="briefcase"></i><p>Nenhum serviço ou parceria anunciada ainda. Poste sua necessidade acima!</p></div>'}
        </div>
    `;
    refreshIcons();
}

window.appPostServico = async (btn) => {
    const cityEl = document.getElementById('servico-city');
    const needEl = document.getElementById('servico-need');
    
    if (!cityEl.value || !needEl.value) {
        window.appShowToast('Por favor, preencha a cidade e a necessidade.', 'error');
        return;
    }

    window.appSetButtonLoading(btn, true);

    const { error } = await sb.from('servicos_posts').insert({
        user_email: state.user.email,
        user_name: state.user.name,
        city: cityEl.value,
        need: needEl.value
    });

    if (error) {
        window.appShowToast('Erro ao publicar: ' + error.message, 'error');
    } else {
        cityEl.value = '';
        needEl.value = '';
        renderServicos();
        window.appShowToast('Anúncio publicado com sucesso!', 'success');
    }
    window.appSetButtonLoading(btn, false);
};

window.appSearchServicos = () => {
    const input = document.getElementById('servicos-search-input');
    renderServicos(input ? input.value : '');
};

window.appAskDeleteServico = (id) => {
    appShowModal('Confirmar Exclusão', '<p>Deseja realmente excluir este anúncio de serviço?</p>', async () => {
        const { error } = await sb.from('servicos_posts').delete().eq('id', id);
        if (error) {
            window.appShowToast('Erro ao excluir: ' + error.message, 'error');
        } else {
            renderServicos();
            window.appShowToast('Anúncio excluído.', 'success');
        }
        appCloseModal();
    });
};

window.appDeleteServico = (id) => {
    const numericId = Number(id);
    state.servicosPosts = state.servicosPosts.filter(p => p.id !== numericId);
    saveState();
    renderServicos();
};

window.appToggleServicoStatus = async (id) => {
    const post = state.servicosPosts.find(p => p.id === id);
    if (post) {
        const { error } = await sb.from('servicos_posts').update({ finalized: !post.finalized }).eq('id', id);
        if (error) {
            window.appShowToast('Erro ao atualizar status: ' + error.message, 'error');
        } else {
            renderServicos();
        }
    }
};

window.appPostServicoComment = async (postId, btn) => {
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input || !input.value) {
        window.appShowToast('Escreva algo para responder.', 'error');
        return;
    }

    window.appSetButtonLoading(btn, true, '<i data-lucide="send"></i>');

    const { error } = await sb.from('servicos_replies').insert({
        post_id: postId,
        user_email: state.user.email,
        user_name: state.user.name,
        text: input.value
    });

    if (error) {
        window.appShowToast('Erro ao enviar contato: ' + error.message, 'error');
    } else {
        input.value = '';
        renderServicos();
        window.appShowToast('Contato enviado!', 'success');
    }
    window.appSetButtonLoading(btn, false);
};

window.appAskDeleteServicoComment = (postId, commentId) => {
    appShowModal('Excluir Comentário', '<p>Deseja remover este comentário de contato?</p>', async () => {
        const { error } = await sb.from('servicos_replies').delete().eq('id', commentId);
        if (error) {
            window.appShowToast('Erro ao excluir: ' + error.message, 'error');
        } else {
            renderServicos();
            window.appShowToast('Comentário removido.', 'success');
        }
        appCloseModal();
    });
};

window.appDeleteServicoComment = (postId, commentId) => {
    const post = state.servicosPosts.find(p => p.id === Number(postId));
    if (post) {
        post.replies = post.replies.filter(r => r.id !== Number(commentId));
        saveState();
        renderServicos();
    }
};

// --- AUXILIARES ---
function refreshIcons() {
    if (window.lucide) {
        try { lucide.createIcons(); } catch (e) {}
    }
}

function updateLevel() {
    const oldLevel = state.level;
    state.level = calculateRank(state.points);
    
    if (oldLevel && oldLevel !== state.level) {
        const levelsAsc = ['PARAQUEDISTA', 'Posicionado', 'Investigador', 'Analista', 'Desenrolado', 'expert'];
        if (levelsAsc.indexOf(state.level) > levelsAsc.indexOf(oldLevel)) {
            triggerConfetti();
        }
    }

    if (state.user) {
        const u = state.allUsers.find(x => x.email === state.user.email);
        if (u) u.points = state.points;
        
        const rankingList = [...state.allUsers];
        if (!rankingList.find(x => x.email === state.user.email)) {
            rankingList.push({ email: state.user.email, points: state.points });
        }
        rankingList.sort((a, b) => (b.points || 0) - (a.points || 0));
        const userIndex = rankingList.findIndex(x => x.email === state.user.email);
        if (userIndex !== -1) {
            state.rankingPosition = userIndex + 1;
        }
    }
}

function triggerConfetti() {
    if (window.confetti) {
        try {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#D4AF37', '#1A1A1A'] });
            window.appShowToast('Parabéns por essa conquista!', 'success');
        } catch (e) {}
    } else {
        window.appShowToast('Parabéns por essa conquista!', 'success');
    }
}

// saveState foi unificado e movido para cima
// loadState está definido acima também

function renderUsers() {
    const view = document.getElementById('users-view');
    if (!view) return;

    view.innerHTML = `
        <div class="view-header">
            <h2>Gestão de Usuários</h2>
            <p>Administre quem tem acesso e modifique profissões.</p>
        </div>
        
        <div class="card" style="padding: 0; overflow: hidden;">
            <div class="table-container">
                <table class="premium-table">
                    <thead>
                        <tr>
                            <th>Nome / E-mail</th>
                        <th>Cargo</th>
                        <th>Profissão</th>
                        <th>Telefone</th>
                        <th>Cidade / Endereço</th>
                        <th>Membro desde</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.allUsers.map(u => `
                        <tr class="${u.isBlocked ? 'row-blocked' : ''}">
                            <td>
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    ${u.photo ? `<img src="${u.photo}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">` : `<div style="width: 36px; height: 36px; border-radius: 50%; background: var(--gold); color: black; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${u.name.charAt(0).toUpperCase()}</div>`}
                                    <div>
                                        <strong>${u.name}</strong> ${u.email === state.user.email ? '<span class="badge-me">Você</span>' : ''}
                                        <div style="margin-top: 4px;">${getUserRankBadge(u.email)}</div>
                                        <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">${u.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <span class="badge-role ${u.role === 'Administrador' ? 'role-admin' : 'role-aluno'}">${u.role || 'Aluno'}</span>
                                <button class="btn-edit-small" onclick="window.appToggleUserRole('${u.email}')"><i data-lucide="refresh-cw"></i></button>
                            </td>
                            <td>
                                <span class="prof-label">${u.profession}</span>
                                <button class="btn-edit-small" onclick="window.appChangeProfession('${u.email}')"><i data-lucide="edit-3"></i></button>
                            </td>
                            <td>${u.phone || '-'}</td>
                            <td>
                                <div>${u.city || '-'}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${u.address || '-'}</div>
                            </td>
                            <td>${u.joined_date || '-'}</td>
                            <td>
                                <span class="status-indicator ${u.isBlocked ? 'status-blocked' : 'status-active'}">
                                    ${u.isBlocked ? 'Bloqueado' : 'Ativo'}
                                </span>
                            </td>
                            <td>
                                <button class="btn-action ${u.isBlocked ? 'btn-unblock' : 'btn-block-user'}" 
                                        onclick="window.appToggleUserBlock('${u.email}')"
                                        ${u.email === state.user.email ? 'disabled style="opacity: 0.3; cursor: not-allowed;"' : ''}>
                                    ${u.isBlocked ? 'Desbloquear' : 'Bloquear'}
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
                </table>
            </div>
        </div>
    `;
    refreshIcons();
}

// --- PERFIL ---
function renderPerfil() {
    const view = document.getElementById('perfil-view');
    if (!view) return;

    const user = state.allUsers.find(u => u.email === state.user.email) || {};

    view.innerHTML = `
        <div class="view-header">
            <h2>Meu Perfil</h2>
            <p>Atualize suas informações de contato para se conectar com outros alunos.</p>
        </div>
        
        <div class="card" style="max-width: 600px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="width: 100px; height: 100px; border-radius: 50%; background: #1A1A1A; margin: 0 auto 15px auto; overflow: hidden; border: 2px solid var(--gold); display: flex; align-items: center; justify-content: center;">
                    ${user.photo ? `<img src="${user.photo}" id="perfil-photo-preview" style="width: 100%; height: 100%; object-fit: cover;">` : `<i data-lucide="user" id="perfil-photo-icon" style="width: 40px; height: 40px; color: var(--gold);"></i><img src="" id="perfil-photo-preview" style="width: 100%; height: 100%; object-fit: cover; display: none;">`}
                </div>
                <label for="perfil-photo-upload" class="btn btn-secondary" style="padding: 8px 15px; font-size: 0.9rem; cursor: pointer; border: 1px solid var(--gold); color: var(--gold); border-radius: 6px;">Alterar Foto</label>
                <input type="file" id="perfil-photo-upload" accept="image/*" style="display: none;" onchange="window.appPreviewPhoto(event)">
                <input type="hidden" id="perfil-photo-base64" value="${user.photo || ''}">
            </div>
            
            <div class="form-grid" style="grid-template-columns: 1fr; gap: 20px;">
                <div>
                    <label style="color: var(--gold); display: block; margin-bottom: 5px;">Nome Completo</label>
                    <input type="text" id="perfil-name" class="input-styled" value="${user.name || state.user.name}" readonly style="opacity: 0.7;">
                </div>
                <div>
                    <label style="color: var(--gold); display: block; margin-bottom: 5px;">E-mail</label>
                    <input type="text" id="perfil-email" class="input-styled" value="${state.user.email}" readonly style="opacity: 0.7;">
                </div>
                <div>
                    <label style="color: var(--gold); display: block; margin-bottom: 5px;">Profissão / Cargo Atual</label>
                    <input type="text" id="perfil-prof" class="input-styled" value="${user.profession || ''}" placeholder="Ex: Advogado, Corretor...">
                </div>
                <div>
                    <label style="color: var(--gold); display: block; margin-bottom: 5px;">Telefone / WhatsApp</label>
                    <input type="text" id="perfil-phone" class="input-styled" value="${user.phone || ''}" placeholder="(XX) XXXXX-XXXX">
                </div>
                <div>
                    <label style="color: var(--gold); display: block; margin-bottom: 5px;">Cidade / Estado</label>
                    <input type="text" id="perfil-city" class="input-styled" value="${user.city || ''}" placeholder="São Paulo - SP">
                </div>
                
                <button class="btn btn-primary" style="margin-top: 10px;" onclick="window.appSavePerfil(this)">
                    Salvar Informações
                </button>
            </div>
        </div>
    `;
    refreshIcons();
}

window.appPreviewPhoto = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;
            document.getElementById('perfil-photo-base64').value = result;
            const preview = document.getElementById('perfil-photo-preview');
            preview.src = result;
            preview.style.display = 'block';
            const icon = document.getElementById('perfil-photo-icon');
            if (icon) icon.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
};

window.appSavePerfil = async (btn) => {
    window.appSetButtonLoading(btn, true);

    const prof = document.getElementById('perfil-prof').value;
    const phone = document.getElementById('perfil-phone').value;
    const city = document.getElementById('perfil-city').value;
    const photo = document.getElementById('perfil-photo-base64').value;

    // Atualizar no state global local primeiro para feedback rápido
    const userIndex = state.allUsers.findIndex(u => u.email === state.user.email);
    if (userIndex !== -1) {
        state.allUsers[userIndex].profession = prof;
        state.allUsers[userIndex].phone = phone;
        state.allUsers[userIndex].city = city;
        state.allUsers[userIndex].photo = photo;
    }

    await saveState();
    updateGlobalUI(); 
    window.appShowToast('Perfil atualizado com sucesso!', 'success');
    window.appSetButtonLoading(btn, false);
};

window.appChangeProfession = (email) => {
    const user = state.allUsers.find(u => u.email === email);
    if (!user) return;
    
    const body = `
        <p>Altere a profissão de <strong>${user.name}</strong>:</p>
        <input type="text" id="new-profession-input" class="modal-input" value="${user.profession}">
    `;
    
    appShowModal('Editar Profissão', body, () => {
        const newVal = document.getElementById('new-profession-input').value;
        if (newVal) {
            user.profession = newVal;
            saveState();
            renderUsers();
            appCloseModal();
        }
    });
};

window.appToggleUserRole = (email) => {
    const user = state.allUsers.find(u => u.email === email);
    if (!user || user.email === state.user.email) return;
    
    const newRole = user.role === 'Administrador' ? 'Aluno' : 'Administrador';
    const body = `<p>Deseja mudar o cargo de <strong>${user.name}</strong> para <strong>${newRole}</strong>?</p>`;
    
    appShowModal('Alterar Cargo', body, () => {
        user.role = newRole;
        saveState();
        renderUsers();
        appCloseModal();
    });
};

window.appToggleUserBlock = (email) => {
    const user = state.allUsers.find(u => u.email === email);
    if (!user || user.email === state.user.email) return;
    
    const action = user.isBlocked ? 'desbloquear' : 'bloquear';
    const body = `<p>Tem certeza que deseja <strong>${action}</strong> o acesso de <strong>${user.name}</strong>?</p>`;
    
    appShowModal('Confirmar Ação', body, () => {
        user.isBlocked = !user.isBlocked;
        saveState();
        renderUsers();
        appCloseModal();
    });
};

// Helpers para Modal Customizado
function appShowModal(title, contentHtml, onConfirm) {
    const modal = document.getElementById('custom-modal');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-body').innerHTML = contentHtml;
    
    const confirmBtn = document.getElementById('modal-confirm-btn');
    // Remover listeners antigos clonando o botão
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    newConfirmBtn.onclick = onConfirm;
    
    modal.classList.add('active');
}

window.appCloseModal = () => {
    const modal = document.getElementById('custom-modal');
    modal.classList.remove('active');
};

// UI Helpers
window.appShowToast = (message, type = 'success') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconName = type === 'success' ? 'check-circle' : (type === 'error' ? 'alert-circle' : 'info');
    
    toast.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <div style="flex: 1; font-weight: 500;">${message}</div>
    `;
    
    container.appendChild(toast);
    refreshIcons();
    
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        toast.classList.add('removing');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, { once: true });
    }, 4000);
};

window.appSetButtonLoading = (btnNode, isLoading, originalText = '') => {
    if (!btnNode) return;
    if (isLoading) {
        btnNode.dataset.originalText = originalText || btnNode.innerHTML;
        btnNode.innerHTML = `<i data-lucide="loader" class="spin"></i> Processando...`;
        btnNode.style.pointerEvents = 'none';
        btnNode.style.opacity = '0.8';
        refreshIcons();
    } else {
        btnNode.innerHTML = btnNode.dataset.originalText;
        btnNode.style.pointerEvents = 'auto';
        btnNode.style.opacity = '1';
    }
};



