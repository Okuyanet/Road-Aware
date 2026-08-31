import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy endpoint to live Google Cloud deployment
  app.post("/api/traffic/analyze", async (req, res) => {
    try {
      const { scenario, telemetry } = req.body;
      const targetUrl = "https://road-aware-api2-745521609480.us-central1.run.app/traffic/analyze";

      console.log(`[PROXY] Forwarding analyze request for scenario: ${scenario || 'A5_LAST_EXIT'}`);

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scenario: scenario || "A5_LAST_EXIT",
          telemetry: telemetry || {},
        }),
      });

      if (!response.ok) {
        throw new Error(`Cloud Run API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error proxying traffic analyze request:", error);
      res.status(500).json({
        status: "error",
        message: error.message || "Failed to reach live Google Cloud API endpoint",
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      cloud_endpoint: "https://road-aware-api2-745521609480.us-central1.run.app",
    });
  });

  // Vite middleware for development or static serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
