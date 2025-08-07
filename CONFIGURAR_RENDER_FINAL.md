# 🚀 Configurar Render com Nova Senha do MongoDB

## 📋 Informações do MongoDB Atlas
- **Usuário**: `deejaymax2010`
- **Senha**: `TyCsPlZNsDWOM46N`
- **Database**: `controle-pontos-familiar`

## 🔧 String de Conexão Completa

```
mongodb+srv://deejaymax2010:TyCsPlZNsDWOM46N@SEU_CLUSTER.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
```

**⚠️ IMPORTANTE**: Substitua `SEU_CLUSTER` pelo nome do seu cluster no MongoDB Atlas

## 🚀 Passos para Configurar no Render

### 1. **Acessar o Render**
1. Vá para [render.com](https://render.com)
2. Faça login na sua conta
3. Encontre o serviço `controle-pontos-familiar`

### 2. **Atualizar a Variável de Ambiente**
1. Clique no serviço `controle-pontos-familiar`
2. Vá para a aba **"Environment"**
3. Encontre a variável `MONGODB_URI`
4. Clique em **"Edit"**

### 3. **Substituir a String de Conexão**
Cole a string completa (substituindo `SEU_CLUSTER` pelo nome do seu cluster):

```
mongodb+srv://deejaymax2010:TyCsPlZNsDWOM46N@SEU_CLUSTER.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
```

### 4. **Salvar e Aguardar**
1. Clique em **"Save Changes"**
2. O Render fará deploy automático
3. Aguarde alguns minutos para o deploy completar

### 5. **Verificar se Funcionou**
1. Acesse: `https://controle-pontos-familiar.onrender.com/api/health`
2. Deve retornar uma resposta de sucesso
3. Teste o login na aplicação

## 🔍 Testar Localmente (Opcional)

Se quiser testar antes de atualizar no Render:

1. **Criar arquivo `.env`**:
```env
MONGODB_URI=mongodb+srv://deejaymax2010:TyCsPlZNsDWOM46N@SEU_CLUSTER.mongodb.net/controle-pontos-familiar?retryWrites=true&w=majority
JWT_SECRET=sua_chave_secreta_aqui
NODE_ENV=development
PORT=3000
```

2. **Testar conexão**:
```bash
npm run test-new-password
```

## 🚨 Troubleshooting

### **Se a aplicação não funcionar**:
1. Verifique os logs no Render
2. Confirme se a string de conexão está correta
3. Verifique se o cluster está ativo no MongoDB Atlas
4. Confirme se o IP whitelist está configurado

### **Se houver erro de conexão**:
1. Verifique se o usuário `deejaymax2010` existe
2. Confirme se a senha `TyCsPlZNsDWOM46N` está correta
3. Teste a conexão localmente primeiro

## 📞 URLs Importantes

- **Aplicação**: `https://controle-pontos-familiar.onrender.com`
- **API Health**: `https://controle-pontos-familiar.onrender.com/api/health`
- **Dashboard**: `https://controle-pontos-familiar.onrender.com/dashboard`

## 🎯 Comandos Úteis

```bash
# Gerar string de conexão
npm run generate-connection

# Testar nova senha localmente
npm run test-new-password

# Testar conexão geral
npm run test-db
```

---

**✅ Após seguir estes passos, sua aplicação estará funcionando com a nova senha!** 