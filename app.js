// // app.js
// const express = require("express");
// const dotenv = require("dotenv");
// const cors = require("cors");
// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;

// // Enable CORS
// app.use(
//   cors({
//     origin: "*", // allow all origins (you can restrict this in prod)
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"]
//   })
// );

// app.use(express.json({ limit: "1mb" }));

// // Import routes
// const urlRoutes = require("./routes/urls");

// // attach routes (they already contain /health and /api/urls etc.)
// app.use("/", urlRoutes);

// // 404 fallback
// app.use((req, res) => {
//   res.status(404).json({ success: false, error: "Not Found" });
// });

// // global error handler (optional)
// app.use((err, req, res, next) => {
//   console.error("Unhandled error:", err);
//   res.status(500).json({ success: false, error: "Internal Server Error" });
// });

// app.listen(port, () => {
//   console.log(`Server listening on http://localhost:${port}`);
// });
// app.js
const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "1mb" }));

// Routes
const urlRoutes = require("./routes/urls");
app.use("/", urlRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, error: "Internal Server Error" });
});

// run on local
if (process.env.NODE_ENV !== "production") {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server listening on http://localhost:${port}`);
  });
}
