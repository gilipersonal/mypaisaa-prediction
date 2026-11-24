/**
 * A table whose rows each open a page (Prism: "table.ht tbody tr { cursor: pointer; }"). The link inside each row is the
 * way a keyboard and a screen reader open it; a press anywhere else on the row follows that same link. Nothing is drawn.
 */
export default function rowLinks(node: HTMLElement): () => void {
  const press = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0) return;
    const target = e.target as Element | null;
    if (!target || target.closest('a, button')) return;
    const link = target.closest('tr')?.querySelector<HTMLAnchorElement>('a[href]');
    link?.click();
  };
  node.addEventListener('click', press);
  return () => node.removeEventListener('click', press);
}
