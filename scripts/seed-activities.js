const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelo de atividade
const Activity = require('../models/Activity');

// Função para conectar ao MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB conectado para seed');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error.message);
        process.exit(1);
    }
};

// Função para desconectar do MongoDB
const disconnectDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB desconectado');
    } catch (error) {
        console.error('❌ Erro ao desconectar do MongoDB:', error.message);
    }
};

// Função para limpar atividades existentes
const clearActivities = async () => {
    try {
        const result = await Activity.deleteMany({});
        console.log(`🗑️ ${result.deletedCount} atividades removidas`);
        return result.deletedCount;
    } catch (error) {
        console.error('❌ Erro ao limpar atividades:', error.message);
        throw error;
    }
};

// Função para popular atividades
const seedActivities = async () => {
    try {
        // Verificar se já existem atividades
        const existingCount = await Activity.countDocuments();
        if (existingCount > 0) {
            console.log(`⚠️ Já existem ${existingCount} atividades no banco.`);
            const answer = await askQuestion('Deseja limpar e recriar todas as atividades? (s/N): ');
            if (answer.toLowerCase() !== 's' && answer.toLowerCase() !== 'sim') {
                console.log('❌ Operação cancelada pelo usuário.');
                return;
            }
            await clearActivities();
        }

        // Obter atividades padrão
        const defaultActivities = Activity.getDefaultActivities();
        
        // Inserir atividades
        const createdActivities = await Activity.insertMany(defaultActivities);
        
        console.log(`✅ ${createdActivities.length} atividades criadas com sucesso!`);
        
        // Mostrar resumo das atividades criadas
        console.log('\n📋 Resumo das atividades criadas:');
        createdActivities.forEach((activity, index) => {
            console.log(`${index + 1}. ${activity.icon} ${activity.name} (${activity.points} pontos)`);
        });
        
        // Estatísticas por categoria
        const categoryStats = {};
        createdActivities.forEach(activity => {
            if (!categoryStats[activity.category]) {
                categoryStats[activity.category] = 0;
            }
            categoryStats[activity.category]++;
        });
        
        console.log('\n📊 Estatísticas por categoria:');
        Object.entries(categoryStats).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} atividades`);
        });
        
    } catch (error) {
        console.error('❌ Erro ao popular atividades:', error.message);
        throw error;
    }
};

// Função auxiliar para perguntas (simulação)
const askQuestion = (question) => {
    // Em um ambiente real, você usaria readline ou uma biblioteca similar
    // Para este script, vamos simular uma resposta padrão
    return Promise.resolve('N');
};

// Função principal
const main = async () => {
    try {
        console.log('🚀 Iniciando seed de atividades...');
        
        // Conectar ao banco
        await connectDB();
        
        // Popular atividades
        await seedActivities();
        
        console.log('\n✅ Seed concluído com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro durante o seed:', error.message);
        process.exit(1);
    } finally {
        // Desconectar do banco
        await disconnectDB();
        process.exit(0);
    }
};

// Executar se o script for chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    seedActivities,
    clearActivities
}; 