const ICONS = {
  home: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 10.5 12 3l8.5 7.5"/><path d="M5.5 9v11h13V9"/><path d="M9.5 20v-6h5v6"/></svg>`,
  workout: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9v6M18 9v6M3.5 10.5v3M20.5 10.5v3M6 12h12"/></svg>`,
  history: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 7.5H9v-4"/><path d="M5.2 6.3A8.5 8.5 0 1 1 3.8 15"/><path d="M12 7.5V12l3 2"/></svg>`,
  progress: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 19V5"/><path d="M4 19h16"/><path d="m7 15 4-4 3 2 5-6"/></svg>`,
  program: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>`,
};

const ITEMS = [
  { route: "home", label: "Home" },
  { route: "workout", label: "Workout" },
  { route: "history", label: "History" },
  { route: "progress", label: "Progress" },
  { route: "program", label: "Program" },
];

export function renderBottomNav(container, activeRoute) {
  container.innerHTML = ITEMS.map((item) => {
    const active = activeRoute === item.route || activeRoute.startsWith(`${item.route}/`);
    return `
      <a class="nav-item${active ? " is-active" : ""}" href="#${item.route}" ${active ? 'aria-current="page"' : ""}>
        <span class="nav-icon" aria-hidden="true">${ICONS[item.route]}</span>
        <span>${item.label}</span>
      </a>
    `;
  }).join("");
}
