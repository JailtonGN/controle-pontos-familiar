# 🔧 Atualizar Configuração do Render

## 📋 **INSTRUÇÕES PARA ATUALIZAR O RENDER**

### 1. **Acessar o Render**
1. Vá para [render.com](https://render.com)
2. Faça login com sua conta GitHub
3. Acesse seu serviço `controle-pontos-familiar`

### 2. **Atualizar Environment Variables**
1. Clique em "Environment" no menu lateral
2. Procure pela variável `MONGODB_URI`
3. Clique em "Edit" ou "Update"
4. Substitua o valor atual por:

```
mongodb+srv://deejaymax2010:TyCsPlZNsDWOM46N@cluster1.3mduppm.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority&appName=Cluster1
```

### 3. **Salvar e Rebuild**
1. Clique em "Save Changes"
2. O Render fará rebuild automático
3. Aguarde alguns minutos

### 4. **Verificar Logs**
1. No Render, vá em "Logs"
2. Procure por estas mensagens:
```
✅ MongoDB conectado: ac-z1yz7xv-shard-00-00.3mduppm.mongodb.net
📊 Database: controle-pontos-familiar
```

### 5. **Testar API**
1. Acesse: `https://controle-pontos-familiar.onrender.com/api/health`
2. Deve retornar sucesso

## 🎯 **RESULTADO ESPERADO**
- ✅ Conexão com MongoDB Atlas funcionando
- ✅ Aplicação rodando no Render
- ✅ Botão "apagar" funcionando corretamente
- ✅ Mensagens sendo deletadas do banco

## ⚠️ **IMPORTANTE**
- A senha atual é: `TyCsPlZNsDWOM46N`
- Mantenha essa senha segura
- Se precisar alterar, atualize tanto o Render quanto o arquivo `.env` local 