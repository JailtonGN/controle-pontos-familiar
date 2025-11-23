/**
 * Script de Teste - Funcionalidade de Edição do Histórico
 * 
 * Este script testa a funcionalidade de edição de registros de pontos
 * através da API REST
 */

const axios = require('axios');

// Configuração
const BASE_URL = 'http://localhost:3002/api';
let authToken = '';
let testKidId = '';
let testPointId = '';

// Cores para console
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
    console.log('\n' + '='.repeat(60));
    log(`🧪 TESTE: ${testName}`, 'cyan');
    console.log('='.repeat(60));
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

// Função auxiliar para fazer requisições
async function request(method, endpoint, data = null, token = authToken) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            },
            ...(data && { data })
        };

        const response = await axios(config);
        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message,
            status: error.response?.status
        };
    }
}

// 1. Login
async function testLogin() {
    logTest('Login do Usuário');
    
    const result = await request('POST', '/auth/login', {
        email: 'teste@teste.com',
        password: 'teste123'
    }, null);

    if (result.success) {
        authToken = result.data.data.token;
        logSuccess('Login realizado com sucesso');
        logInfo(`Token: ${authToken.substring(0, 20)}...`);
        return true;
    } else {
        logError(`Falha no login: ${result.error}`);
        return false;
    }
}

// 2. Buscar crianças
async function testGetKids() {
    logTest('Buscar Crianças');
    
    const result = await request('GET', '/kids');

    if (result.success && result.data.data.kids.length > 0) {
        testKidId = result.data.data.kids[0]._id;
        logSuccess(`Crianças encontradas: ${result.data.data.kids.length}`);
        logInfo(`Criança de teste: ${result.data.data.kids[0].name} (ID: ${testKidId})`);
        return true;
    } else {
        logError('Nenhuma criança encontrada');
        return false;
    }
}

// 3. Adicionar pontos para teste
async function testAddPoints() {
    logTest('Adicionar Pontos para Teste');
    
    const result = await request('POST', '/points/add', {
        kidId: testKidId,
        reason: 'Teste de edição',
        points: 10,
        notes: 'Registro criado para teste de edição'
    });

    if (result.success) {
        testPointId = result.data.data.point._id;
        logSuccess('Pontos adicionados com sucesso');
        logInfo(`Point ID: ${testPointId}`);
        logInfo(`Pontos: +10`);
        return true;
    } else {
        logError(`Falha ao adicionar pontos: ${result.error}`);
        return false;
    }
}

// 4. Buscar histórico
async function testGetHistory() {
    logTest('Buscar Histórico');
    
    const result = await request('GET', '/points/history');

    if (result.success) {
        const history = result.data.data.history;
        logSuccess(`Histórico carregado: ${history.length} registros`);
        
        // Encontrar nosso registro de teste
        const testPoint = history.find(p => p._id === testPointId);
        if (testPoint) {
            logInfo('Registro de teste encontrado no histórico:');
            logInfo(`  - Data: ${new Date(testPoint.date).toLocaleDateString('pt-BR')}`);
            logInfo(`  - Pontos: ${testPoint.points}`);
            logInfo(`  - Motivo: ${testPoint.reason || 'N/A'}`);
        }
        return true;
    } else {
        logError(`Falha ao buscar histórico: ${result.error}`);
        return false;
    }
}

// 5. Editar registro - Alterar data
async function testEditDate() {
    logTest('Editar Registro - Alterar Data');
    
    const newDate = '2024-01-15';
    const result = await request('PUT', `/points/${testPointId}`, {
        date: newDate
    });

    if (result.success) {
        logSuccess('Data alterada com sucesso');
        logInfo(`Nova data: ${newDate}`);
        logInfo(`Pontos recalculados: ${result.data.data.kid.totalPoints}`);
        return true;
    } else {
        logError(`Falha ao editar data: ${result.error}`);
        return false;
    }
}

// 6. Editar registro - Alterar pontos
async function testEditPoints() {
    logTest('Editar Registro - Alterar Pontos');
    
    const newPoints = 25;
    const result = await request('PUT', `/points/${testPointId}`, {
        points: newPoints
    });

    if (result.success) {
        logSuccess('Pontos alterados com sucesso');
        logInfo(`Novos pontos: ${newPoints}`);
        logInfo(`Total da criança: ${result.data.data.kid.totalPoints}`);
        return true;
    } else {
        logError(`Falha ao editar pontos: ${result.error}`);
        return false;
    }
}

// 7. Editar registro - Alterar motivo
async function testEditReason() {
    logTest('Editar Registro - Alterar Motivo');
    
    const newReason = 'Motivo editado via teste';
    const result = await request('PUT', `/points/${testPointId}`, {
        reason: newReason
    });

    if (result.success) {
        logSuccess('Motivo alterado com sucesso');
        logInfo(`Novo motivo: ${newReason}`);
        return true;
    } else {
        logError(`Falha ao editar motivo: ${result.error}`);
        return false;
    }
}

// 8. Verificar alterações no histórico
async function testVerifyChanges() {
    logTest('Verificar Alterações no Histórico');
    
    const result = await request('GET', '/points/history');

    if (result.success) {
        const history = result.data.data.history;
        const testPoint = history.find(p => p._id === testPointId);
        
        if (testPoint) {
            logSuccess('Registro encontrado com alterações:');
            logInfo(`  - Data: ${new Date(testPoint.date).toLocaleDateString('pt-BR')}`);
            logInfo(`  - Pontos: ${testPoint.points}`);
            logInfo(`  - Motivo: ${testPoint.reason || 'N/A'}`);
            logInfo(`  - Observações: ${testPoint.notes || 'N/A'}`);
            return true;
        } else {
            logError('Registro não encontrado no histórico');
            return false;
        }
    } else {
        logError(`Falha ao verificar histórico: ${result.error}`);
        return false;
    }
}

// 9. Excluir registro de teste
async function testDeletePoint() {
    logTest('Excluir Registro de Teste');
    
    const result = await request('DELETE', `/points/${testPointId}`);

    if (result.success) {
        logSuccess('Registro excluído com sucesso');
        logInfo(`Pontos recalculados: ${result.data.data.kid.totalPoints}`);
        return true;
    } else {
        logError(`Falha ao excluir registro: ${result.error}`);
        return false;
    }
}

// 10. Verificar exclusão
async function testVerifyDeletion() {
    logTest('Verificar Exclusão');
    
    const result = await request('GET', '/points/history');

    if (result.success) {
        const history = result.data.data.history;
        const testPoint = history.find(p => p._id === testPointId);
        
        if (!testPoint) {
            logSuccess('Registro foi excluído corretamente');
            return true;
        } else {
            logError('Registro ainda existe no histórico');
            return false;
        }
    } else {
        logError(`Falha ao verificar exclusão: ${result.error}`);
        return false;
    }
}

// Executar todos os testes
async function runAllTests() {
    console.log('\n');
    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║     TESTE DE FUNCIONALIDADE - EDIÇÃO DE HISTÓRICO         ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');
    
    const tests = [
        { name: 'Login', fn: testLogin },
        { name: 'Buscar Crianças', fn: testGetKids },
        { name: 'Adicionar Pontos', fn: testAddPoints },
        { name: 'Buscar Histórico', fn: testGetHistory },
        { name: 'Editar Data', fn: testEditDate },
        { name: 'Editar Pontos', fn: testEditPoints },
        { name: 'Editar Motivo', fn: testEditReason },
        { name: 'Verificar Alterações', fn: testVerifyChanges },
        { name: 'Excluir Registro', fn: testDeletePoint },
        { name: 'Verificar Exclusão', fn: testVerifyDeletion }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const result = await test.fn();
        if (result) {
            passed++;
        } else {
            failed++;
            log(`\n⚠️  Teste "${test.name}" falhou. Parando execução.`, 'yellow');
            break;
        }
        
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Resumo
    console.log('\n');
    log('╔════════════════════════════════════════════════════════════╗', 'cyan');
    log('║                      RESUMO DOS TESTES                     ║', 'cyan');
    log('╚════════════════════════════════════════════════════════════╝', 'cyan');
    console.log('');
    log(`Total de testes: ${tests.length}`, 'blue');
    log(`✅ Passou: ${passed}`, 'green');
    log(`❌ Falhou: ${failed}`, 'red');
    console.log('');
    
    if (failed === 0) {
        log('🎉 TODOS OS TESTES PASSARAM! 🎉', 'green');
        log('A funcionalidade de edição está funcionando corretamente.', 'green');
    } else {
        log('⚠️  ALGUNS TESTES FALHARAM', 'yellow');
        log('Verifique os logs acima para mais detalhes.', 'yellow');
    }
    console.log('');
}

// Verificar se o servidor está rodando
async function checkServer() {
    try {
        await axios.get(`${BASE_URL.replace('/api', '')}/api/health`);
        return true;
    } catch (error) {
        return false;
    }
}

// Iniciar testes
(async () => {
    log('\n🔍 Verificando se o servidor está rodando...', 'yellow');
    
    const serverRunning = await checkServer();
    
    if (!serverRunning) {
        logError('Servidor não está rodando!');
        logInfo('Inicie o servidor de teste com: npm run test-server');
        logInfo('Ou: node test-server.js');
        process.exit(1);
    }
    
    logSuccess('Servidor está rodando!');
    
    await runAllTests();
})();
