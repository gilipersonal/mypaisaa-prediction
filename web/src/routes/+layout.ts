// Every page is prebuilt at build time; there is no SvelteKit server at run time (MP-134).
export const prerender = true;
export const ssr = true;
export const trailingSlash = 'never';
