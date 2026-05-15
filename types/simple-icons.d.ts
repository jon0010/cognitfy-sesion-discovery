/**
 * Respaldo de tipos: algunos entornos (p. ej. TS sobre UNC/WSL) no resuelven
 * `exports` de `simple-icons` aunque el paquete esté en `node_modules`.
 * Si el paquete resuelve con normalidad, TypeScript fusiona sin duplicar `SimpleIcon`.
 */
declare module "simple-icons" {
  export type SimpleIcon = {
    title: string;
    slug: string;
    path: string;
    hex: string;
    source: string;
    svg: string;
  };

  export const siGmail: SimpleIcon;
  export const siGooglesheets: SimpleIcon;
  export const siGooglemeet: SimpleIcon;
  export const siHubspot: SimpleIcon;
  export const siMercadopago: SimpleIcon;
  export const siSalesforce: SimpleIcon;
  export const siSap: SimpleIcon;
  export const siSlack: SimpleIcon;
  export const siStripe: SimpleIcon;
  export const siTwilio: SimpleIcon;
  export const siZendesk: SimpleIcon;
  export const siZapier: SimpleIcon;
}
