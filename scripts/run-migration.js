const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// Parse .env manually
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      env[key] = val;
    }
  }
  return env;
}

async function runMigration() {
  const env = loadEnv();
  const dbPassword = env.SUPABASE_DB_PASSWORD || process.env.SUPABASE_DB_PASSWORD;
  let databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;

  if (!dbPassword) {
    console.error("❌ Error: SUPABASE_DB_PASSWORD is missing in .env.");
    process.exit(1);
  }

  // Build connection strings to try
  const poolerUrl = `postgresql://postgres.jehaenmqezenfuamgqch:${encodeURIComponent(dbPassword)}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres`;
  const directUrl = `postgresql://postgres:${encodeURIComponent(dbPassword)}@db.jehaenmqezenfuamgqch.supabase.co:5432/postgres`;
  const fallbackPooler = `postgresql://postgres.jehaenmqezenfuamgqch:${encodeURIComponent(dbPassword)}@aws-0-eu-west-2.pooler.supabase.com:5432/postgres`;

  const connectionCandidates = [databaseUrl, poolerUrl, directUrl, fallbackPooler].filter(Boolean);

  const sqlFilePath = path.join(__dirname, "..", "supabase", "RUN_ALL_MIGRATIONS.sql");
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`❌ Migration file not found at: ${sqlFilePath}`);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlFilePath, "utf8");

  let connectedClient = null;
  let connectedUrl = "";

  for (const connStr of connectionCandidates) {
    console.log(`🔌 Attempting connection to Supabase database...`);
    const client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });

    try {
      await client.connect();
      connectedClient = client;
      connectedUrl = connStr;
      console.log("✅ Successfully connected to Supabase PostgreSQL!");
      break;
    } catch (err) {
      console.warn(`   ⚠️ Connection attempt failed (${err.message}). Trying alternative host...`);
      await client.end().catch(() => {});
    }
  }

  if (!connectedClient) {
    console.error("❌ Could not connect to any Supabase database endpoints with the provided credentials.");
    process.exit(1);
  }

  try {
    console.log("🚀 Running migrations: Creating silent_churn schema, tables, triggers, and seed data...");
    await connectedClient.query(sqlContent);
    console.log("✅ Tables, triggers, and seed records created successfully!");

    console.log("🌐 Exposing 'silent_churn' schema to PostgREST API...");
    await connectedClient.query(`
      ALTER ROLE authenticator SET pgrst.db_schemas = 'public, silent_churn, graphql_public';
      NOTIFY pgrst, 'reload config';
    `);
    console.log("✅ PostgREST configured! 'silent_churn' schema is now exposed to API clients.");

    // Verification Query
    const verifyRes = await connectedClient.query(`
      SELECT count(*) AS total_customers FROM silent_churn.customers;
    `);
    console.log(`🎉 VERIFICATION SUCCESS: ${verifyRes.rows[0]?.total_customers} customers currently in silent_churn.customers table!`);
  } catch (err) {
    console.error("❌ Migration execution error:", err.message);
    process.exit(1);
  } finally {
    await connectedClient.end();
  }
}

runMigration();
