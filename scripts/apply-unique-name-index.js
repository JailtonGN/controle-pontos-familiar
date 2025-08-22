const mongoose = require('mongoose');
require('dotenv').config();

async function applyUniqueNameIndex() {
    try {
        // Conectar ao MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado ao MongoDB');

        // Importar o modelo Kid
        const Kid = require('../models/Kid');
        
        console.log('\n🔧 Aplicando índice único global no nome das crianças...');
        
        // 1. Remover índice composto anterior (se existir)
        try {
            await Kid.collection.dropIndex('name_familyId_unique');
            console.log('🗑️ Índice composto anterior removido');
        } catch (e) {
            console.log('ℹ️ Índice composto não existia');
        }
        
        // 2. Criar índice único global no nome
        console.log('📊 Criando índice único global em "name"...');
        await Kid.collection.createIndex(
            { name: 1 }, 
            { 
                unique: true,
                name: 'name_unique'
            }
        );
        console.log('✅ Índice único global criado com sucesso!');
        
        // 3. Verificar se há conflitos existentes
        console.log('\n🔍 Verificando conflitos existentes...');
        
        // Buscar todas as crianças
        const allKids = await Kid.find({ isActive: true });
        
        // Agrupar por nome para encontrar duplicatas
        const nameGroups = {};
        allKids.forEach(kid => {
            if (!nameGroups[kid.name]) {
                nameGroups[kid.name] = [];
            }
            nameGroups[kid.name].push(kid);
        });
        
        // Verificar duplicatas
        const duplicates = Object.entries(nameGroups).filter(([name, kids]) => kids.length > 1);
        
        if (duplicates.length > 0) {
            console.log('⚠️ DUPLICATAS ENCONTRADAS:');
            duplicates.forEach(([name, kids]) => {
                console.log(`   Nome: "${name}" - ${kids.length} crianças:`);
                kids.forEach((kid, index) => {
                    console.log(`     ${index + 1}. ID: ${kid._id}, Família: ${kid.familyId}, Parent: ${kid.parentId}`);
                });
                console.log('');
            });
            
            console.log('💡 SOLUÇÕES:');
            console.log('1. Renomear uma das crianças para evitar conflito');
            console.log('2. Ou desativar uma das crianças');
            console.log('3. Ou mover uma das crianças para outra família e renomear');
            
            console.log('\n❌ NÃO é possível aplicar o índice único com duplicatas existentes');
            console.log('Resolva os conflitos primeiro e execute o script novamente');
            
        } else {
            console.log('✅ Nenhuma duplicata encontrada!');
            
            // 4. Testar a nova validação
            console.log('\n🧪 Testando nova validação...');
            
            const testName = 'Teste Único';
            
            try {
                // Tentar criar criança com nome de teste
                const testKid = new Kid({
                    name: testName,
                    age: 10,
                    pin: '1234',
                    parentId: new mongoose.Types.ObjectId(), // ID fictício
                    familyId: new mongoose.Types.ObjectId() // ID fictício
                });
                await testKid.save();
                console.log('✅ Primeira criança criada com sucesso');
                
                // Tentar criar segunda criança com mesmo nome
                const testKid2 = new Kid({
                    name: testName,
                    age: 10,
                    pin: '5678',
                    parentId: new mongoose.Types.ObjectId(), // ID fictício
                    familyId: new mongoose.Types.ObjectId() // ID fictício
                });
                await testKid2.save();
                console.log('❌ ERRO: Deveria ter falhado (nome duplicado)');
                
            } catch (error) {
                if (error.code === 11000) {
                    console.log('✅ Validação funcionando: Erro ao tentar criar nome duplicado');
                } else {
                    console.log('❌ Erro inesperado:', error.message);
                }
            }
            
            // Limpar dados de teste
            await Kid.deleteMany({ name: testName });
            console.log('🧹 Dados de teste removidos');
        }
        
        console.log('\n🎯 RESUMO:');
        console.log('✅ Índice único global criado em "name"');
        console.log('❌ Nomes duplicados são BLOQUEADOS globalmente');
        console.log('💡 Cada criança deve ter um nome único no sistema');
        
    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Desconectado do MongoDB');
    }
}

applyUniqueNameIndex(); 