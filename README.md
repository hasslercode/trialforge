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
- Local/dev store: `.data/sync` on disk  
- **Vercel/production (required):** Upstash/KV Redis via Marketplace, then redeploy. Accepted env names:
  - `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Marketplace default), or
  - `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
  - Check with `GET /api/sync` (`backend` / `redisEnv`, no secrets).  
  Without Redis env vars the API returns `503`.  
- Optional: `SYNC_DATA_DIR` to override the filesystem path in local/dev  

## Cliente actual

**Bancolombia Frontend** — 5 fases · 3 horas · ≥ 70%: Angular API → 5 AWS → 5 HTML/CSS (Grid) → TypeScript curry → 5 Angular MCQ.
