# TrialForge

Plataforma local-first para **simular pruebas técnicas** reales. Hoy corre el track Frontend de Bancolombia; la arquitectura está lista para sumar otros clientes y perfiles.

## Por qué TrialForge

- Flujos por **fases** (MCQ + prácticas) con timer global y umbral de aprobación  
- **Banco grande** con anti-repetición entre corridas  
- Historial de intentos (10 slots · banco completo)  
- Escalable: contenido por cliente (`src/content/<cliente>`)

## Stack

Next.js · React · TypeScript · Tailwind · IndexedDB · sync API (usercode)

## Inicio

```bash
npm install
npm run dev
```

## Progress code (cross-device)

On Home, create a **progress code** (`TF-XXXX-XXXX`). The same code entered on another device restores practices + study checklist.

- Local cache: IndexedDB  
- Sync API: `POST /api/sync`, `GET|PUT /api/sync/:code`  
- Default store: `.data/sync` on disk  
- Production (serverless): set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`  
- Optional: `SYNC_DATA_DIR` to override the filesystem path  

## Cliente actual

**Bancolombia Frontend** — 5 sesiones, 3 horas, ≥ 70%, incluye SQL en teoría/práctica.
