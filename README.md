# Agente de Ventas Mayoristas - WhatsApp

Agente de IA para venta de ropa por mayor mediante WhatsApp.

## Stack Tecnológico
- Node.js + Express
- PostgreSQL
- LangChain (GPT-4o-mini)
- Twilio WhatsApp API

## Variables de Entorno Requeridas
```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
PORT=3000
```

## Deployment
Ver instrucciones en Railway.
```

---

## 🚀 Checklist antes de deployar:
```
✅ .env no está en el repo
✅ .gitignore incluye .env y node_modules
✅ package.json tiene "engines"
✅ README.md creado
✅ products.xlsx en el repo
✅ sql/create_tables.sql en el repo