const { build } = require("./index");

let app;

const initializeFastify = async () => {
  if (!app) {
    try {
      app = build({
        logger: {
          level: "warn", // Reduced logging for serverless
          prettyPrint: false,
        },
        disableRequestLogging: true,
        trustProxy: true,
        connectionTimeout: 25000, // 25 seconds
        keepAliveTimeout: 5000, // 5 seconds
        bodyLimit: 1048576, // 1MB
        maxParamLength: 100,
      });

      // Set a timeout for app.ready()
      const readyPromise = Promise.race([
        app.ready(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Fastify initialization timeout")),
            15000
          )
        ),
      ]);

      await readyPromise;
      // console.log("Fastify app initialized for Vercel serverless");
    } catch (error) {
      console.error("Failed to initialize Fastify app:", error);
      throw error;
    }
  }
  return app;
};

module.exports = async (req, res) => {
  // Set timeout for the function
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.statusCode = 504;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Gateway Timeout",
          message: "Request timeout after 25 seconds",
        })
      );
    }
  }, 50000); // 50 second timeout

  try {
    const fastifyApp = await initializeFastify();

    // Store original URL for debugging
    const originalUrl = req.url;

    // Add /api prefix to the URL since Next.js strips it
    // The [...api].js route receives the URL without /api, but backend expects /api
    if (!req.url.startsWith("/api")) {
      req.url = "/api" + req.url;
    }

    // console.log(`Request: ${req.method} ${originalUrl} -> ${req.url}`);

    // Handle CORS for serverless environment
    if (req.method === "OPTIONS") {
      // console.log("Handling OPTIONS request");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,PUT,POST,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
      res.statusCode = 200;
      res.end();
      clearTimeout(timeout);
      return;
    }

    // Inject request through Fastify's internal handler
    await fastifyApp.ready();

    // For POST/PUT requests, use the pre-parsed body from Next.js
    let payload = undefined;
    if (
      req.method !== "GET" &&
      req.method !== "HEAD" &&
      req.method !== "OPTIONS" &&
      req.body !== undefined
    ) {
      payload =
        typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    // Convert Node.js request to Fastify-compatible format
    const fastifyResponse = await fastifyApp.inject({
      method: req.method,
      url: req.url,
      headers: req.headers,
      payload: payload,
      remoteAddress:
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
        "127.0.0.1",
    });

    // Clear timeout since we got a response
    clearTimeout(timeout);

    // Only set headers if not already sent
    if (!res.headersSent) {
      // Set response headers
      Object.keys(fastifyResponse.headers).forEach((key) => {
        res.setHeader(key, fastifyResponse.headers[key]);
      });

      // Set status code and send response
      res.statusCode = fastifyResponse.statusCode;
      res.end(fastifyResponse.payload);
    }
  } catch (error) {
    clearTimeout(timeout);
    console.error("Serverless function error:", error);

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "Internal Server Error",
          message:
            process.env.NODE_ENV === "development" ? error.message : undefined,
        })
      );
    }
  }
};
