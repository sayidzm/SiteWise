# System Patterns

- Static program data → `program-data.js` / `program-content.js`.
- Session creation program snapshot üretir.
- Root state versioned LocalStorage'dadır.
- Mutations: View/App → Service → Repository → Store.
- Previous/History/PR/Progress persistent duplicate stores değil, sessions'dan derived read models.
- Rest timing timestamp-based.
- Import preflight + pre-import snapshot + replace.
- PWA cache app files içindir, user data değil.

Detay: `../docs/04-ARCHITECTURE.md`, `../docs/07-STORAGE-AND-INTEGRITY.md`.
