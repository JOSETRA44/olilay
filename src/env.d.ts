/**
 * Minimal declaration of the Workers runtime module used by the contact endpoint.
 * The full runtime types (`wrangler types` with runtime) redefine DOM globals such
 * as `Element`, which breaks browser scripts, so only `Env` is generated
 * (`npm run cf:types`) and this module is declared here.
 */
declare module 'cloudflare:workers' {
  export const env: Cloudflare.Env & Record<string, unknown>;
}
