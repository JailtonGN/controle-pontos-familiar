// Script para testar os modais
console.log('🧪 Testando modais...');

// Função para testar modal de editar atividade
function testEditActivityModal() {
    console.log('🔍 Testando modal de editar atividade...');
    
    // Simular dados de uma atividade
    const mockActivity = {
        _id: 'test-id',
        name: 'Atividade de Teste',
        description: 'Descrição de teste',
        type: 'positive',
        points: 10
    };
    
    // Simular a função editActivity
    const activity = mockActivity;
    
    // Preencher formulário de edição
    const idField = document.getElementById('edit-activity-id');
    const nameField = document.getElementById('edit-activity-name');
    const descField = document.getElementById('edit-activity-description');
    const typeField = document.getElementById('edit-activity-type');
    const pointsField = document.getElementById('edit-activity-points');
    
    if (idField && nameField && descField && typeField && pointsField) {
        idField.value = activity._id;
        nameField.value = activity.name;
        descField.value = activity.description;
        typeField.value = activity.type;
        pointsField.value = activity.points;
        
        console.log('✅ Campos preenchidos com sucesso');
        
        // Mostrar modal
        const modal = document.getElementById('edit-activity-modal');
        const modalContent = document.getElementById('edit-activity-modal-content');
        
        if (modal && modalContent) {
            modal.style.display = 'flex';
            modal.classList.remove('hidden');
            
            // Resetar transformações
            modalContent.style.transform = 'scale(0.95)';
            modalContent.style.opacity = '0';
            
            // Animar entrada
            setTimeout(() => {
                modalContent.style.transform = 'scale(1)';
                modalContent.style.opacity = '1';
                console.log('✅ Modal exibido com sucesso');
            }, 10);
        } else {
            console.error('❌ Elementos do modal não encontrados');
        }
    } else {
        console.error('❌ Campos do formulário não encontrados');
    }
}

// Função para testar modal de excluir atividade
function testDeleteActivityModal() {
    console.log('🔍 Testando modal de excluir atividade...');
    
    const activityName = 'Atividade de Teste';
    
    // Preencher nome da atividade
    const nameField = document.getElementById('delete-activity-name');
    if (nameField) {
        nameField.textContent = activityName;
        console.log('✅ Nome da atividade preenchido');
    }
    
    // Mostrar modal
    const modal = document.getElementById('delete-activity-modal');
    const modalContent = document.getElementById('delete-activity-modal-content');
    
    if (modal && modalContent) {
        modal.style.display = 'flex';
        modal.classList.remove('hidden');
        
        // Resetar transformações
        modalContent.style.transform = 'scale(0.95)';
        modalContent.style.opacity = '0';
        
        // Animar entrada
        setTimeout(() => {
            modalContent.style.transform = 'scale(1)';
            modalContent.style.opacity = '1';
            console.log('✅ Modal de exclusão exibido com sucesso');
        }, 10);
    } else {
        console.error('❌ Elementos do modal de exclusão não encontrados');
    }
}

// Função para testar fechamento de modais
function testCloseModals() {
    console.log('🔍 Testando fechamento de modais...');
    
    // Fechar modal de editar
    const editModal = document.getElementById('edit-activity-modal');
    const editModalContent = document.getElementById('edit-activity-modal-content');
    
    if (editModal && editModalContent) {
        editModalContent.style.transform = 'scale(0.95)';
        editModalContent.style.opacity = '0';
        
        setTimeout(() => {
            editModal.classList.add('hidden');
            editModal.style.display = 'none';
            console.log('✅ Modal de editar fechado');
        }, 300);
    }
    
    // Fechar modal de excluir
    const deleteModal = document.getElementById('delete-activity-modal');
    const deleteModalContent = document.getElementById('delete-activity-modal-content');
    
    if (deleteModal && deleteModalContent) {
        deleteModalContent.style.transform = 'scale(0.95)';
        deleteModalContent.style.opacity = '0';
        
        setTimeout(() => {
            deleteModal.classList.add('hidden');
            deleteModal.style.display = 'none';
            console.log('✅ Modal de excluir fechado');
        }, 300);
    }
}

// Expor funções para teste no console
window.testEditActivityModal = testEditActivityModal;
window.testDeleteActivityModal = testDeleteActivityModal;
window.testCloseModals = testCloseModals;

console.log('✅ Script de teste carregado. Use:');
console.log('- testEditActivityModal() para testar modal de editar');
console.log('- testDeleteActivityModal() para testar modal de excluir');
console.log('- testCloseModals() para fechar os modais'); 