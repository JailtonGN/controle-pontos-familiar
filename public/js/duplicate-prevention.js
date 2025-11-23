// Sistema de prevenção de duplicações
class DuplicatePrevention {
    constructor() {
        this.pendingRequests = new Map();
        this.buttonStates = new Map();
        this.requestTimeout = 30000; // 30 segundos
    }

    // Gerar chave única para a requisição
    generateRequestKey(endpoint, data) {
        const key = `${endpoint}_${JSON.stringify(data)}`;
        return btoa(key).replace(/[^a-zA-Z0-9]/g, ''); // Base64 seguro
    }

    // Verificar se requisição já está pendente
    isPending(endpoint, data) {
        const key = this.generateRequestKey(endpoint, data);
        return this.pendingRequests.has(key);
    }

    // Marcar requisição como pendente
    markPending(endpoint, data) {
        const key = this.generateRequestKey(endpoint, data);
        const timeout = setTimeout(() => {
            this.pendingRequests.delete(key);
        }, this.requestTimeout);
        
        this.pendingRequests.set(key, timeout);
        return key;
    }

    // Remover requisição pendente
    removePending(key) {
        if (this.pendingRequests.has(key)) {
            clearTimeout(this.pendingRequests.get(key));
            this.pendingRequests.delete(key);
        }
    }

    // Desabilitar botão temporariamente
    disableButton(buttonElement, duration = 3000) {
        if (!buttonElement) return;

        const originalText = buttonElement.textContent;
        const originalDisabled = buttonElement.disabled;
        
        buttonElement.disabled = true;
        buttonElement.textContent = 'Processando...';
        buttonElement.classList.add('processing');

        const buttonId = buttonElement.id || `btn_${Date.now()}`;
        
        setTimeout(() => {
            buttonElement.disabled = originalDisabled;
            buttonElement.textContent = originalText;
            buttonElement.classList.remove('processing');
        }, duration);
    }

    // Wrapper para requisições com prevenção de duplicação
    async safeRequest(endpoint, data, options = {}) {
        // Verificar se já existe requisição pendente
        if (this.isPending(endpoint, data)) {
            throw new Error('Requisição já está sendo processada. Aguarde alguns segundos.');
        }

        // Marcar como pendente
        const requestKey = this.markPending(endpoint, data);

        try {
            // Desabilitar botão se fornecido
            if (options.button) {
                this.disableButton(options.button, options.buttonTimeout || 3000);
            }

            // Fazer a requisição
            const response = await API.post(endpoint, data);
            
            return response;
        } catch (error) {
            throw error;
        } finally {
            // Remover da lista de pendentes
            this.removePending(requestKey);
        }
    }
}

// Instância global
const duplicatePrevention = new DuplicatePrevention();

// Função helper para adicionar pontos com segurança
async function safeAddPoints(kidId, activityId, points, notes, button) {
    try {
        const data = {
            kidId,
            activityId,
            points,
            notes: notes || 'Pontos adicionados'
        };

        const response = await duplicatePrevention.safeRequest('/points/add', data, {
            button: button,
            buttonTimeout: 3000
        });

        return response;
    } catch (error) {
        if (error.message.includes('já está sendo processada')) {
            showToast('Aviso', 'Aguarde! Pontos já estão sendo adicionados.', 'warning');
        } else if (error.message.includes('já foram adicionados recentemente')) {
            showToast('Aviso', 'Pontos já foram adicionados recentemente. Aguarde alguns segundos.', 'warning');
        } else {
            showToast('Erro', error.message || 'Erro ao adicionar pontos', 'error');
        }
        throw error;
    }
}

// Função helper para remover pontos com segurança
async function safeRemovePoints(kidId, activityId, points, notes, button) {
    try {
        const data = {
            kidId,
            activityId,
            points,
            notes: notes || 'Pontos removidos'
        };

        const response = await duplicatePrevention.safeRequest('/points/remove', data, {
            button: button,
            buttonTimeout: 3000
        });

        return response;
    } catch (error) {
        if (error.message.includes('já está sendo processada')) {
            showToast('Aviso', 'Aguarde! Pontos já estão sendo removidos.', 'warning');
        } else {
            showToast('Erro', error.message || 'Erro ao remover pontos', 'error');
        }
        throw error;
    }
}

// Adicionar estilos CSS para botões em processamento
const style = document.createElement('style');
style.textContent = `
    .processing {
        opacity: 0.6;
        cursor: not-allowed !important;
        pointer-events: none;
    }
    
    .processing::after {
        content: '';
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-left: 8px;
        border: 2px solid #ffffff;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// Interceptar todos os cliques em botões para prevenir duplo clique
document.addEventListener('click', function(event) {
    const button = event.target.closest('button');
    if (button && !button.disabled) {
        // Adicionar classe temporária para prevenir cliques múltiplos
        if (button.classList.contains('prevent-double-click')) {
            button.disabled = true;
            setTimeout(() => {
                button.disabled = false;
            }, 1000); // 1 segundo de proteção
        }
    }
});

// Exportar para uso global
window.safeAddPoints = safeAddPoints;
window.safeRemovePoints = safeRemovePoints;
window.duplicatePrevention = duplicatePrevention;