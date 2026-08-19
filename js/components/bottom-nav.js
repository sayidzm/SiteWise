const ICONS = {
  home: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5 12 3l8.5 7.5"/><path d="M5.5 9v11h13V9"/><path d="M9.5 20v-6h5v6"/></svg>`,
  play: `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z"/></svg>`,
  history: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 7.5H9v-4"/><path d="M5.2 6.3A8.5 8.5 0 1 1 3.8 15"/><path d="M12 7.5V12l3 2"/></svg>`,
  progress: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/></svg>`,
  program: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
};

const ITEMS = [
  { route: "home", label: "Ana Sayfa" },
  { route: "history", label: "Geçmiş" },
  { route: "workout", label: "Workout", fab: true },
  { route: "progress", label: "İlerleme" },
  { route: "program", label: "Program" },
];

export function renderBottomNav(container, activeRoute) {
  container.innerHTML = ITEMS.map((item) => {
    const active = activeRoute === item.route || activeRoute.startsWith(`${item.route}/`);
    if (item.fab) {
      return `
        <a class="nav-item is-fab${active ? " is-active" : ""}" href="#${item.route}" aria-label="${item.label}" ${active ? 'aria-current="page"' : ""}>
          <span class="nav-fab" aria-hidden="true">${ICONS.play}</span>
        </a>
      `;
    }
    return `
      <a class="nav-item${active ? " is-active" : ""}" href="#${item.route}" ${active ? 'aria-current="page"' : ""}>
        <span class="nav-icon" aria-hidden="true">${ICONS[item.route]}</span>
        <span>${item.label}</span>
      </a>
    `;
  }).join("");
}