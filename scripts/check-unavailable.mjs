import assert from 'node:assert/strict';
const response = await fetch('http://127.0.0.1:3000/health');
assert.equal(response.status, 503);
console.log('PASS: readiness returns 503 while own database is stopped');
