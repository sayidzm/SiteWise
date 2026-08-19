import { validateWorkoutSession } from "../storage/schema.js";

export class SessionRepository {
  constructor(store) {
    this.store = store;
  }

  getState() {
    return this.store.load();
  }

  getActiveSession() {
    const state = this.store.load();
    return state.activeSessionId ? clone(state.sessions[state.activeSessionId]) : null;
  }

  getSession(sessionId) {
    const session = this.store.load().sessions[sessionId];
    return session ? clone(session) : null;
  }

  listSessions({ includeDiscarded = false } = {}) {
    return Object.values(this.store.load().sessions)
      .filter((session) => includeDiscarded || session.status !== "discarded")
      .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
      .map(clone);
  }

  createSession(session) {
    assertValidSession(session);

    return this.store.update((state) => {
      if (state.activeSessionId) {
        throw new Error("An active workout already exists. Resume or discard it before starting another.");
      }
      if (state.sessions[session.id]) throw new Error(`Session already exists: ${session.id}`);

      state.sessions[session.id] = clone(session);
      state.activeSessionId = session.id;
    }).sessions[session.id];
  }

  updateSession(sessionId, updater) {
    let updatedSession;

    this.store.update((state) => {
      const session = state.sessions[sessionId];
      if (!session) throw new Error(`Unknown session: ${sessionId}`);
      if (session.status !== "in_progress") throw new Error("Only in-progress sessions can be edited.");

      const draft = clone(session);
      const result = updater(draft);
      updatedSession = result ?? draft;
      updatedSession.updatedAt = new Date().toISOString();
      assertValidSession(updatedSession);
      state.sessions[sessionId] = updatedSession;
    });

    return clone(updatedSession);
  }

  completeSession(sessionId, completedAt = new Date().toISOString()) {
    return this.#finish(sessionId, "completed", completedAt);
  }

  discardSession(sessionId, discardedAt = new Date().toISOString()) {
    return this.#finish(sessionId, "discarded", discardedAt);
  }

  #finish(sessionId, status, timestamp) {
    let finished;

    this.store.update((state) => {
      const session = state.sessions[sessionId];
      if (!session) throw new Error(`Unknown session: ${sessionId}`);
      if (session.status !== "in_progress") throw new Error("Session is already finished.");

      session.status = status;
      session.updatedAt = timestamp;
      if (status === "completed") session.completedAt = timestamp;
      if (status === "discarded") session.discardedAt = timestamp;
      state.activeSessionId = state.activeSessionId === sessionId ? null : state.activeSessionId;
      finished = clone(session);
    });

    return finished;
  }
}

function assertValidSession(session) {
  const validation = validateWorkoutSession(session);
  if (!validation.valid) throw new Error(`Invalid workout session: ${validation.errors.join(" ")}`);
}

function clone(value) {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
