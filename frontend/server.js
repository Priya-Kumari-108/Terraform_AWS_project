const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Serve main page
app.get("/", async (req, res) => {
  try {
    const healthRes = await axios.get(`${BACKEND_URL}/health`);
    const health = healthRes.data;
    res.sendFile(path.join(__dirname, "public", "index.html"));
  } catch (err) {
    res.sendFile(path.join(__dirname, "public", "index.html"));
  }
});

// API proxy: health check
app.get("/api/health", async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/health`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Backend unreachable", status: "Down" });
  }
});

// API proxy: submit
app.post("/api/submit", async (req, res) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/submit`, req.body);
    res.json(response.data);
  } catch (err) {
    const msg = err.response?.data || { error: "Submission failed" };
    res.status(500).json(msg);
  }
});

app.listen(PORT, () => {
  console.log(`✅ Express frontend running at http://localhost:${PORT}`);
  console.log(`🔗 Proxying API calls to Flask backend at ${BACKEND_URL}`);
});
