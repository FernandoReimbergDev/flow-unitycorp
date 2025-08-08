function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    console.error(`[ENV ERROR] Variável de ambiente '${key}' não está definida.`);
    throw new Error(`Variável de ambiente '${key}' ausente`);
  }
  return value;
}

export const JWT_SECRET = requireEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = requireEnv("JWT_REFRESH_SECRET");
export const BADGE_SECRET = requireEnv("BADGE_ENCRYPT_SECRET");
export const BADGE_IV = requireEnv("BADGE_ENCRYPT_IV");
export const ALLOWED_ORIGINS = requireEnv("ALLOWED_ORIGINS");
export const DESCR_GRUPO_FOLLOWUP = requireEnv("DESCR_GRUPO_FOLLOWUP");
export const DEST_FOLLOWUP = requireEnv("DEST_FOLLOWUP");
export const FEEDBACK_FOLLOWUP = requireEnv("FEEDBACK_FOLLOWUP");
export const PLATAFORMA_FOLLOWUP = requireEnv("PLATAFORMA_FOLLOWUP");
