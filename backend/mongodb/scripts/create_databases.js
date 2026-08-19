// MongoDB Database Creation Script
// This demo only uses a single database (AD_DB_NAME) for everything,
// since the standalone "application_service" database was removed.

const adDbName = process.env.AD_DB_NAME || "tm_ad_db";

print("=== Creating database ===");
db = db.getSiblingDB(adDbName);
print(`[OK] Using database: ${adDbName}`);
