import { LocalStateStore } from "./storage.js";
import { SessionRepository } from "../services/session-repository.js";
import { WorkoutSessionService } from "../services/workout-session-service.js";
import { PreviousPerformanceService } from "../services/previous-performance-service.js";
import { HistoryService } from "../services/history-service.js";
import { ProgressionService } from "../services/progression-service.js";
import { PRService } from "../services/pr-service.js";
import { ProgressService } from "../services/progress-service.js";
import { SettingsService } from "../services/settings-service.js";
import { DataPortabilityService } from "../services/data-portability-service.js";

export function createWorkoutDataLayer(options = {}) {
  const store = new LocalStateStore(options);
  const sessions = new SessionRepository(store);
  const workouts = new WorkoutSessionService(sessions);
  const previous = new PreviousPerformanceService(sessions);
  const history = new HistoryService(sessions);
  const progression = new ProgressionService(sessions);
  const prs = new PRService(sessions);
  const progress = new ProgressService(sessions, progression, prs);
  const settings = new SettingsService(store);
  const portability = new DataPortabilityService(store, options);

  return Object.freeze({ store, sessions, workouts, previous, history, progression, prs, progress, settings, portability });
}
