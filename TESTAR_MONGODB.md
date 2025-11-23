# 🧪 Testar Conexão com MongoDB Atlas

## 🎯 Objetivo

Este script testa a conexão com seu MongoDB Atlas e verifica se tudo está funcionando corretamente.

---

## 🚀 Como Usar

### Passo 1: Obter URL do Cluster

1. Acesse: https://cloud.mongodb.com
2. Faça login
3. Clique em **"Database"** no menu lateral
4. No seu cluster, clique em **"Connect"**
5. Selecione **"Connect your application"**
6. Copie apenas a parte da URL (sem `mongodb+srv://`)

**Exemplo:**
```
cluster0.abc123.mongodb.net
```

### Passo 2: Executar o Teste

```bash
npm run test-atlas
```

### Passo 3: Informar a URL

Quando solicitado, cole a URL do cluster:
```
Digite a URL do cluster (sem mongodb+srv://): cluster0.abc123.mongodb.net
```

---

## ✅ Resultado Esperado

Se tudo estiver correto, você verá:

```
╔════════════════════════════════════════════════════════════╗
║     TESTE DE CONEXÃO - MONGODB ATLAS                      ║
╚════════════════════════════════════════════════════════════╝

📝 Suas credenciais:
   Usuário: ninformax_db_user
   Senha: 9AUQFEgSIOAk7LDz

🔄 Testando conexão...
✅ CONEXÃO ESTABELECIDA COM SUCESSO!

📊 Informações do Banco de Dados:

   📁 Banco: controle-pontos-familiar
   📚 Collections: 0
      (Nenhuma collection criada ainda)

   🖥️  Versão MongoDB: 7.0.x
   ⏱️  Uptime: X minutos

🧪 Testando operação de escrita...
   ✅ Escrita bem-sucedida
🧪 Testando operação de leitura...
   ✅ Leitura bem-sucedida
   ✅ Limpeza bem-sucedida

╔════════════════════════════════════════════════════════════╗
║                    TESTE CONCLUÍDO                         ║
╚════════════════════════════════════════════════════════════╝

✅ Todas as operações foram bem-sucedidas!
✅ Sua conexão com MongoDB Atlas está funcionando perfeitamente!

📋 String de Conexão para usar no Render:

mongodb+srv://ninformax_db_user:9AUQFEgSIOAk7LDz@cluster0.abc123.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority

💡 Copie esta string e adicione como variável MONGODB_URI no Render
```

---

## ❌ Possíveis Erros

### Erro: "MongoServerSelectionError"

**Mensagem:**
```
❌ ERRO AO CONECTAR COM MONGODB ATLAS
```

**Possíveis causas:**
1. URL do cluster incorreta
2. Credenciais inválidas
3. IP não está na whitelist
4. Cluster não está ativo

**Soluções:**

#### 1. Verificar URL do Cluster
- Acesse MongoDB Atlas
- Confirme a URL do cluster
- Copie novamente

#### 2. Verificar Credenciais
- Usuário: `ninformax_db_user`
- Senha: `9AUQFEgSIOAk7LDz`
- Se mudou, atualize no script

#### 3. Adicionar IP na Whitelist
1. Acesse MongoDB Atlas
2. Vá em **"Network Access"**
3. Clique em **"Add IP Address"**
4. Selecione **"Allow Access from Anywhere"**
5. IP: `0.0.0.0/0`
6. Clique em **"Confirm"**
7. Aguarde 1-2 minutos

#### 4. Verificar Status do Cluster
- Acesse MongoDB Atlas
- Verifique se o cluster está "Active"
- Se foi criado recentemente, aguarde alguns minutos

---

## 🔍 O Que o Script Testa

1. ✅ **Conexão** - Estabelece conexão com MongoDB Atlas
2. ✅ **Autenticação** - Verifica usuário e senha
3. ✅ **Leitura** - Testa operação de leitura
4. ✅ **Escrita** - Testa operação de escrita
5. ✅ **Informações** - Obtém dados do banco
6. ✅ **Limpeza** - Remove dados de teste

---

## 📋 Informações Exibidas

- **Nome do banco:** controle-pontos-familiar
- **Collections:** Lista todas as collections
- **Documentos:** Conta documentos em cada collection
- **Versão MongoDB:** Versão do servidor
- **Uptime:** Tempo que o servidor está ativo
- **String de conexão:** Para usar no Render

---

## 💡 Dicas

### Primeira Vez
- É normal não ter collections ainda
- O banco será criado automaticamente
- Collections serão criadas ao inserir dados

### Após Criar Admin
Execute novamente para ver:
- Collections criadas (users, families, etc)
- Número de documentos

### Antes do Deploy
- Execute este teste para confirmar que tudo está OK
- Copie a string de conexão exibida
- Use no Render como MONGODB_URI

---

## 🔗 Próximos Passos

Após o teste bem-sucedido:

1. ✅ Copie a string de conexão
2. ✅ Acesse Render: https://dashboard.render.com
3. ✅ Configure variável MONGODB_URI
4. ✅ Faça deploy
5. ✅ Crie primeiro admin
6. ✅ Acesse sistema

---

## 📞 Precisa de Ajuda?

### Documentação
- [GUIA_DEPLOY_PRODUCAO.md](GUIA_DEPLOY_PRODUCAO.md)
- [SUAS_CREDENCIAIS_MONGODB.md](SUAS_CREDENCIAIS_MONGODB.md)

### Links Úteis
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Render:** https://dashboard.render.com

---

## 🎯 Resumo

| Comando | Descrição |
|---------|-----------|
| `npm run test-atlas` | Testar conexão MongoDB Atlas |
| `npm run create-admin` | Criar primeiro administrador |
| `npm run test-server` | Servidor de teste local |
| `npm start` | Iniciar servidor normal |

---

**Boa sorte com o teste! 🚀**

*Guia criado em: ${new Date().toLocaleDateString('pt-BR')}*
