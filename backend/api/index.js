"use strict";

//load Elastic APM
//var apm = require('elastic-apm-node').start();

// In Vercel serverless, environment variables are injected directly
// Only try to load .env file in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: require("path").join(__dirname, "../..", ".env"),
  });
}

const qs = require("qs");

//Require fastify framework and instantiate it
const fastify = require("fastify");

function build(opts = {}) {
  const isServerless =
    process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

  const defaultOptions = {
    querystringParser: (str) => qs.parse(str, { comma: true }),
    trustProxy: true,
    ignoreTrailingSlash: true,
    logger: isServerless
      ? {
          level: "warn",
          prettyPrint: false,
        }
      : {
          level: process.env.LOG_LEVEL || "info",
          prettifier: require("pino-pretty"),
          prettyPrint: {
            errorProps: "hint, detail",
            levelFirst: true,
            crlf: true,
          },
        },
  };

  // Merge with custom options passed for serverless
  const finalOptions = { ...defaultOptions, ...opts };
  const app = fastify(finalOptions);

  app.register(require("fastify-cookie"), {
    // secret: process.env.JWTSECRET, // for cookies signature
    parseOptions: {}, // options for parsing cookies
  });

  //Register fastify-cors
  app.register(require("fastify-cors"), {
    // put your options here
    credentials: true,
    origin: true,

    // [
    //   process.en../backend/config/swagger   //   "http://localhost:4000",
    //   "http://localhost:3000",
    //   "http://127.0.0.1:4000"
    // ],
    methods: "GET,PUT,POST,DELETE,OPTIONS",
  });

  //import adn initialize database connections

  // Import Swagger Options
  const swagger = require("../config/swagger");

  // Register Swagger
  app.register(require("fastify-swagger"), swagger.options);
  //Import JWT plugin for fastify

  app.register(require("fastify-jwt-with-verify-token"), {
    secret: process.env.JWTSECRET,
  });

  app.setErrorHandler(function (error, request, reply) {
    request.log.warn(error);
    var statusCode = error.statusCode >= 400 ? error.statusCode : 500;
    reply
      .code(statusCode)
      // .type("text/plain")
      .send(error);
  });

  // Health check endpoints - both with and without /api prefix
  app.get("/api/health", (req, reply) => reply.send({ API: "Working" }));

  const routes = require("../routes");

  // Also register routes without prefix for direct backend access
  routes.forEach((route, index) => {
    app.route(route);
  });

  app.addHook("onRequest", async (req, res) => {
    req.params.pageSize = req.params.pageSize || process.env.PAGESIZE;
    try {
      if (req.cookies && req.cookies.token)
        req.params.validatedUser = app.jwt.verify(req.cookies.token);
    } catch (error) {
      console.log(error);
    }
    // console.log(req.req.url, ">>>>>>>>>>>>>", req.cookies.token);
    // console.log("Validated User", req.params.validatedUser);
    // console.log("xxxxxxxxxxxxx>", req.params, req.cookies);
  });

  app.addHook("onResponse", (req, res, done) => {
    // req.log.info({ url: req.req.originalUrl, statusCode: res.res.statusCode },  "request completed");
    done();
  });

  return app;
}

// Run server function
const start = async () => {
  const app = build();
  try {
    await app.listen(process.env.PORT || 3000, "0.0.0.0", function (err) {
      if (err) throw err;
      console.log(
        `API is now running and listening on ${app.server.address().port}`
      );
    });
    app.swagger();
  } catch (error) {
    app.log.error(error);
    //apm.captureError(error);
    process.exit(1);
  }
};

// If this file is run directly, start the server
if (require.main === module) {
  start();
}

module.exports = { build, start };
