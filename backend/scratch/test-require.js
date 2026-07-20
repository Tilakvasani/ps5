try {
  console.log("Loading middlewares and routers...");
  require("../src/middleware/auth");
  require("../src/routes/admin");
  require("../src/routes/auth");
  require("../src/routes/orders");
  require("../src/routes/payments");
  console.log("✅ SUCCESS: All modules loaded successfully without any syntax or duplication errors!");
} catch (e) {
  console.error("❌ ERROR loading modules:", e);
  process.exit(1);
}
