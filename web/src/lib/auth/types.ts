/**
 * The sign-in contract the screens use (IdentitySession, MP-73). It is shaped like Cognito's: Google or a passkey,
 * no passwords, one owner. The screens never see a token: a session here is only what the app needs to show.
 */
export type Method = 'passkey' | 'google';

export interface Session {
  /** An opaque reference to the owner, never an email or a provider id. */
  subject: string;
  method: Method;
  /** Epoch milliseconds. */
  signedInAt: number;
  expiresAt: number;
  /** Where this session is valid; a session from another environment is refused (MP-73). */
  environment: string;
}

/** Why a sign-in did not complete. Each maps to one drawn state of the sign-in screen (Privacy journey). */
export type SignInFailure =
  | 'provider_unavailable' // Google cannot be reached; a passkey still works
  | 'denied' // wrong account or environment; a matching email is never enough
  | 'rate_limited' // too many tries; says nothing about whether an account exists
  | 'offline'
  | 'cancelled';

export type SignInResult = { ok: true; session: Session } | { ok: false; reason: SignInFailure };

export interface IdentityProvider {
  /** Shown on the sign-in screen, so a pretend provider can never pass for the real one. */
  readonly label: string;
  readonly environment: string;
  /** Whether this device already holds a passkey; a new device signs in with Google first. */
  hasPasskeyHere(): boolean;
  googleAvailable(): boolean;
  signIn(method: Method): Promise<SignInResult>;
  /** The kept session, if any; an expired one is returned so the screen can say it expired. */
  restore(): Session | null;
  signOut(): void;
}
