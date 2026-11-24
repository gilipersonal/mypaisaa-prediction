/** What the service worker may cache: shell files only, and never anything under /api (MP-134). */
export function shellPaths(paths: readonly string[]): Set<string> {
  const out = new Set<string>();
  for (const p of paths) {
    const abs = p.startsWith('/') ? p : `/${p}`;
    if (!isApi(abs)) out.add(abs);
  }
  return out;
}

export function isApi(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/');
}

export function isShell(pathname: string, shell: ReadonlySet<string>): boolean {
  return !isApi(pathname) && shell.has(pathname);
}
