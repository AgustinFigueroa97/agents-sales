# Agente de Ventas Mayoristas - WhatsApp

Sistema de ventas por mayor mediante agente conversacional de IA integrado con WhatsApp.

## Arquitectura

El sistema consta de:
- API REST con webhook para Twilio
- Agente conversacional con memoria por usuario
- Base de datos PostgreSQL con 100 productos insertados 
- 3 herramientas (tools) para búsqueda, creación y edición de carritos

## Stack Tecnológico

- Node.js + Express
- PostgreSQL
- LangChain + OpenAI
- Twilio WhatsApp API
- Railway (deployment)

## Variables de Entorno
```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
PORT=3000
```

## Estructura del Proyecto
```
agents-sales/
├── src/
│   ├── config/          # Conexión BD
│   ├── controllers/     # Lógica de rutas
│   ├── services/        # Lógica de negocio
│   ├── tools/           # Herramientas LangChain
│   └── routes/          # Definición de endpoints
├── sql/                 # Scripts de BD
├── scripts/             # Utilidades
├── index.js             # Inicio App
├── scripts/             # Scripts para insertar productos en la BD 

```