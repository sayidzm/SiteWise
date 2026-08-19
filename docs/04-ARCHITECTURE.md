# 04 — Architecture

## Genel mimari

Proje framework'süz, modüler ES Modules mimarisidir.

```text
index.html
   │
   ▼
js/app.js ───────────────┐
   │                     │
   ├─ router.js          │
   ├─ views/*            │ UI render
   ├─ components/*       │
   │                     │
   ▼                     │
services/app-data.js     │
   │                     │
   ▼                     │
storage/index.js         │ composition root
   │                     │
   ├─ LocalStateStore    │ persistence
   ├─ SessionRepository  │ session CRUD/lifecycle
   ├─ WorkoutService     │ workout mutations
   ├─ PreviousService    │ derived history lookup
   ├─ HistoryService     │ derived history
   ├─ ProgressionService │ domain evaluation
   ├─ PRService          │ derived records
   ├─ ProgressService    │ progress read model
   ├─ SettingsService    │ preferences
   └─ PortabilityService │ export/import
```

## Katmanlar

### 1. Static domain data

- `js/data/program-data.js`: reçete ve schedule.
- `js/data/program-content.js`: teknik/form/alternatif/guide içeriği.

Bu katman user data içermez.

### 2. Models

- `js/models/workout-session.js`

Yeni session oluştururken programın gerekli parçalarını snapshot'a çevirir. Böylece ileride program definition değişse bile eski workout'un neyle yapıldığı korunabilir.

### 3. Storage

- `js/storage/schema.js`
- `js/storage/migrations.js`
- `js/storage/storage.js`
- `js/storage/index.js`

Storage state'i versioned ve validate edilir.

### 4. Repository / services

State mutation views içinde yapılmaz. Domain davranışı service/repository üzerinden geçer.

### 5. Views

Views HTML string üretir ve read model kullanır. View'ların görevi storage invariant'ı üretmek değildir.

### 6. App controller

`js/app.js` event delegation, navigation, sheet, timer, settings ve UI action koordinasyonunu yürütür.

## Router

Hash tabanlı SPA:

```text
#home
#workout
#history
#history/<sessionId>
#progress
#progress/<exerciseKey>
#program
#program/<workoutId>
#settings
```

`router.js` browser back/forward ile uyumludur.

## Neden framework yok?

Bu bilinçli ürün/teknoloji kararıdır:

- taşınabilirlik,
- düşük bundle karmaşıklığı,
- basit hosting,
- offline kullanım,
- küçük proje yüzeyi.

Agent kolaylık için framework eklememelidir.

## Dependency direction

Tercih edilen bağımlılık yönü:

```text
View/App
  ↓
Service
  ↓
Repository
  ↓
Store
  ↓
Schema/Migration
```

Program data bağımsız read-only kaynaktır.

## Mimari invariant

**ProgramDefinition != UserWorkoutData**

Bu ayrım bozulmamalıdır.
