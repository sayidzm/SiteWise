# Workout Tracker — AI Agent Context Pack

Bu paket, Workout Tracker kod tabanını başka AI coding agentlara öğretmek/delege etmek için hazırlanmıştır.

## En hızlı kullanım

Yeni agenta proje kodunu ve bu klasörü birlikte ver. Ardından `prompts/MAIN-AGENT-PROMPT.md` içeriğini başlangıç promptu olarak gönder.

Agentın ilk dosyası: `AGENTS.md`.

## Paket yapısı

```text
AGENTS.md                 Universal agent sözleşmesi
CLAUDE.md                 Claude giriş yönlendirmesi
GEMINI.md                 Gemini giriş yönlendirmesi
CODEX.md                  Codex giriş yönlendirmesi

docs/                     Derin teknik/domain dokümantasyon
memory-bank/              Cline/Cursor benzeri memory-bank formatı
prompts/                  Copy-paste agent promptları
sources/                  Orijinal source-of-truth ve güncel README/QA
```

## Önemli

Bu paket kodun yerine geçmez. Agent göreve başlamadan ilgili gerçek source ve test dosyalarını da okumalıdır.
