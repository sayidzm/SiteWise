const ITEMS = [
  { route: "home", label: "Home", icon: "⌂" },
  { route: "workout", label: "Workout", icon: "▶" },
  { route: "history", label: "History", icon: "◷" },
  { route: "progress", label: "Progress", icon: "↗" },
  { route: "program", label: "Program", icon: "☰" },
];

export function renderBottomNav(container, activeRoute) {
  container.innerHTML = ITEMS.map((item) => {
    const active = activeRoute === item.route || activeRoute.startsWith(`${item.route}/`);
    return `
      <a class="nav-item${active ? " is-active" : ""}" href="#${item.route}" ${active ? 'aria-current="page"' : ""}>
        <span class="nav-icon" aria-hidden="true">${item.icon}</span>
        <span>${item.label}</span>
      </a>
    `;
  }).join("");
}
