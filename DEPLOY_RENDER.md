# 🚀 GUIA DE DEPLOY NO RENDER - API

## Passo 1: Criar Web Service

1. Acesse: https://dashboard.render.com/
2. Clique em **"New +"** → **"Web Service"**
3. Conecte seu repositório: `https://github.com/FabioRagnarDEV/embracon-comunicacao-api.git`

## Passo 2: Configurações Básicas

```
Name: embracon-api
Region: Oregon (US West)
Branch: main
Runtime: Node
Build Command: npm install
Start Command: node index.refatorado.js
```

## Passo 3: Plano

- **Free** (para testes) ou **Starter** ($7/mês - recomendado para produção)

## Passo 4: Variáveis de Ambiente

Clique em **"Advanced"** e adicione:

```
NODE_ENV = production
PORT = 10000

SUPABASE_URL = https://avrdgsnacuecabqwqzvo.supabase.co
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cmRnc25hY3VlY2FicXdxenZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDMxMTcyOSwiZXhwIjoyMDg5ODg3NzI5fQ.PGW2tXl--a-so6tGq4QpwJeH3YZlaE4rbL3tVnNv6Io

ALLOWED_ORIGINS = https://seu-frontend.onrender.com

RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100
```

⚠️ **IMPORTANTE:** Substitua `https://seu-frontend.onrender.com` pela URL real do frontend depois do deploy!

## Passo 5: Deploy

1. Clique em **"Create Web Service"**
2. Aguarde o build (3-5 minutos)
3. Anote a URL da API: `https://embracon-api.onrender.com`

## ✅ Testar

```bash
curl https://embracon-api.onrender.com/api/status
```

Deve retornar:
```json
{"mensagem":"✅ API da Plataforma Integradora rodando com sucesso!"}
```

---

## 🔧 TROUBLESHOOTING

### Erro: "Application failed to respond"
- Verifique se o comando é: `node index.refatorado.js`
- Verifique se PORT está configurado

### Erro: CORS
- Adicione a URL do frontend em ALLOWED_ORIGINS
- Formato: `https://embracon-web.onrender.com`

### Logs
- Acesse: Dashboard → Seu serviço → Logs
