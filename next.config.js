//next.config.js

module.exports = {
  // experimental options for Next.js 15
  turbopack: {
    resolveExtensions: [".mdx", ".tsx", ".ts", ".jsx", ".js", ".json"],
  },

  async redirects() {
    return [
      {
        source: "/cdel",
        destination: "/cdel/index.html",
        permanent: true,
      },
      {
        source: "/mba",
        destination: "/cdel/index.html",
        permanent: true,
      },
    ];
  },
  env: {
    PAYSTACK_KEY: "pk_live_8850c0e7c99deff4d48f4694e757d08f495bde2c",
    PAYSTACK_TEST_KEY: "pk_test_aec7d21e9a003310ce458551e79004d222ddb711",

    BBB_API: "https://live.hdt.ng/bigbluebutton/api",
    BBB_SHARED_SECRET: "99dY54LPScfwzOWtULw66lYo8YuBsGmbGwmdu7z1Oss",
  },
  webpack: (config, { isServer, webpack }) => {
    // Ignore backend directory and api_old pages from client-side bundling
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      // Ignore backend imports on client side
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^\.\.\/backend\//,
        })
      );
      // Handle node: protocol imports by replacing them with regular module names
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource) => {
          resource.request = resource.request.replace(/^node:/, "");
        })
      );
      // Ignore mssql package resolution issues
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^mssql\/package\.json$/,
        })
      );
    }

    if (isServer) {
      // For server-side, mark Node.js built-in modules as external
      config.externals = config.externals || [];
      config.externals.push({
        net: "commonjs net",
        fs: "commonjs fs",
        console: "commonjs console",
        path: "commonjs path",
        os: "commonjs os",
        crypto: "commonjs crypto",
        stream: "commonjs stream",
        util: "commonjs util",
        buffer: "commonjs buffer",
        url: "commonjs url",
        http: "commonjs http",
        https: "commonjs https",
        http2: "commonjs http2",
        zlib: "commonjs zlib",
        querystring: "commonjs querystring",
        child_process: "commonjs child_process",
        tls: "commonjs tls",
      });
    } else {
      // For client-side, provide fallbacks for Node.js modules
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        fs: false,
        console: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        url: false,
        http: false,
        https: false,
        http2: false,
        zlib: false,
        querystring: false,
        child_process: false,
        tls: false,
      };
    }
    return config;
  },
};

//wget -qO- https://ubuntu.bigbluebutton.org/bbb-install-2.5.sh | bash -s -- -v focal-250 -s live.hdt.ng -e notice@live.hdt.ng  -a -w -g
