// MongoDB Collection Creation Script
// This demo collapses every backend service into a single database
// (AD_DB_NAME) since the standalone "application_service" was removed.

const adDbName = process.env.AD_DB_NAME || "tm_ad_db";

print("Creating collections...");

try {
  db = db.getSiblingDB(adDbName);
  db.createCollection("projects");
  db.createCollection("project_ad_file.files");
  db.createCollection("project_ad_file.chunks");
  db.createCollection("project_ad_file_log");
  db.createCollection("project_ad_file_module");
  db.createCollection("project_ad_file_terraform");
  db.createCollection("project_ad_chat_history_log");
  db.createCollection("project_ad");
  db.createCollection("project_diagram_file");
  db.createCollection("master_ad_template");
  db.createCollection("kb_tosca");
  print("Collections created successfully");
} catch (e) {
  print("Error creating collections: " + e);
  throw e;
}
