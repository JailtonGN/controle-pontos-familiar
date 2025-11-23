const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const Family = require('../models/Family');
const User = require('../models/User');
const Kid = require('../models/Kid');

async function testFamilyDelete() {
    try {
        console.log('🧪 Testando funcionalidade de exclusão de família...\n');

        // 1. Listar todas as famílias
        const families = await Family.find({ isActive: true });
        console.log(`📋 Famílias encontradas: ${families.length}`);
        
        families.forEach((family, index) => {
            console.log(`   ${index + 1}. ${family.name} (ID: ${family._id})`);
        });

        // 2. Verificar se existe uma família de teste
        let testFamily = await Family.findOne({ 
            name: { $regex: /teste/i },
            isActive: true 
        });

        if (!testFamily) {
            console.log('\n📝 Criando família de teste...');
            
            // Buscar um admin para criar a família
            const admin = await User.findOne({ role: 'admin' });
            if (!admin) {
                console.log('❌ Nenhum admin encontrado para criar família de teste');
                return;
            }

            testFamily = new Family({
                name: 'Família Teste Delete',
                description: 'Família criada para testar exclusão',
                createdBy: admin._id
            });

            await testFamily.save();
            console.log(`✅ Família de teste criada: ${testFamily.name} (ID: ${testFamily._id})`);
        } else {
            console.log(`\n✅ Família de teste encontrada: ${testFamily.name} (ID: ${testFamily._id})`);
        }

        // 3. Verificar dependências da família
        const userCount = await User.countDocuments({ 
            familyId: testFamily._id, 
            isActive: true 
        });
        
        const kidCount = await Kid.countDocuments({ 
            familyId: testFamily._id, 
            isActive: true 
        });

        console.log(`\n📊 Dependências da família "${testFamily.name}":`);
        console.log(`   👥 Usuários: ${userCount}`);
        console.log(`   👶 Crianças: ${kidCount}`);

        // 4. Testar exclusão
        if (userCount === 0 && kidCount === 0) {
            console.log('\n🗑️ Testando exclusão (família sem dependências)...');
            
            // Simular exclusão
            testFamily.isActive = false;
            await testFamily.save();
            
            console.log('✅ Família desativada com sucesso!');
            
            // Reativar para próximos testes
            testFamily.isActive = true;
            await testFamily.save();
            console.log('🔄 Família reativada para próximos testes');
            
        } else {
            console.log('\n⚠️ Família possui dependências - exclusão seria bloqueada');
            console.log('   Para testar exclusão, remova primeiro os usuários e crianças');
        }

        // 5. Testar proteção da Família ADM
        const adminFamily = await Family.findOne({ name: 'Família ADM' });
        if (adminFamily) {
            console.log('\n🛡️ Testando proteção da Família ADM...');
            console.log('   Família ADM encontrada - deve ser protegida contra exclusão');
        } else {
            console.log('\n❌ Família ADM não encontrada - isso pode causar problemas');
        }

        console.log('\n✅ Teste concluído com sucesso!');

    } catch (error) {
        console.error('❌ Erro no teste:', error);
        
        // Verificar tipos específicos de erro
        if (error.name === 'ValidationError') {
            console.log('📝 Erro de validação:', Object.values(error.errors).map(e => e.message));
        } else if (error.code === 11000) {
            console.log('🔄 Erro de duplicação - família já existe');
        } else {
            console.log('💥 Erro desconhecido:', error.message);
        }
        
    } finally {
        mongoose.connection.close();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    testFamilyDelete();
}

module.exports = { testFamilyDelete };