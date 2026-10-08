/**
 * Borra los usuarios de prueba creados por scripts/test-serverless.js
 *   node scripts/cleanup-test-data.js
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

(async () => {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 4000),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL ? JSON.parse(process.env.DB_SSL) : undefined,
    dateStrings: true,
    timezone: 'Z',
  });

  const sub = "SELECT id FROM (SELECT id FROM users WHERE email LIKE 'sslt-%@test.dev') AS t";

  const [c] = await db.query('DELETE FROM checkups WHERE user_id IN (' + sub + ')');
  const [h] = await db.query('DELETE FROM hives WHERE user_id IN (' + sub + ')');
  const [u] = await db.query("DELETE FROM users WHERE email LIKE 'sslt-%@test.dev'");

  console.log('  checkups eliminados: ' + c.affectedRows);
  console.log('  hives eliminados:    ' + h.affectedRows);
  console.log('  users eliminados:    ' + u.affectedRows);

  const [rest] = await db.query('SELECT email FROM users ORDER BY id');
  console.log('  usuarios restantes:  ' + (rest.map((r) => r.email).join(', ') || '(ninguno)'));

  await db.end();
  process.exit(0);
})().catch((e) => { console.error('X ' + e.message); process.exit(1); });
