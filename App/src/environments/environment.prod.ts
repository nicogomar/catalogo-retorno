// This file is used during production builds
// It replaces environment.ts with production-specific values

export const environment = {
  production: true,
  apiUrl: "https://catalogo-retorno-backend.vercel.app/api", // ⬅️ Reemplaza con tu URL de Vercel después del deploy
  // apiUrl: "https://poised-reeva-nicolasgm-184b6c82.koyeb.app/api", // URL anterior de Koyeb (backup)
};
