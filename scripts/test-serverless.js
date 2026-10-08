/**
 * Prueba la función serverless EXACTAMENTE como Vercel la invocaría:
 * importando api/index.js desde la raiz del proyecto frontend.
 *
 *   node scripts/test-serverless.js
 */
const path = require('path');
const http = require('http');

process.env.NODE_ENV = process.env.NODE_ENV || 'production';
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const handler = require(path.join(__dirname, '..', 'api', 'index.js'));

if (typeof handler !== 'function') {
  console.error('X api/index.js no exporta una funcion');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  if (!req.url.startsWith('/api')) req.url = '/api' + req.url;
  handler(req, res);
});

const PORT = process.env.TEST_PORT || 4310;

const req = (p, opts = {}) =>
  new Promise((resolve, reject) => {
    const r = http.request(
      { host: '127.0.0.1', port: PORT, path: p, method: opts.method || 'GET', headers: opts.headers || {} },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
      }
    );
    r.on('error', reject);
    if (opts.body) r.write(opts.body);
    r.end();
  });

async function main() {
  await new Promise((r) => server.listen(PORT, r));
  let failed = 0;
  const check = (name, cond, extra = '') => {
    if (cond) console.log('  ok  ' + name + (extra ? ' ' + extra : ''));
    else { console.log('  FALLO ' + name + ' ' + extra); failed++; }
  };

  console.log('\n[1] GET /api/health');
  const h = await req('/api/health');
  check('200 + JSON', h.status === 200 && JSON.parse(h.body).ok === true, '-> ' + h.status + ' ' + h.body.slice(0, 60));

  console.log('\n[2] POST /api/auth/register');
  const email = 'sslt-' + Date.now() + '@test.dev';
  const rbody = JSON.stringify({ email, password: 'Password123!', name: 'SSLT' });
  const reg = await req('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(rbody) },
    body: rbody,
  });
  check('201', reg.status === 201, '-> ' + reg.status + ' ' + reg.body.slice(0, 80));

  console.log('\n[3] POST /api/auth/login');
  const lbody = JSON.stringify({ email, password: 'Password123!' });
  const login = await req('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(lbody) },
    body: lbody,
  });
  check('200 + token', login.status === 200, '-> ' + login.status);
  const token = login.status === 200 ? JSON.parse(login.body).token : null;

  console.log('\n[4] GET /api/hives con token (register crea las 15 por defecto)');
  const hv = await req('/api/hives', { headers: { Authorization: 'Bearer ' + token } });
  const hiveCount = hv.status === 200 ? (JSON.parse(hv.body).hives || []).length : 0;
  check('200 + 15 colmenas', hv.status === 200 && hiveCount === 15, '-> ' + hv.status + ' hives=' + hiveCount);

  console.log('\n[5] GET /api/hives SIN token');
  const noauth = await req('/api/hives');
  check('401', noauth.status === 401, '-> ' + noauth.status);

  console.log('\n[6] POST /api/records/checkup');
  const cid = JSON.parse(hv.body).hives[0].id;
  const cbody = JSON.stringify({
    hiveId: cid, date: '2026-10-08', super: 1, frame: 1,
    temperament: 'Manso', population: 'Alta',
    presence: { honey: true, beeBread: false, sealedBrood: true, openBrood: false },
    framePercentage: 40,
    queenStatus: 'Vista', foodReserve: 'Buena', artificialFeed: false,
    hygiene: 'Bueno', health: 'Sano', notes: 'smoke test',
  });
  const ck = await req('/api/records/checkup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token, 'Content-Length': Buffer.byteLength(cbody) },
    body: cbody,
  });
  check('201', ck.status === 201, '-> ' + ck.status + ' ' + ck.body.slice(0, 100));

  console.log('\n[7] GET /api/records/history');
  const hi = await req('/api/records/history?hiveId=' + cid, { headers: { Authorization: 'Bearer ' + token } });
  check('200', hi.status === 200, '-> ' + hi.status + ' ' + hi.body.slice(0, 80));

  console.log('\n[8] GET /api/records/export (Excel)');
  const ex = await req('/api/records/export', { headers: { Authorization: 'Bearer ' + token } });
  const sig = ex.body.slice(0, 2);
  check('200 + xlsx', ex.status === 200 && (sig === 'PK' || (ex.headers['content-type'] || '').includes('spreadsheet')),
    '-> ' + ex.status + ' ' + (ex.headers['content-type'] || ''));

  console.log('\n[9] Ruta desconocida');
  const nf = await req('/api/no-existe');
  check('404', nf.status === 404, '-> ' + nf.status);

  console.log('\n' + (failed === 0 ? 'TODAS LAS PRUEBAS PASARON' : failed + ' FALLAS') + '\n');

  server.close();
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error('X error: ' + e.message); process.exit(1); });
