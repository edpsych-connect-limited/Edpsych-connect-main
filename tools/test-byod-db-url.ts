import assert from 'node:assert/strict';

(async function run() {
  // Ensure encryption helpers have a key available even if the environment running tests
  // has NODE_ENV=production. This is a unit-ish test; it must not depend on external secrets.
  if (!process.env.ENCRYPTION_KEY && !process.env.SECRETS_ENCRYPTION_KEY) {
    process.env.ENCRYPTION_KEY = 'test-only-encryption-key-do-not-use-in-prod';
  }

  const { buildTenantDatabaseUrl, decryptPossiblyEncryptedPassword } = await import(
    '../src/lib/db/tenant-database-url'
  );
  const { encryptToString } = await import('../src/lib/security/encryption');

  // Plaintext password
  {
    const url = buildTenantDatabaseUrl({
      host: 'db.example.com',
      database: 'tenant_db',
      username: 'tenant_user',
      password: 'p@ss/word',
      ssl_mode: 'require',
    });

    assert.equal(
      url,
      'postgresql://tenant_user:p%40ss%2Fword@db.example.com:5432/tenant_db?sslmode=require'
    );
  }

  // Encrypted password (iv:tag:content format)
  {
    const encrypted = encryptToString('super-secret');
    const decrypted = decryptPossiblyEncryptedPassword(encrypted);
    assert.equal(decrypted, 'super-secret');

    const url = buildTenantDatabaseUrl({
      host: 'db.example.com',
      database: 'tenant_db',
      username: 'tenant_user',
      password: encrypted,
      ssl_mode: 'require',
    });

    assert.ok(url.includes('super-secret'));
  }

  // Unsupported provider
  {
    assert.throws(() => {
      buildTenantDatabaseUrl({
        provider: 'mysql',
        host: 'db.example.com',
        database: 'tenant_db',
        username: 'u',
        password: 'p',
      });
    }, /Unsupported BYOD database provider/);
  }

  console.log('BYOD DB URL tests passed');
})();
