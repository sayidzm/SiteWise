export class WakeLockService {
  constructor(navigatorRef = globalThis.navigator) {
    this.navigator = navigatorRef;
    this.sentinel = null;
    this.requesting = null;
  }

  get supported() {
    return Boolean(this.navigator?.wakeLock?.request);
  }

  get active() {
    return Boolean(this.sentinel && !this.sentinel.released);
  }

  async acquire() {
    if (!this.supported) return { supported: false, active: false };
    if (this.active) return { supported: true, active: true };
    if (this.requesting) return this.requesting;

    this.requesting = this.navigator.wakeLock.request("screen")
      .then((sentinel) => {
        this.sentinel = sentinel;
        sentinel.addEventListener?.("release", () => {
          if (this.sentinel === sentinel) this.sentinel = null;
        }, { once: true });
        return { supported: true, active: true };
      })
      .catch(() => ({ supported: true, active: false }))
      .finally(() => {
        this.requesting = null;
      });

    return this.requesting;
  }

  async release() {
    const sentinel = this.sentinel;
    this.sentinel = null;
    if (!sentinel || sentinel.released) return;

    try {
      await sentinel.release();
    } catch {
      // Wake Lock is progressive enhancement; release failures must not break the workout.
    }
  }
}
