/**
 * The app's places, as Prism draws them (docs/design/prism/index.html, SIDE_ITEMS and the tab bar).
 * From 1024 wide the sidebar shows all nine. A phone keeps its five tabs: Research hangs off Portfolio, and Approvals
 * and Imports sit under Settings ("Add them to the sidebar", OWN-02, 5 November 2026). Data sources sits under Settings.
 */
export type Icon =
  | 'home' | 'fan' | 'grid' | 'target' | 'search' | 'shield' | 'layers' | 'db' | 'sliders' | 'chev-r' | 'info' | 'clock'
  | 'person' | 'lock' | 'alert' | 'wifi-off' | 'split' | 'ban';

export interface Place {
  id: string;
  label: string;
  /** The tab bar's shorter label, where it differs. */
  tabLabel?: string;
  icon: Icon;
  path: string;
  /** On a phone, the tab this place hangs off; undefined for the five tabs themselves. */
  under?: string;
  tab: boolean;
}

export const PLACES: readonly Place[] = [
  { id: 'portfolio', label: 'Portfolio', icon: 'home', path: '/', tab: true },
  { id: 'forecasts', label: 'Forecasts', icon: 'fan', path: '/forecasts', tab: true },
  { id: 'segments', label: 'Segments', icon: 'grid', path: '/segments', tab: true },
  { id: 'record', label: 'Track record', tabLabel: 'Record', icon: 'target', path: '/record', tab: true },
  { id: 'research', label: 'Research', icon: 'search', path: '/research', under: 'portfolio', tab: false },
  { id: 'approvals', label: 'Approvals', icon: 'shield', path: '/approvals', under: 'settings', tab: false },
  { id: 'imports', label: 'Imports', icon: 'layers', path: '/imports', under: 'settings', tab: false },
  { id: 'sources', label: 'Data sources', icon: 'db', path: '/sources', under: 'settings', tab: false },
  { id: 'settings', label: 'Settings', icon: 'sliders', path: '/settings', tab: true }
];

export const TABS: readonly Place[] = PLACES.filter((p) => p.tab);

export function placeById(id: string): Place {
  const p = PLACES.find((x) => x.id === id);
  if (!p) throw new Error(`no place ${id}`);
  return p;
}

/** The place a path belongs to; on a phone, a place under a tab lights that tab. */
export function placeOf(pathname: string): Place {
  // Trailing slashes are trimmed by hand, not by a regular expression, so a long run of them stays linear (CodeQL).
  let end = pathname.length;
  while (end > 0 && pathname.charCodeAt(end - 1) === 47) end -= 1;
  const clean = pathname.slice(0, end) || '/';
  // A page inside a place lights that place: /settings/privacy is Settings. Anything else, /holdings among them, is
  // reached from Portfolio and lights it (MP-205).
  return PLACES.find((p) => p.path === clean)
    ?? PLACES.find((p) => p.path !== '/' && clean.startsWith(p.path + '/'))
    ?? placeById('portfolio');
}

export function tabOf(place: Place): Place {
  return place.under ? placeById(place.under) : place;
}

export function childrenOf(id: string): Place[] {
  return PLACES.filter((p) => p.under === id);
}
