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
const Point = require('../models/Point');

async function prepareFamilyForDelete() {
    try {
        console.log('🧹 Preparando família para exclusão...\n');

        // Buscar família de teste
        const testFamily = await Family.findOne({ 
            name: { $regex: /teste/i },
            isActive: true 
        });

        if (!testFamily) {
            console.log('❌ Nenhuma família de teste encontrada');
            
            // Criar uma família de teste vazia
            const admin = await User.findOne({ role: 'admin' });
            if (!admin) {
                console.log('❌ Nenhum admin encontrado');
                return;
            }

            const newTestFamily = new Family({
                name: 'Família Teste Exclusão',
                description: 'Família criada especificamente para testar exclusão',
                createdBy: admin._id
            });

            await newTestFamily.save();
            console.log(`✅ Família de teste criada: ${newTestFamily.name} (ID: ${newTestFamily._id})`);
            console.log('✅ Esta família está pronta para exclusão (sem dependências)');
            return;
        }

        console.log(`📋 Família encontrada: ${testFamily.name} (ID: ${testFamily._id})`);

        // Verificar dependências
        const users = await User.find({ familyId: testFamily._id, isActive: true });
        const kids = await Kid.find({ familyId: testFamily._id, isActive: true });

        console.log(`\n📊 Dependências atuais:`);
        console.log(`   👥 Usuários: ${users.length}`);
        console.log(`   👶 Crianças: ${kids.length}`);

        if (users.length === 0 && kids.length === 0) {
            console.log('\n✅ Família já está pronta para exclusão (sem dependências)');
            return;
        }

        // Remover crianças e seus pontos
        if (kids.length > 0) {
            console.log('\n🧹 Removendo crianças e seus pontos...');
            
            for (const kid of kids) {
                // Remover pontos da criança
                const deletedPoints = await Point.deleteMany({ kidId: kid._id });
                console.log(`   🗑️ Removidos ${deletedPoints.deletedCount} pontos de ${kid.name}`);
                
                // Remover criança
                await Kid.deleteOne({ _id: kid._id });
                console.log(`   👶 Criança ${kid.name} removida`);
            }
        }

        // Mover usuários para Família ADM (não remover para não perder dados)
        if (users.length > 0) {
            console.log('\n🔄 Movendo usuários para Família ADM...');
            
            const adminFamily = await Family.findOne({ name: 'Família ADM' });
            if (!adminFamily) {
                console.log('❌ Família ADM não encontrada');
                return;
            }

            for (const user of users) {
                user.familyId = adminFamily._id;
                await user.save();
                console.log(`   👤 Usuário ${user.name} movido para Família ADM`);
            }
        }

        // Verificar se está limpa
        const finalUserCount = await User.countDocuments({ familyId: testFamily._id, isActive: true });
        const finalKidCount = await Kid.countDocuments({ familyId: testFamily._id, isActive: true });

        console.log(`\n✅ Limpeza concluída!`);
        console.log(`📊 Dependências finais:`);
        console.log(`   👥 Usuários: ${finalUserCount}`);
        console.log(`   👶 Crianças: ${finalKidCount}`);

        if (finalUserCount === 0 && finalKidCount === 0) {
            console.log(`\n🎯 A família "${testFamily.name}" está pronta para exclusão!`);
            console.log(`   ID: ${testFamily._id}`);
            console.log(`   Você pode testá-la na interface de configurações`);
        } else {
            console.log('\n⚠️ Ainda há dependências - verifique manualmente');
        }

    } catch (error) {
        console.error('❌ Erro ao preparar família:', error);
    } finally {
        mongoose.connection.close();
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    prepareFamilyForDelete();
}

module.exports = { prepareFamilyForDelete };