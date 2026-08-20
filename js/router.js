const DEFAULT_ROUTE = "home";

export function getRoute() {
  const raw = window.location.hash.replace(/^#\/?/, "").trim();
  return raw || DEFAULT_ROUTE;
}

export function getRootRoute(route) {
  return route.split("?")[0].split("/")[0];
}

export function navigate(route) {
  const next = `#${route}`;
  if (window.location.hash === next) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }
  window.location.hash = next;
}

export function startRouter(render) {
  const onChange = () => render(getRoute());
  window.addEventListener("hashchange", onChange);
  onChange();
  return () => window.removeEventListener("hashchange", onChange);
}
