const mongoose = require('mongoose');
require('dotenv').config();

// Importar modelos
const User = require('../models/User');
const Family = require('../models/Family');

// Conectar ao MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');
    } catch (error) {
        console.error('❌ Erro ao conectar ao MongoDB:', error);
        process.exit(1);
    }
}

// Função principal
async function fixFamilyAssociations() {
    try {
        console.log('🔧 Corrigindo associações de família...');
        
        // 1. Verificar todas as famílias
        const families = await Family.find({ isActive: true });
        console.log('\n🏠 Famílias encontradas:');
        families.forEach(family => {
            console.log(`   - ${family.name} (ID: ${family._id}) - Criada em: ${family.createdAt}`);
        });
        
        // 2. Encontrar a família Azevedo mais recente (ou criar uma nova)
        let azevedoFamily = families.find(f => f.name === 'Família Azevedo');
        
        if (!azevedoFamily) {
            console.log('❌ Família Azevedo não encontrada');
            return;
        }
        
        // Se há múltiplas famílias Azevedo, usar a mais recente
        const azevedoFamilies = families.filter(f => f.name === 'Família Azevedo');
        if (azevedoFamilies.length > 1) {
            azevedoFamily = azevedoFamilies.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
            console.log('⚠️ Múltiplas famílias Azevedo encontradas, usando a mais recente:', azevedoFamily._id);
        }
        
        console.log(`✅ Família Azevedo selecionada: ${azevedoFamily.name} (ID: ${azevedoFamily._id})`);
        
        // 3. Associar todos os usuários não-admin à família Azevedo
        const users = await User.find({ role: { $ne: 'admin' } });
        console.log(`\n👥 Usuários não-admin encontrados: ${users.length}`);
        
        for (const user of users) {
            if (!user.familyId || user.familyId.toString() !== azevedoFamily._id.toString()) {
                console.log(`🔄 Associando usuário ${user.name} à família Azevedo...`);
                user.familyId = azevedoFamily._id;
                await user.save();
                console.log(`✅ Usuário ${user.name} associado à família Azevedo`);
            } else {
                console.log(`✅ Usuário ${user.name} já está associado à família Azevedo`);
            }
        }
        
        // 4. Verificar resultado final
        const updatedUsers = await User.find({}).populate('familyId', 'name');
        console.log('\n📊 Resultado final:');
        updatedUsers.forEach(user => {
            const familyName = user.familyId ? user.familyId.name : 'Sem família';
            console.log(`   - ${user.name} (${user.email}) - Família: ${familyName}`);
        });
        
        console.log('\n🎉 Associações de família corrigidas com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao corrigir associações:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Desconectado do MongoDB');
    }
}

// Executar o script
if (require.main === module) {
    connectDB().then(fixFamilyAssociations);
}

module.exports = { fixFamilyAssociations }; 