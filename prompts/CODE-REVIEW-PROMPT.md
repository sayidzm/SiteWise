# Code Review Prompt

```text
Bu Workout Tracker değişikliğini senior code reviewer olarak incele.

Önce AGENTS.md ve ilgili docs dosyalarını oku.

Şunlara özellikle bak:
- Source-of-truth ihlali
- Fake Previous/PR/History
- Program/user-data karışması
- Active workout data loss
- Storage/schema invariant kırılması
- Duplicate IDs / multiple active sessions
- Timestamp/rest bugs
- Import atomicity/recovery
- Progression'ın otomatik kilo artırması
- Mobile overflow / touch target / keyboard
- Accessibility regression
- PWA cache asset mismatch
- Test eksikliği
- Büyük gereksiz rewrite

Review'ü severity sırasıyla ver:
Critical / High / Medium / Low.
Her finding için dosya, davranış, neden ve minimal fix önerisi yaz.
```
