// Utilitários globais para o Controle de Pontos Familiar

// Classe para gerenciar requisições à API
class API {
    static baseURL = '/api';

    static getToken() {
        return localStorage.getItem('token');
    }

    static async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Adicionar token de autenticação se disponível
        const token = this.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error('Erro na API:', error);
            throw error;
        }
    }

    static get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    static post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    static put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    static delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static clearToken() {
        localStorage.removeItem('token');
    }
}

// Classe para gerenciar notificações
class NotificationManager {
    static show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const icon = this.getIcon(type);
        const color = this.getColor(type);
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; padding: 16px;">
                <div style="flex-shrink: 0; margin-right: 12px;">
                    <span style="font-size: 24px;">${icon}</span>
                </div>
                <div style="margin-left: 12px; flex: 1;">
                    <p style="font-size: 14px; font-weight: 500; color: #1f2937;">${message}</p>
                </div>
                <div style="margin-left: 16px; flex-shrink: 0;">
                    <button class="modal-button notification-close" style="padding: 8px;">
                        <span style="display: none;">Fechar</span>
                        <svg style="width: 20px; height: 20px;" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-remover após duração
        setTimeout(() => {
            this.remove(notification);
        }, duration);

        // Botão de fechar
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.remove(notification);
        });

        return notification;
    }

    static remove(notification) {
        if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }

    static getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    static getColor(type) {
        const colors = {
            success: 'green',
            error: 'red',
            warning: 'yellow',
            info: 'blue'
        };
        return colors[type] || colors.info;
    }
}

// Classe para gerenciar modais
class ModalManager {
    static show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    static hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }

    static hideAll() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
        document.body.style.overflow = 'auto';
    }
}

// Classe para gerenciar autenticação
class AuthManager {
    static isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    static getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        API.clearToken();
        window.location.href = '/';
    }

    static async checkAuth() {
        const protectedPages = ['/dashboard', '/manage-points', '/child-view', '/kids', '/kid-area', '/communication'];
        const currentPath = window.location.pathname;
        
        if (protectedPages.includes(currentPath)) {
            if (!this.isAuthenticated()) {
                window.location.href = '/';
                return false;
            }
            
            try {
                const response = await API.get('/auth/verify');
                if (!response.success) {
                    this.logout();
                    window.location.href = '/';
                    return false;
                }
            } catch (error) {
                this.logout();
                window.location.href = '/';
                return false;
            }
        }
        
        return true;
    }
}

// Classe para gerenciar loading
class LoadingManager {
    static show(element) {
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        element.appendChild(spinner);
        element.disabled = true;
    }

    static hide(element) {
        const spinner = element.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
        element.disabled = false;
    }
}

// Classe para formatação de dados
class Formatter {
    static formatDate(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    }

    static formatDateTime(date) {
        return new Date(date).toLocaleString('pt-BR');
    }

    static formatPoints(points) {
        return points.toLocaleString('pt-BR');
    }

    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    static formatPercentage(value) {
        return `${Math.round(value)}%`;
    }

    static formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    }
}

// Classe para validação
class Validator {
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static isValidPassword(password) {
        return password.length >= 6;
    }

    static isValidName(name) {
        return name.trim().length >= 2;
    }

    static isValidAge(age) {
        return age >= 1 && age <= 18;
    }

    static isValidPoints(points) {
        return points >= 1 && points <= 100;
    }
}

// Classe para gerenciar localStorage
class StorageManager {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    }

    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return defaultValue;
        }
    }

    static remove(key) {
        localStorage.removeItem(key);
    }

    static clear() {
        localStorage.clear();
    }
}

// Classe para navegação
class NavigationManager {
    static navigateTo(url) {
        window.location.href = url;
    }

    static goBack() {
        window.history.back();
    }

    static reload() {
        window.location.reload();
    }
}

// Função para mostrar notificação (mantida para compatibilidade, mas agora usa toasts)
function showNotification(title, message, type = 'info') {
    // Redirecionar para o sistema de toast
    if (typeof showToast === 'function') {
        showToast(title, message, type);
    } else {
        console.log('showNotification chamada:', { title, message, type }); // Debug
    }
}

// Função para formatar data
function formatDate(date) {
    return Formatter.formatDate(date);
}

// Função para formatar pontos
function formatPoints(points) {
    return Formatter.formatPoints(points);
}

// Função para verificar autenticação
function checkAuth() {
    return AuthManager.checkAuth();
}

// Função para logout
function logout() {
    AuthManager.logout();
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação em páginas protegidas
    const protectedPages = ['/dashboard', '/child-view'];
    const currentPath = window.location.pathname;
    
    if (protectedPages.includes(currentPath)) {
        checkAuth();
    }

    // Carregar nome do usuário em todas as páginas
    loadUserInfo();

    // Configurar listeners globais
    setupGlobalListeners();
});

// Configurar listeners globais
function setupGlobalListeners() {
    // Fechar modais ao clicar fora
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });

    // Fechar notificações ao clicar em ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            ModalManager.hideAll();
        }
    });

    // Interceptar cliques em links de logout
    document.addEventListener('click', function(e) {
        if (e.target.matches('[data-logout]')) {
            e.preventDefault();
            logout();
        }
    });
}

// Exportar classes para uso global
window.API = API;
window.NotificationManager = NotificationManager;
window.ModalManager = ModalManager;
window.AuthManager = AuthManager;
window.LoadingManager = LoadingManager;
window.Formatter = Formatter;
window.Validator = Validator;
window.StorageManager = StorageManager;
window.NavigationManager = NavigationManager;

// Funções específicas para o Dashboard
let kids = [];
let activities = [];
let history = [];

// Carregar dados do dashboard
async function loadDashboardData() {
    try {
        await Promise.all([
            loadKids(),
            loadActivities(),
            loadHistory(),
            loadUserInfo()
        ]);
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        showToast('Erro', 'Erro ao carregar dados do dashboard', 'error');
    }
}

// Carregar crianças
async function loadKids() {
    try {
        const response = await API.get('/kids');
        kids = response.data.kids;
        
        // Verificar qual página está sendo carregada
        const currentPath = window.location.pathname;
        if (currentPath === '/kids') {
            // Página de cadastros - usar renderKidsGrid
            // Aguardar um pouco para garantir que a função esteja disponível
            setTimeout(() => {
                if (typeof renderKidsGrid === 'function') {
                    renderKidsGrid();
                } else {
                    console.warn('renderKidsGrid não está disponível ainda');
                }
            }, 100);
        } else {
            // Dashboard - usar renderKidsCards
            renderKidsCards();
            updateFilterSelects();
        }
    } catch (error) {
        console.error('Erro ao carregar crianças:', error);
    }
}

// Carregar atividades
async function loadActivities() {
    try {
        const response = await API.get('/activities');
        activities = response.data.activities;
        
        // Verificar qual página está sendo carregada
        const currentPath = window.location.pathname;
        if (currentPath === '/kids') {
            // Página de cadastros - usar renderActivitiesList
            // Aguardar um pouco para garantir que a função esteja disponível
            setTimeout(() => {
                if (typeof renderActivitiesList === 'function') {
                    renderActivitiesList();
                } else {
                    console.warn('renderActivitiesList não está disponível ainda');
                }
            }, 100);
        }
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
    }
}

// Carregar histórico
async function loadHistory() {
    try {
        const response = await API.get('/points/history');
        history = response.data.history;
        renderHistoryTable();
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
    }
}

// Carregar informações do usuário
async function loadUserInfo() {
    try {
        const user = AuthManager.getUser();
        const userNameElement = document.getElementById('user-name');
        
        if (user && userNameElement) {
            userNameElement.textContent = user.name;
        }
    } catch (error) {
        console.error('Erro ao carregar informações do usuário:', error);
    }
}

// Renderizar cards de crianças
function renderKidsCards() {
    const cardsContainer = document.getElementById('kids-points-cards');
    if (!cardsContainer) return;

    if (kids.length === 0) {
        cardsContainer.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="text-6xl mb-4">👶</div>
                <h3 class="text-xl font-semibold text-gray-700 mb-2">Nenhuma criança cadastrada</h3>
                <p class="text-gray-500">Cadastre crianças na área de Cadastros para começar a acompanhar os pontos</p>
            </div>
        `;
        return;
    }

    cardsContainer.innerHTML = kids.map(kid => {
        const totalPoints = kid.totalPoints ?? 0;
        const moneyValue = (totalPoints * 0.10).toFixed(2); // 10 centavos por ponto
        const level = Math.floor(totalPoints / 100) + 1;
        const progressInLevel = totalPoints % 100;
        const progressPercentage = Math.min(100, (progressInLevel / 100) * 100);
        
        // Determinar status baseado no valor em dinheiro
        let statusColor = 'bg-green-100 text-green-800';
        let statusText = 'Excelente!';
        
        if (totalPoints <= 0) {
            statusColor = 'bg-red-100 text-red-800';
            statusText = 'Perda de todos os direitos';
        } else if (moneyValue < 5.00) {
            statusColor = 'bg-yellow-100 text-yellow-800';
            statusText = 'Poucos direitos';
        } else if (moneyValue < 10.00) {
            statusColor = 'bg-green-100 text-green-800';
            statusText = 'Bons direitos';
        }

        // Determinar cores baseadas no status
        let headerColor = '#3B82F6'; // Azul padrão
        let progressColor = '#3B82F6';
        
        if (totalPoints <= 0) {
            headerColor = '#EF4444'; // Vermelho
            progressColor = '#EF4444';
        } else if (moneyValue < 5.00) {
            headerColor = '#F59E0B'; // Amarelo
            progressColor = '#F59E0B';
        } else if (moneyValue < 10.00) {
            headerColor = '#10B981'; // Verde
            progressColor = '#10B981';
        }
        
        return `
            <div class="kid-card">
                <div class="kid-card-header" style="background: linear-gradient(135deg, ${headerColor}, ${progressColor})">
                    <div class="kid-info">
                        <div class="kid-avatar">
                            ${kid.emoji || kid.avatar || kid.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="kid-details">
                            <h3>${kid.name}</h3>
                            <p>${kid.age} anos</p>
                        </div>
                        <div class="kid-points">
                            <div class="points-number">${totalPoints}</div>
                            <div class="points-label">pontos</div>
                        </div>
                    </div>
                </div>
                
                <div class="kid-card-content">
                    <div class="kid-stats">
                        <div class="kid-level">
                            <div class="level-label">Valor em Dinheiro</div>
                            <div class="level-number">R$ ${moneyValue}</div>
                        </div>
                        <div class="kid-status">
                            <div class="status-label">Status</div>
                            <span class="status-badge ${statusColor}">
                                ${statusText}
                            </span>
                        </div>
                    </div>
                    
                    <div class="kid-progress">
                        <div class="progress-info">
                            <span>Valor Acumulado</span>
                            <span>R$ ${moneyValue}</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%; background: linear-gradient(90deg, ${progressColor}, ${progressColor})"></div>
                        </div>
                        <div class="progress-text">
                            ${totalPoints} pontos = R$ ${moneyValue} (R$ 0,10 por ponto)
                        </div>
                    </div>
                    
                    <!-- Botões removidos - apenas informações visuais -->
                </div>
                </div>
            </div>
        `;
    }).join('');
}

// Renderizar tabela de histórico
function renderHistoryTable() {
    const cardsContainer = document.getElementById('history-cards');
    const emptyContainer = document.getElementById('history-empty');
    
    if (!cardsContainer || !emptyContainer) return;

    if (history.length === 0) {
        cardsContainer.innerHTML = '';
        emptyContainer.classList.remove('hidden');
        return;
    }

    emptyContainer.classList.add('hidden');
    
    cardsContainer.innerHTML = history.map(entry => {
        // Determinar nome da criança
        const kidName = entry.kidId ? entry.kidId.name : entry.kidName || 'N/A';
        
        // Determinar nome da atividade
        let activityName = 'N/A';
        let activityIcon = '🎯';
        if (entry.activityId && entry.activityId.name) {
            activityName = entry.activityId.name;
            activityIcon = entry.activityId.icon || '🎯';
        } else if (entry.activityName) {
            activityName = entry.activityName;
        } else if (entry.reason) {
            activityName = entry.reason;
            activityIcon = '⭐'; // Ícone para pontos avulsos
        } else {
            activityName = 'Ponto Avulso';
            activityIcon = '⭐'; // Ícone para pontos avulsos
        }
        
        // Determinar pontos com sinal
        const points = entry.points || 0;
        const pointsDisplay = entry.type === 'remove' ? -points : points;
        const isPositive = pointsDisplay >= 0;
        
        // Determinar data
        const date = entry.date ? formatDate(new Date(entry.date)) : 'N/A';
        
        // Determinar observações
        const notes = entry.notes || '-';
        
        return `
            <div class="history-card ${isPositive ? 'positive' : 'negative'}">
                <div class="history-card-content">
                    <div class="history-card-header">
                        <div class="history-activity-info">
                            <div class="history-activity-icon">
                                ${activityIcon}
                            </div>
                            <div class="history-activity-details">
                                <h3>${activityName}</h3>
                                <p>${kidName}</p>
                            </div>
                        </div>
                        
                        <div class="history-points-badge ${isPositive ? 'positive' : 'negative'}">
                            <span>${entry.type === 'add' ? 'Adicionado' : 'Removido'}</span>
                            <span>${pointsDisplay >= 0 ? '+' : ''}${pointsDisplay} pts</span>
                        </div>
                    </div>
                    
                    <div class="history-meta">
                        <div class="history-meta-item">
                            <span>📅</span>
                            <span>${date}</span>
                        </div>
                        <div class="history-meta-item">
                            <span>📝</span>
                            <span>${notes}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Atualizar selects de filtro
function updateFilterSelects() {
    const filterKid = document.getElementById('filter-kid');
    if (filterKid) {
        filterKid.innerHTML = '<option value="">Todas as crianças</option>';
        kids.forEach(kid => {
            filterKid.innerHTML += `<option value="${kid._id}">${kid.name}</option>`;
        });
    }
}

// Aplicar filtros
async function applyFilters() {
    const kidId = document.getElementById('filter-kid')?.value;
    const date = document.getElementById('filter-date')?.value;

    try {
        let url = '/points/history';
        const params = new URLSearchParams();
        
        if (kidId) params.append('kidId', kidId);
        if (date) params.append('date', date);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        console.log('🔎 [PARENT UI] Aplicando filtros:', { url, kidId, date });
        const response = await API.get(url);
        console.log('✅ [PARENT UI] Resposta filtros:', { qtd: response?.data?.history?.length });
        history = response.data.history;
        renderHistoryTable();
    } catch (error) {
        console.error('❌ [PARENT UI] Erro ao aplicar filtros:', error);
        showToast('Erro', 'Erro ao aplicar filtros', 'error');
    }
}

// Atualizar dados
function refreshData() {
    loadDashboardData();
}

// Mostrar modal adicionar criança
function showAddKidModal() {
    const modal = document.getElementById('add-kid-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

// Esconder modal adicionar criança
function hideAddKidModal() {
    const modal = document.getElementById('add-kid-modal');
    if (modal) {
        modal.classList.add('hidden');
        const form = document.getElementById('add-kid-form');
        if (form) form.reset();
    }
}

// Inicializar dashboard se estiver na página
if (window.location.pathname === '/dashboard') {
    document.addEventListener('DOMContentLoaded', async function() {
        // Verificar autenticação primeiro
        const isAuth = await AuthManager.checkAuth();
        if (!isAuth) {
            return; // checkAuth já redireciona se não autenticado
        }
        
        loadDashboardData();

        // Garantir binding do botão Filtrar
        const filterBtn = document.getElementById('apply-filters-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', function(){
                console.log('🟡 [PARENT UI] Listener do botão Filtrar ativo');
            });
        } else {
            console.warn('⚠️ [PARENT UI] Botão Filtrar não encontrado no DOM');
        }
        
        // Event listener para formulário de adicionar criança
        const addKidForm = document.getElementById('add-kid-form');
        if (addKidForm) {
            addKidForm.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(this);
                const data = {
                    name: formData.get('name'),
                    age: parseInt(formData.get('age')),
                    avatar: formData.get('avatar') || null
                };

                try {
                    await API.post('/kids', data);
                    showToast('Sucesso', 'Criança adicionada com sucesso!', 'success');
                    hideAddKidModal();
                    loadKids();
                } catch (error) {
                    showToast('Erro', error.message, 'error');
                }
            });
        }
    });
}

// Funções para a barra de navegação moderna
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

function setActiveNav(navId) {
    // Remover classe active de todos os botões
    const allNavButtons = document.querySelectorAll('.navbar-button');
    const allMobileItems = document.querySelectorAll('.navbar-mobile-item');
    
    allNavButtons.forEach(btn => btn.classList.remove('active'));
    allMobileItems.forEach(item => item.classList.remove('active'));
    
    // Adicionar classe active ao botão selecionado
    const selectedButton = document.getElementById(navId);
    if (selectedButton) {
        selectedButton.classList.add('active');
    }
    
    // Fechar menu mobile após seleção
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
}

// Fechar menu mobile ao clicar fora
document.addEventListener('click', function(e) {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileButton = document.querySelector('.navbar-mobile-button');
    
    if (mobileMenu && !mobileMenu.contains(e.target) && !mobileButton.contains(e.target)) {
        mobileMenu.classList.add('hidden');
    }
});

// Definir navegação ativa baseada na página atual
function setCurrentPageActive() {
    const currentPath = window.location.pathname;
    const navMap = {
        '/dashboard': 'nav-dashboard',
        '/manage-points': 'nav-activities',
        '/kids': 'nav-kids',
        '/communication': 'nav-communication',
        '/settings': 'nav-settings'
    };
    
    const activeNavId = navMap[currentPath];
    if (activeNavId) {
        setActiveNav(activeNavId);
    }
}

// Inicializar navegação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    setCurrentPageActive();
}); 