/**
 * The controls Home draws whose act is not built in this step. Pressing one writes nothing: it only shows, directly after
 * itself, one sentence saying the act comes in a later build step. Nothing is drawn at rest.
 */
class Later {
  open: Record<string, boolean> = $state({});

  press(id: string): void {
    this.open[id] = true;
  }

  /** Enter or Space on a drawn control that is not a native button (the design's role="button" tiles and rows). */
  key(id: string, e: KeyboardEvent): void {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this.press(id);
  }

  reset(): void {
    this.open = {};
  }
}

export const later = new Later();
