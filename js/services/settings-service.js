export const DEFAULT_SETTINGS = Object.freeze({
  keepScreenAwake: true,
  restTimerVibration: true,
  confirmIncompleteFinish: true,
});

const ALLOWED_KEYS = new Set(Object.keys(DEFAULT_SETTINGS));

export class SettingsService {
  constructor(store) {
    this.store = store;
  }

  getAll() {
    const saved = this.store.load().settings ?? {};
    return {
      ...DEFAULT_SETTINGS,
      ...Object.fromEntries(
        Object.entries(saved).filter(([key, value]) => ALLOWED_KEYS.has(key) && typeof value === "boolean")
      ),
    };
  }

  get(key) {
    if (!ALLOWED_KEYS.has(key)) throw new Error(`Unknown setting: ${key}`);
    return this.getAll()[key];
  }

  set(key, value) {
    if (!ALLOWED_KEYS.has(key)) throw new Error(`Unknown setting: ${key}`);
    if (typeof value !== "boolean") throw new TypeError(`${key} must be boolean.`);

    this.store.update((state) => {
      state.settings[key] = value;
    });

    return this.getAll();
  }

  reset() {
    this.store.update((state) => {
      state.settings = {};
    });
    return this.getAll();
  }
}
