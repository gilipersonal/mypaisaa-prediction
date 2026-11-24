import type { FreshMode } from './run.ts';

/** What the page in view tells the frame around it: the sidebar's Data row follows the page's pinned freshness mode. */
class FrameInfo {
  fresh: FreshMode = $state(undefined);
}
export const frameInfo = new FrameInfo();
