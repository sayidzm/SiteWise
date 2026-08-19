class PWAService {
  constructor() {
    this.installPrompt = null;
    this.registration = null;
    this.registrationError = null;
    this.#bindInstallEvents();
  }

  async register() {
    const nav = globalThis.navigator;
    if (!nav || !("serviceWorker" in nav)) return this.getStatus();
    if (!this.#canRegisterHere()) return this.getStatus();

    try {
      this.registration = await nav.serviceWorker.register("./sw.js", { scope: "./" });
      this.registrationError = null;
    } catch (error) {
      console.warn("Service worker registration failed.", error);
      this.registrationError = error;
    }
    return this.getStatus();
  }

  getStatus() {
    const standalone = Boolean(
      globalThis.matchMedia?.("(display-mode: standalone)")?.matches ||
      globalThis.navigator?.standalone
    );

    const nav = globalThis.navigator;
    return {
      serviceWorkerSupported: Boolean(nav && "serviceWorker" in nav),
      secureContext: this.#canRegisterHere(),
      controlled: Boolean(nav?.serviceWorker?.controller),
      registered: Boolean(this.registration),
      installAvailable: Boolean(this.installPrompt),
      installed: standalone,
      registrationError: this.registrationError,
    };
  }

  async promptInstall() {
    if (!this.installPrompt) return { available: false, outcome: null };
    const prompt = this.installPrompt;
    this.installPrompt = null;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    return { available: true, outcome: choice?.outcome ?? null };
  }

  #bindInstallEvents() {
    globalThis.addEventListener?.("beforeinstallprompt", (event) => {
      event.preventDefault();
      this.installPrompt = event;
      globalThis.dispatchEvent?.(new CustomEvent("pwa-install-available"));
    });

    globalThis.addEventListener?.("appinstalled", () => {
      this.installPrompt = null;
      globalThis.dispatchEvent?.(new CustomEvent("pwa-installed"));
    });
  }

  #canRegisterHere() {
    const protocol = globalThis.location?.protocol;
    const hostname = globalThis.location?.hostname;
    return protocol === "https:" || (protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(hostname));
  }
}

export const PWA = new PWAService();
