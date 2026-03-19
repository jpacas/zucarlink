# TODOS

Deferred work tracked by component and priority (P0 = critical blocker → P4 = nice to have).

---

## ZucarIA / RAG

### Upgrade embedding search to pgvector (P2)
**Why:** Current RAG uses a full table scan (LIMIT 500) with in-memory cosine similarity. At 500+ posts this returns stale/incomplete results and uses significant memory.
**How to apply:** Migrate PostEmbeddings to use pgvector extension (or switch to Pinecone); replace findRelevantPosts with `SELECT ... <=> query_embedding ORDER BY LIMIT topN` — reduces O(n) to O(log n).
**Depends on:** MySQL → PostgreSQL migration OR separate vector DB (Pinecone/Weaviate)
**Files:** `backend/src/services/embeddingService.js`, `backend/src/models/PostEmbedding.js`

### ZucarIA usage limits for free tier (P1)
**Why:** Free users have unlimited ZucarIA access. The plan specifies a limit (20 messages/month) to create upgrade incentive toward Pro plan. Without this, there's no clear push to upgrade.
**How to apply:** Add `zucariaMessagesThisMonth` counter to User model; reset via monthly cron; planGateMiddleware checks counter and returns 429 with upgrade prompt for free users over limit.
**Files:** `backend/src/models/User.js`, new migration, `backend/src/middleware/planGateMiddleware.js`, `frontend/src/pages/ZucarIA.tsx`

---

## Monetización / Stripe

### Creator marketplace with Stripe Connect (P2)
**Why:** The plan includes a marketplace where engineers sell papers/guides (Zucarlink takes 20% commission). This unlocks a third revenue stream beyond empresa subscriptions and Pro plan.
**How to apply:** New models `Publicacion` + `Compra`; Stripe Connect for direct creator payouts (requires KYC); pre-signed S3 URLs for content delivery; buy flow with Stripe PaymentIntent.
**Decision needed:** Direct Stripe Connect payouts (requires KYC) vs. manual wallet accumulation — affects implementation complexity significantly.
**Files:** New `Publicacion.js`, `Compra.js` models + migrations, new routes/controllers, `frontend/src/pages/Publicaciones.tsx`, `CrearPublicacion.tsx`

---

## Comunidad / Forum

### Mark post as "Solved" / accept answer (P2)
**Why:** Stack Overflow-style accepted answers improve the signal-to-noise ratio of the forum and give top contributors a visible badge. Also adds +20 reputation for the author of the accepted answer.
**How to apply:** Add `solucionComentarioId` field to Post; POST endpoint to mark; highlight accepted answer in PostDetalle UI.
**Files:** `backend/src/models/Post.js`, migration, `backend/src/controllers/postController.js`, `frontend/src/pages/PostDetalle.tsx`

---

## Perfiles / Comunidad

### Admin panel for "Experto Verificado" badge (P3)
**Why:** The plan specifies a manually-granted "Experto Verificado" badge for top experts. Currently there's no admin UI to grant it.
**How to apply:** Add `expertoBadge` boolean to User; admin-only PUT endpoint; minimal admin UI to search users and grant badge.
**Files:** `backend/src/models/User.js`, new migration, new admin route + controller, simple admin page in frontend

---

## Infraestructura

### Multilingüe (inglés/portugués) (P4)
**Why:** To reach sugar engineers in Brazil and anglophone Caribbean markets. Deferred until LATAM Spanish market is validated.
**How to apply:** i18n library (react-i18next); translation files per language; language switcher in header.
**Files:** `frontend/src/` (all pages)

---

## Completed

_Nothing completed yet — this is the initial TODOS.md._
