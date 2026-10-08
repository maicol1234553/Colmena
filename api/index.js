/**
 * Entrada serverless de Vercel.
 *
 * Vercel trata CADA archivo dentro de `api/` como una función independiente,
 * por eso el código de la app vive fuera, en `server/`, y aquí solo queda
 * este módulo. La lógica es idéntica a la de backend/src/app.js en local.
 *
 * Express ya es un manejador (req, res), basta con exponerlo.
 */
const app = require('./backend/app');

module.exports = (req, res) => app(req, res);
