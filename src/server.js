// server.js
/* eslint-disable no-console */
const { PORT, NODE_ENV } = require('./config/env');
const app = require('./serverapp.js');

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} (${NODE_ENV})`);
});

// 그레이스풀 셧다운
function shutdown(signal) {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(err => {
    if (err) {
      console.error(' Error during server close:', err);
      process.exit(1);
    }
    console.log(' Server closed. Bye!');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// 치명적 예외 핸들
process.on('unhandledRejection', (reason) => {
  console.error(' UnhandledRejection:', reason);
  shutdown('unhandledRejection');
});
process.on('uncaughtException', (err) => {
  console.error(' UncaughtException:', err);
  shutdown('uncaughtException');
});


