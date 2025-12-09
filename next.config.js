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
    API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",

    PAYSTACK_KEY: "pk_live_8850c0e7c99deff4d48f4694e757d08f495bde2c",
    PAYSTACK_TEST_KEY: "pk_test_aec7d21e9a003310ce458551e79004d222ddb711",

    BBB_API: "https://live.hdt.ng/bigbluebutton/api",
    BBB_SHARED_SECRET: "99dY54LPScfwzOWtULw66lYo8YuBsGmbGwmdu7z1Oss",
  },
};

//wget -qO- https://ubuntu.bigbluebutton.org/bbb-install-2.5.sh | bash -s -- -v focal-250 -s live.hdt.ng -e notice@live.hdt.ng  -a -w -g
