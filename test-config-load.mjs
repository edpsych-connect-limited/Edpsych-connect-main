
try {
  import('./next.config.mjs').then(() => {
    console.log("Config loaded successfully");
  }).catch(err => {
    console.error("Config load failed", err);
  });
} catch (e) {
  console.error("Immediate error", e);
}
