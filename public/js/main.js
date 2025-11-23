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
        // Garantir que a data seja interpretada como local, sem conversão de fuso horário
        const d = new Date(date);

        // Se a data for uma string no formato YYYY-MM-DD, precisamos tratá-la como local
        if (typeof date === 'string' && date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const [year, month, day] = date.split('-').map(Number);
            const localDate = new Date(year, month - 1, day);
            return localDate.toLocaleDateString('pt-BR');
        }

        return d.toLocaleDateString('pt-BR');
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
document.addEventListener('DOMContentLoaded', function () {
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
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.add('hidden');
        }
    });

    // Fechar notificações ao clicar em ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            ModalManager.hideAll();
        }
    });

    // Interceptar cliques em links de logout
    document.addEventListener('click', function (e) {
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
            loadUserInfo()
        ]);

        // Definir mês corrente como padrão após carregar as crianças
        setCurrentMonthDefault();

        // Carregar histórico com filtros padrão
        await loadHistory();

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
        // Aplicar filtros com os valores atuais dos campos (incluindo mês padrão)
        await applyFilters();
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

        // Determinar status baseado na progressão de pontos (0-500)
        let statusColor, statusText;

        if (totalPoints <= 0) {
            statusColor = 'bg-red-100 text-red-800';
            statusText = 'Perda de todos os direitos';
        } else if (totalPoints < 50) {
            statusColor = 'bg-red-100 text-red-800';
            statusText = 'Crítico - Pouquíssimos direitos';
        } else if (totalPoints < 100) {
            statusColor = 'bg-orange-100 text-orange-800';
            statusText = 'Baixo - Direitos limitados';
        } else if (totalPoints < 200) {
            statusColor = 'bg-yellow-100 text-yellow-800';
            statusText = 'Regular - Alguns direitos';
        } else if (totalPoints < 300) {
            statusColor = 'bg-lime-100 text-lime-800';
            statusText = 'Bom - Bons direitos';
        } else if (totalPoints < 400) {
            statusColor = 'bg-green-100 text-green-800';
            statusText = 'Ótimo - Muitos direitos';
        } else {
            statusColor = 'bg-emerald-100 text-emerald-800';
            statusText = 'Excelente - Todos os direitos!';
        }

        // Sistema de cores progressivo de 0 a 500 pontos
        function getProgressiveColor(points) {
            // Garantir que pontos estejam no range 0-500
            const clampedPoints = Math.max(0, Math.min(500, points));
            const percentage = clampedPoints / 500; // 0 a 1

            if (points <= 0) {
                // Vermelho para pontos negativos ou zero
                return '#DC2626'; // Vermelho forte
            }

            // Progressão de cores:
            // 0-100 pontos: Vermelho para Laranja
            // 100-200 pontos: Laranja para Amarelo
            // 200-300 pontos: Amarelo para Verde Claro
            // 300-400 pontos: Verde Claro para Verde
            // 400-500 pontos: Verde para Verde Escuro

            if (clampedPoints <= 100) {
                // Vermelho (#DC2626) para Laranja (#EA580C)
                const localPercentage = clampedPoints / 100;
                const r = Math.round(220 + (234 - 220) * localPercentage);
                const g = Math.round(38 + (88 - 38) * localPercentage);
                const b = Math.round(38 + (12 - 38) * localPercentage);
                return `rgb(${r}, ${g}, ${b})`;
            } else if (clampedPoints <= 200) {
                // Laranja (#EA580C) para Amarelo (#F59E0B)
                const localPercentage = (clampedPoints - 100) / 100;
                const r = Math.round(234 + (245 - 234) * localPercentage);
                const g = Math.round(88 + (158 - 88) * localPercentage);
                const b = Math.round(12 + (11 - 12) * localPercentage);
                return `rgb(${r}, ${g}, ${b})`;
            } else if (clampedPoints <= 300) {
                // Amarelo (#F59E0B) para Verde Claro (#84CC16)
                const localPercentage = (clampedPoints - 200) / 100;
                const r = Math.round(245 + (132 - 245) * localPercentage);
                const g = Math.round(158 + (204 - 158) * localPercentage);
                const b = Math.round(11 + (22 - 11) * localPercentage);
                return `rgb(${r}, ${g}, ${b})`;
            } else if (clampedPoints <= 400) {
                // Verde Claro (#84CC16) para Verde (#10B981)
                const localPercentage = (clampedPoints - 300) / 100;
                const r = Math.round(132 + (16 - 132) * localPercentage);
                const g = Math.round(204 + (185 - 204) * localPercentage);
                const b = Math.round(22 + (129 - 22) * localPercentage);
                return `rgb(${r}, ${g}, ${b})`;
            } else {
                // Verde (#10B981) para Verde Escuro (#059669)
                const localPercentage = (clampedPoints - 400) / 100;
                const r = Math.round(16 + (5 - 16) * localPercentage);
                const g = Math.round(185 + (150 - 185) * localPercentage);
                const b = Math.round(129 + (105 - 129) * localPercentage);
                return `rgb(${r}, ${g}, ${b})`;
            }
        }

        // Usar sistema de progresão de cores sempre (cores automáticas baseadas nos pontos)
        const baseColor = getProgressiveColor(totalPoints);
        const headerColor = baseColor;
        const progressColor = baseColor;

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
                            <div class="points-number" style="color: white;">${totalPoints}</div>
                            <div class="points-label" style="color: white;">pontos</div>
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

    cardsContainer.innerHTML = `
        <div class="overflow-x-auto shadow-sm rounded-lg">
            <table class="min-w-full divide-y divide-gray-200" style="table-layout: fixed;">
                <thead class="bg-gray-50">
                    <tr>
                        <th scope="col" class="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider" style="width: 100px;">
                            Data
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider" style="width: auto;">
                            Atividade/Razão
                        </th>
                        <th scope="col" class="px-6 py-3 text-left text-sm font-medium text-gray-600 uppercase tracking-wider" style="width: 150px;">
                            Criança
                        </th>
                        <th scope="col" class="px-8 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider" style="width: 130px;">
                            Pontos
                        </th>
                        <th scope="col" class="px-8 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider" style="width: 130px;">
                            Saldo
                        </th>
                        <th scope="col" class="px-8 py-3 text-center text-sm font-medium text-gray-600 uppercase tracking-wider" style="width: 140px;">
                            Ações
                        </th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    ${history.map(item => {
        // Determinar nome da criança
        const kidName = item.kidId ? item.kidId.name : item.kidName || 'N/A';

        // Determinar nome da atividade
        let activityName = 'N/A';
        let activityIcon = '🎯';
        if (item.activityId && item.activityId.name) {
            activityName = item.activityId.name;
            activityIcon = item.activityId.icon || '🎯';
        } else if (item.activityName) {
            activityName = item.activityName;
        } else if (item.reason) {
            activityName = item.reason;
            activityIcon = '⭐'; // Ícone para pontos avulsos
        } else {
            activityName = 'Ponto Avulso';
            activityIcon = '⭐'; // Ícone para pontos avulsos
        }

        // Determinar pontos com sinal
        const points = item.points || 0;
        const pointsDisplay = item.type === 'remove' ? -points : points;
        const isPositive = pointsDisplay >= 0;

        // Determinar saldo
        const balanceDisplay = item.balanceAfter !== undefined && item.balanceAfter !== null ? item.balanceAfter : '-';

        // Determinar data
        const date = item.date ? new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : 'N/A';

        return `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-base text-gray-700">
                                    ${date}
                                </td>
                                <td class="px-6 py-4">
                                    <div class="flex items-center">
                                        <span class="text-xl mr-3">${activityIcon}</span>
                                        <div class="text-base font-medium text-gray-900 truncate">
                                            ${activityName}
                                        </div>
                                    </div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <div class="text-base text-gray-900">${kidName}</div>
                                </td>
                                <td class="px-8 py-4 whitespace-nowrap text-center">
                                    <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                        ${pointsDisplay >= 0 ? '+' : ''}${pointsDisplay}
                                    </span>
                                </td>
                                <td class="px-8 py-4 whitespace-nowrap text-center text-base text-gray-800 font-bold">
                                    ${balanceDisplay}
                                </td>
                                <td class="px-8 py-4 whitespace-nowrap text-center text-base font-medium">
                                    <button onclick="editHistoryItem('${item._id}')" class="text-indigo-600 hover:text-indigo-900 mr-4" title="Editar">
                                        ✏️
                                    </button>
                                    <button onclick="deleteHistoryItem('${item._id}')" class="text-red-600 hover:text-red-900" title="Excluir">
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
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
    const startDate = document.getElementById('filter-start-date')?.value;
    const endDate = document.getElementById('filter-end-date')?.value;

    console.log('🔍 [DEBUG] Valores dos campos de filtro:', {
        kidId: kidId || 'Vazio',
        startDate: startDate || 'Vazio',
        endDate: endDate || 'Vazio'
    });

    try {
        let url = '/points/history';
        const params = new URLSearchParams();

        if (kidId) params.append('kidId', kidId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        if (params.toString()) {
            url += '?' + params.toString();
        }

        console.log('🔎 [PARENT UI] Aplicando filtros:', {
            kidId: kidId || 'Todas',
            startDate: startDate || 'Não definida',
            endDate: endDate || 'Não definida',
            url: url
        });

        const response = await API.get(url);
        history = response.data.history;
        renderHistoryTable();

        // Feedback visual para o usuário
        const filterInfo = buildFilterInfo(kidId, startDate, endDate);
        console.log('💬 [DEBUG] Informação do filtro criada:', filterInfo);
        showFilterFeedback(filterInfo);

    } catch (error) {
        console.error('❌ [PARENT UI] Erro ao aplicar filtros:', error);
        showToast('Erro', 'Erro ao aplicar filtros', 'error');
    }
}

// Limpar filtros e voltar ao padrão (mês corrente)
function clearFilters() {
    // Limpar campos
    const filterKid = document.getElementById('filter-kid');
    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');

    if (filterKid) filterKid.value = '';
    if (filterStartDate) filterStartDate.value = '';
    if (filterEndDate) filterEndDate.value = '';

    // Definir mês corrente como padrão
    setCurrentMonthDefault();

    // Aplicar filtros automaticamente
    applyFilters();

    console.log('🗑️ [PARENT UI] Filtros limpos - voltando ao mês corrente');
}

// Definir mês corrente como padrão
function setCurrentMonthDefault() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    // Primeiro dia do mês
    const startDate = `${year}-${month}-01`;

    // Último dia do mês
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;

    const filterStartDate = document.getElementById('filter-start-date');
    const filterEndDate = document.getElementById('filter-end-date');

    if (filterStartDate) filterStartDate.value = startDate;
    if (filterEndDate) filterEndDate.value = endDate;

    console.log('📅 [PARENT UI] Definindo mês corrente como padrão:', {
        startDate,
        endDate,
        month: `${year}-${month}`
    });
}

// Construir informação dos filtros aplicados
function buildFilterInfo(kidId, startDate, endDate) {
    const filters = [];

    if (kidId) {
        const kidName = kids.find(kid => kid._id === kidId)?.name || 'Criança';
        filters.push(`Criança: ${kidName} `);
    } else {
        filters.push('Todas as crianças');
    }

    if (startDate && endDate) {
        console.log('🔍 [DEBUG] Processando datas:', {
            startDateRaw: startDate,
            endDateRaw: endDate,
            startDateObj: new Date(startDate),
            endDateObj: new Date(endDate)
        });

        const start = formatDate(new Date(startDate));
        const end = formatDate(new Date(endDate));

        console.log('🔍 [DEBUG] Datas formatadas:', {
            startFormatted: start,
            endFormatted: end
        });

        filters.push(`Período: ${start} até ${end} `);
    } else if (startDate) {
        const start = formatDate(new Date(startDate));
        filters.push(`A partir de: ${start} `);
    } else if (endDate) {
        const end = formatDate(new Date(endDate));
        filters.push(`Até: ${end} `);
    }

    const result = filters.join(' • ');
    console.log('🔍 [DEBUG] Resultado final do filtro:', result);
    return result;
}

// Mostrar feedback dos filtros aplicados
function showFilterFeedback(filterInfo) {
    // Remover feedback anterior se existir
    const existingFeedback = document.getElementById('filter-feedback');
    if (existingFeedback) {
        existingFeedback.remove();
    }

    // Criar novo feedback
    const historyCards = document.getElementById('history-cards');
    if (historyCards && filterInfo) {
        const feedback = document.createElement('div');
        feedback.id = 'filter-feedback';
        feedback.className = 'filter-feedback';
        feedback.innerHTML = `
            <div class="filter-feedback-content">
                <span class="filter-feedback-icon">🔍</span>
                <span class="filter-feedback-text">${filterInfo}</span>
                <span class="filter-feedback-count">${history.length} resultado(s)</span>
            </div>
        `;

        historyCards.parentNode.insertBefore(feedback, historyCards);
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
    document.addEventListener('DOMContentLoaded', async function () {
        // Verificar autenticação primeiro
        const isAuth = await AuthManager.checkAuth();
        if (!isAuth) {
            return; // checkAuth já redireciona se não autenticado
        }

        loadDashboardData();

        // Garantir binding do botão Filtrar
        const filterBtn = document.getElementById('apply-filters-btn');
        if (filterBtn) {
            filterBtn.addEventListener('click', function () {
                // Listener ativo
            });
        }

        // Event listener para formulário de adicionar criança
        const addKidForm = document.getElementById('add-kid-form');
        if (addKidForm) {
            addKidForm.addEventListener('submit', async function (e) {
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
document.addEventListener('click', function (e) {
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

// Funções para gerenciar histórico (Edição e Exclusão)

// Abrir modal de edição
async function editHistoryItem(pointId) {
    try {
        // Buscar dados atuais do ponto
        const point = history.find(p => p._id === pointId);

        if (!point) {
            showToast('Erro', 'Registro não encontrado', 'error');
            return;
        }

        // Garantir que crianças estejam carregadas
        if (!kids || kids.length === 0) {
            await loadKids();
        }

        const modal = document.getElementById('edit-point-modal');
        const kidSelect = document.getElementById('edit-kid');

        // Popular dropdown de crianças
        kidSelect.innerHTML = '<option value="">Selecione uma criança</option>';
        if (kids && kids.length > 0) {
            kids.forEach(kid => {
                const option = document.createElement('option');
                option.value = kid._id;
                option.textContent = kid.name;
                kidSelect.appendChild(option);
            });
        }

        // Preencher formulário
        document.getElementById('edit-point-id').value = point._id;

        // Selecionar criança atual
        if (point.kidId) {
            const kidId = typeof point.kidId === 'object' ? point.kidId._id : point.kidId;
            kidSelect.value = kidId;
        }

        // Preencher data
        try {
            let dateValue = '';
            
            if (point.date) {
                // Se é uma string ISO
                if (typeof point.date === 'string') {
                    dateValue = point.date.split('T')[0];
                }
                // Se é um objeto Date
                else if (point.date instanceof Date) {
                    const year = point.date.getFullYear();
                    const month = String(point.date.getMonth() + 1).padStart(2, '0');
                    const day = String(point.date.getDate()).padStart(2, '0');
                    dateValue = `${year}-${month}-${day}`;
                }
                // Se é timestamp
                else if (typeof point.date === 'number') {
                    const d = new Date(point.date);
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    dateValue = `${year}-${month}-${day}`;
                }
            }
            
            console.log('📅 Data do ponto:', { original: point.date, formatted: dateValue });
            document.getElementById('edit-date').value = dateValue;
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            // Usar data atual como fallback
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            document.getElementById('edit-date').value = `${year}-${month}-${day}`;
        }

        // Mostrar modal
        modal.classList.remove('hidden');
    } catch (error) {
        console.error('Erro ao abrir edição:', error);
        showToast('Erro', 'Erro ao abrir edição', 'error');
    }
}

// Fechar modal de edição
function closeEditModal() {
    const modal = document.getElementById('edit-point-modal');
    modal.classList.add('hidden');
    document.getElementById('edit-point-form').reset();
}

// Salvar edição
document.getElementById('edit-point-form')?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const pointId = document.getElementById('edit-point-id').value;
    const kidId = document.getElementById('edit-kid').value;
    const dateInput = document.getElementById('edit-date').value;

    // Validar campos
    if (!kidId) {
        showToast('Erro', 'Selecione uma criança', 'error');
        return;
    }

    if (!dateInput) {
        showToast('Erro', 'Informe uma data', 'error');
        return;
    }

    // Validar formato da data (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateInput)) {
        showToast('Erro', 'Data inválida. Use o formato YYYY-MM-DD', 'error');
        return;
    }

    // Verificar se a data é válida
    const testDate = new Date(dateInput + 'T12:00:00');
    if (isNaN(testDate.getTime())) {
        showToast('Erro', 'Data inválida. Verifique o dia, mês e ano', 'error');
        return;
    }

    const data = {
        kidId: kidId,
        date: dateInput
    };

    console.log('📝 Enviando atualização:', { 
        pointId, 
        data,
        dateTest: testDate.toISOString()
    });

    try {
        const response = await API.put(`/points/${pointId}`, data);
        console.log('✅ Resposta da API:', response);
        
        showToast('Sucesso', 'Registro atualizado com sucesso!', 'success');
        closeEditModal();
        
        // Recarregar dados
        await loadKids(); // Atualizar pontos das crianças
        await loadHistory(); // Recarregar lista
    } catch (error) {
        console.error('❌ Erro ao atualizar registro:', error);
        
        // Mostrar mensagem de erro mais específica
        let errorMessage = 'Erro ao atualizar registro';
        if (error.response && error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showToast('Erro', errorMessage, 'error');
    }
});

// Excluir item do histórico
async function deleteHistoryItem(pointId) {
    if (!confirm('Tem certeza que deseja excluir este registro? Essa ação irá recalcular os pontos da criança.')) {
        return;
    }

    try {
        await API.delete(`/points/${pointId}`);
        showToast('Sucesso', 'Registro excluído com sucesso!', 'success');
        loadHistory(); // Recarregar lista
    } catch (error) {
        console.error('Erro ao excluir registro:', error);
        showToast('Erro', 'Erro ao excluir registro', 'error');
    }
}

// Inicializar navegação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function () {
    setCurrentPageActive();
}); 