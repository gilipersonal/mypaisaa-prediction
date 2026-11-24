import { expect, type Page } from '@playwright/test';

/** Signs in with the pretend passkey and waits for the app. */
export async function signIn(page: Page, path = '/'): Promise<void> {
  await page.goto(`/signin?next=${encodeURIComponent(path)}`);
  await page.getByRole('button', { name: 'Continue with a passkey' }).click();
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page).not.toHaveURL(/\/signin/);
}
