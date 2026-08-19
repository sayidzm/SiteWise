# 20 — Architecture Decision Record Summary

Bu dosya mevcut önemli kararların "neden"ini korur.

## ADR-001 — Vanilla stack

**Karar:** HTML/CSS/Vanilla JS.

**Neden:** Taşınabilirlik, düşük karmaşıklık, framework bağımlılığı olmadan offline app.

**Sonuç:** Framework migration bir refactor değil, ürün mimarisi değişikliğidir; kullanıcı istemeden yapılmaz.

## ADR-002 — Mobile-first

**Karar:** 390px primary design target.

**Neden:** Gerçek kullanım spor salonunda telefon.

**Sonuç:** Desktop componentleri mobile'a zorla sıkıştırılmaz.

## ADR-003 — Local-first persistence

**Karar:** LocalStorage versioned state.

**Neden:** Backend/auth olmadan hızlı offline recording.

**Sonuç:** Quota/recovery/export kritik hale gelir.

## ADR-004 — Program definition ve user state ayrımı

**Karar:** Static canonical program ayrı, session snapshots ayrı.

**Neden:** Programı user history ile kirletmemek ve historical truth'u korumak.

## ADR-005 — Timestamp-based rest

**Karar:** `restEndsAt` persisted.

**Neden:** JS interval background/reload sırasında güvenilir zaman kaynağı değildir.

## ADR-006 — Derived Previous/PR/Progress

**Karar:** Fake veya bağımsız stale cache yerine completed sessions'dan türet.

**Neden:** Tek gerçek performans kaynağı ve tutarlılık.

## ADR-007 — Conservative progression

**Karar:** `candidate`, otomatik load mutation değil.

**Neden:** Teknik, ağrı, momentum otomatik ölçülemez; source program güvenliği.

## ADR-008 — Primary + backup + pre-import

**Karar:** Rolling backup ve dedicated import undo snapshot ayrı.

**Neden:** Normal recovery ile destructive import undo farklı lifecycle'lardır.

## ADR-009 — PWA cache yalnız app shell

**Karar:** Workout data Cache Storage'a konmaz.

**Neden:** User state ownership ve cache lifecycle'ı birbirinden ayrı kalmalı.
