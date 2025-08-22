// Sistema de Toast Elegante
class ToastSystem {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    init() {
        // Criar container de toasts se não existir
        if (!document.querySelector('.toast-container')) {
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.querySelector('.toast-container');
        }
    }

    // Criar toast básico
    createToast(options = {}) {
        const {
            title = '',
            message = '',
            type = 'info', // success, error, warning, info
            duration = 4000, // Diminuído de 8000 para 4000ms (4 segundos)
            actions = [],
            persistent = false
        } = options;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="toast-header">
                <div class="toast-title">
                    <span class="toast-icon">${icons[type]}</span>
                    ${title}
                </div>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
            <p class="toast-message">${message}</p>
            ${actions.length > 0 ? `
                <div class="toast-actions">
                    ${actions.map(action => `
                        <button class="toast-btn toast-btn-${action.type || 'secondary'}" onclick="${action.onClick}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;

        return toast;
    }

    // Mostrar toast
    show(options) {
        const startTime = Date.now();
        
        const toast = this.createToast(options);
        this.container.appendChild(toast);

        // Animar entrada imediatamente
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Auto-remover se não for persistente
        if (!options.persistent && options.duration !== 0) {
            let timeoutId = setTimeout(() => {
                this.hide(toast);
            }, options.duration);

            // Pausar auto-remover quando mouse passar sobre o toast
            toast.addEventListener('mouseenter', () => {
                clearTimeout(timeoutId);
            });

            // Retomar auto-remover quando mouse sair do toast
            toast.addEventListener('mouseleave', () => {
                timeoutId = setTimeout(() => {
                    this.hide(toast);
                }, 3000); // 3 segundos após sair do mouse
            });
        }

        this.toasts.push(toast);
        return toast;
    }

    // Esconder toast
    hide(toast) {
        toast.classList.remove('show');
        toast.classList.add('slide-out');
        
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
            this.toasts = this.toasts.filter(t => t !== toast);
        }, 300);
    }

    // Toast de sucesso
    success(title, message, options = {}) {
        return this.show({
            title,
            message,
            type: 'success',
            duration: 4000, // Adicionando duração padrão de 8 segundos
            ...options
        });
    }

    // Toast de erro
    error(title, message, options = {}) {
        return this.show({
            title,
            message,
            type: 'error',
            duration: 5000, // Aumentado de 7000 para 10000ms (10 segundos)
            ...options
        });
    }

    // Toast de aviso
    warning(title, message, options = {}) {
        return this.show({
            title,
            message,
            type: 'warning',
            duration: 4000, // Adicionando duração padrão de 8 segundos
            ...options
        });
    }

    // Toast de informação
    info(title, message, options = {}) {
        return this.show({
            title,
            message,
            type: 'info',
            duration: 4000, // Adicionando duração padrão de 8 segundos
            ...options
        });
    }

    // Toast de confirmação
    confirm(title, message, onConfirm, onCancel) {
        return this.show({
            title,
            message,
            type: 'warning',
            persistent: true,
            actions: [
                {
                    text: 'Cancelar',
                    type: 'secondary',
                    onClick: `toastSystem.hide(this.closest('.toast')); ${onCancel ? onCancel : ''}`
                },
                {
                    text: 'Confirmar',
                    type: 'danger',
                    onClick: `toastSystem.hide(this.closest('.toast')); ${onConfirm}`
                }
            ]
        });
    }

    // Toast de confirmação de exclusão
    confirmDelete(itemName, onConfirm, onCancel) {
        return this.confirm(
            'Confirmar Exclusão',
            `Tem certeza que deseja excluir "${itemName}"? Esta ação não pode ser desfeita.`,
            onConfirm,
            onCancel
        );
    }

    // Limpar todos os toasts
    clearAll() {
        this.toasts.forEach(toast => this.hide(toast));
    }
}

// Instanciar sistema de toast
const toastSystem = new ToastSystem();

// Funções de conveniência para uso global
window.showToast = (title, message, type = 'info') => {
    return toastSystem[type](title, message);
};

// Exportar toastSystem globalmente também
window.toastSystem = toastSystem;

window.showConfirm = (title, message, onConfirm, onCancel) => {
    return toastSystem.confirm(title, message, onConfirm, onCancel);
};

window.showConfirmDelete = (itemName, onConfirm, onCancel) => {
    return toastSystem.confirmDelete(itemName, onConfirm, onCancel);
};

// Exemplo de uso:
// showToast('Sucesso', 'Operação realizada com sucesso!', 'success');
// showConfirm('Confirmar', 'Deseja continuar?', 'confirmAction()', 'cancelAction()');
// showConfirmDelete('João', 'deleteUser()', 'cancelDelete()');

// Exemplos práticos:
// showToast('Bem-vindo!', 'Login realizado com sucesso', 'success');
// showToast('Atenção', 'Sua sessão expira em 5 minutos', 'warning');
// showToast('Erro', 'Não foi possível conectar ao servidor', 'error');
// showToast('Info', 'Nova funcionalidade disponível', 'info');

// showConfirmDelete('João Silva', 'deleteUser()', 'console.log("Cancelado")');
// showConfirm('Sair', 'Tem certeza que deseja sair?', 'logout()', 'console.log("Cancelado")'); 