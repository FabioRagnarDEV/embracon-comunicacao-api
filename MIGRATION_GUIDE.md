# 📦 GUIA DE MIGRAÇÃO - v1.0 para v2.0

## Visão Geral

Este guia detalha o processo de migração do código legado (index.js monolítico) para a nova arquitetura refatorada com segurança aprimorada.

---

## ⚠️ ATENÇÃO: AÇÕES CRÍTICAS ANTES DA MIGRAÇÃO

### 1. **ROTACIONAR CREDENCIAIS** (OBRIGATÓRIO)

As credenciais do Supabase foram expostas no repositório. **VOCÊ DEVE:**

```bash
# 1. Acessar o painel do Supabase
# 2. Ir em Settings > API
# 3. Gerar novas chaves (Reset API keys)
# 4. Atualizar o arquivo .env com as novas credenciais
```

### 2. **Backup do Banco de Dados**

```bash
# Fazer backup completo antes da migração
# No painel do Supabase: Database > Backups > Create backup
```

---

## 🔄 PROCESSO DE MIGRAÇÃO

### Passo 1: Preparação

```bash
# 1. Criar branch de migração
git checkout -b migration/v2

# 2. Instalar novas dependências
npm install express-rate-limit express-validator helmet winston dompurify jsdom morgan

# 3. Criar arquivo .env baseado no .env.example
cp .env.example .env

# 4. Configurar variáveis de ambiente
nano .env
```

### Passo 2: Configuração do .env

```env
# Supabase (USAR NOVAS CREDENCIAIS)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_KEY=sua_nova_service_key_aqui

# Servidor
PORT=3000
NODE_ENV=development

# CORS (adicionar domínios permitidos)
ALLOWED_ORIGINS=http://localhost:5173,https://seu-dominio.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### Passo 3: Estrutura de Diretórios

```bash
# Criar estrutura de pastas
mkdir -p src/{routes,controllers,services,middlewares,validators,utils,config}
mkdir -p logs
mkdir -p tests/{unit,integration,e2e}
```

### Passo 4: Migração Gradual

#### Opção A: Migração Completa (Recomendado)

```bash
# 1. Renomear arquivo antigo
mv index.js index.old.js

# 2. Usar novo arquivo principal
mv index.refatorado.js index.js

# 3. Atualizar package.json
mv package.refatorado.json package.json

# 4. Instalar dependências
npm install

# 5. Testar
npm run dev
```

#### Opção B: Migração Gradual (Mais Seguro)

```bash
# 1. Manter ambos os servidores rodando em portas diferentes
# index.old.js na porta 3000
# index.refatorado.js na porta 3001

# 2. Migrar rotas uma por uma
# 3. Testar cada rota
# 4. Quando tudo estiver funcionando, desligar o antigo
```

### Passo 5: Atualização do Frontend

O frontend precisa ser atualizado para enviar o token JWT:

```javascript
// ANTES
fetch('http://localhost:3000/comunicados')

// DEPOIS
const token = localStorage.getItem('token');
fetch('http://localhost:3000/api/comunicados', {
    headers: {
        'Authorization': `Bearer ${token}`
    }
})
```

**Mudanças necessárias no frontend:**

1. Adicionar prefixo `/api` em todas as rotas
2. Incluir header `Authorization` em todas as requisições
3. Tratar erros 401 (não autenticado)
4. Tratar erros 403 (sem permissão)

---

## 🔧 MUDANÇAS NA API

### Rotas Alteradas

| Rota Antiga | Rota Nova | Mudança |
|-------------|-----------|---------|
| `/login` | `/api/auth/login` | Prefixo `/api` |
| `/comunicados` | `/api/comunicados` | Requer autenticação |
| `/scripts/:autor_id` | `/api/scripts` | Usa token para identificar usuário |
| `/relatorios` | `/api/relatorios` | Requer perfil MONITOR_QUALIDADE |
| `/notificacoes/:usuario_id` | `/api/notificacoes` | Usa token para identificar usuário |

### Formato de Resposta

#### Antes:
```json
{
  "erro": "Mensagem de erro"
}
```

#### Depois:
```json
{
  "erro": "Mensagem de erro",
  "detalhes": [
    {
      "campo": "titulo",
      "mensagem": "Título é obrigatório"
    }
  ]
}
```

---

## 🧪 TESTES PÓS-MIGRAÇÃO

### Checklist de Testes

```bash
# 1. Testar autenticação
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@exemplo.com","password":"senha123"}'

# 2. Testar rota protegida sem token (deve retornar 401)
curl http://localhost:3000/api/comunicados

# 3. Testar rota protegida com token
curl http://localhost:3000/api/comunicados \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 4. Testar rate limiting (fazer 10 requisições rápidas)
for i in {1..10}; do
  curl http://localhost:3000/api/status
done

# 5. Testar validação de entrada
curl -X POST http://localhost:3000/api/comunicados \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"titulo":"ab"}' # Deve retornar erro de validação
```

### Testes Funcionais

1. **Login**
   - ✅ Login com credenciais válidas
   - ✅ Login com credenciais inválidas
   - ✅ Login sem email
   - ✅ Login sem senha

2. **Comunicados**
   - ✅ Listar comunicados (autenticado)
   - ✅ Criar comunicado (monitor)
   - ✅ Criar comunicado (atendente) - deve falhar
   - ✅ Editar comunicado
   - ✅ Deletar comunicado
   - ✅ Curtir comunicado

3. **Scripts**
   - ✅ Listar scripts
   - ✅ Criar script
   - ✅ Editar próprio script
   - ✅ Editar script de outro usuário - deve falhar
   - ✅ Deletar script

4. **Upload de Arquivos**
   - ✅ Upload de arquivo válido
   - ✅ Upload de múltiplos arquivos
   - ✅ Upload de arquivo muito grande - deve falhar

---

## 🐛 PROBLEMAS COMUNS E SOLUÇÕES

### Problema 1: "Token inválido ou expirado"

**Causa:** Token JWT expirado ou inválido

**Solução:**
```javascript
// Fazer novo login para obter token válido
// Implementar refresh token (futuro)
```

### Problema 2: "Origem não permitida pelo CORS"

**Causa:** Domínio do frontend não está em ALLOWED_ORIGINS

**Solução:**
```env
# Adicionar domínio ao .env
ALLOWED_ORIGINS=http://localhost:5173,http://seu-dominio.com
```

### Problema 3: "Muitas requisições"

**Causa:** Rate limiting ativado

**Solução:**
```javascript
// Aguardar o tempo especificado
// Ou ajustar limites no .env para desenvolvimento
RATE_LIMIT_MAX_REQUESTS=1000
```

### Problema 4: Logs não aparecem

**Causa:** Diretório `logs/` não existe

**Solução:**
```bash
mkdir logs
chmod 755 logs
```

---

## 📊 MONITORAMENTO PÓS-MIGRAÇÃO

### Métricas para Acompanhar

1. **Taxa de Erro**
   ```bash
   # Verificar logs de erro
   tail -f logs/error.log
   ```

2. **Tempo de Resposta**
   ```bash
   # Verificar logs de acesso
   tail -f logs/access.log | grep "response-time"
   ```

3. **Requisições Bloqueadas**
   ```bash
   # Verificar rate limiting
   grep "Muitas requisições" logs/combined.log
   ```

4. **Tentativas de Login Falhadas**
   ```bash
   # Verificar tentativas suspeitas
   grep "Login falhou" logs/combined.log
   ```

---

## 🔄 ROLLBACK (Se Necessário)

Se algo der errado, você pode voltar para a versão antiga:

```bash
# 1. Parar servidor novo
pm2 stop embracon-api

# 2. Restaurar arquivo antigo
mv index.js index.refatorado.js
mv index.old.js index.js

# 3. Restaurar package.json antigo
git checkout HEAD -- package.json

# 4. Reinstalar dependências antigas
npm install

# 5. Iniciar servidor antigo
npm run dev
```

---

## ✅ CHECKLIST FINAL

Antes de considerar a migração completa:

- [ ] Todas as rotas testadas e funcionando
- [ ] Frontend atualizado e testado
- [ ] Credenciais rotacionadas
- [ ] Logs funcionando corretamente
- [ ] Rate limiting testado
- [ ] CORS configurado corretamente
- [ ] Backup do banco de dados realizado
- [ ] Documentação atualizada
- [ ] Equipe treinada nas mudanças
- [ ] Plano de rollback documentado

---

## 📞 SUPORTE

Em caso de problemas durante a migração:

1. Verificar logs em `logs/error.log`
2. Consultar este guia
3. Verificar o SECURITY_REPORT.md
4. Abrir issue no repositório

---

**Boa sorte com a migração! 🚀**
