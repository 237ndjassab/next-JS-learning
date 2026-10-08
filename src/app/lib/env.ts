const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value == undefined) {
    throw new Error(`Variable d'environnement manquante : ${key}`);
  }
  return value;
};

export const API_URL = getEnv("API_URL", "http://localhost:4000");
export const DATABASE_URL = getEnv("DATABASE_URL");
