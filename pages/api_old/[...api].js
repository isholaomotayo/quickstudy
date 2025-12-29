// Main API handler that uses the local backend
// In Vercel serverless, environment variables are injected directly
// Only try to load .env file in development
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({
    path: require("path").resolve(__dirname, "../../.env"),
  });
}

const serverlessHandler = require("../../backend/api/serverless");

export default async function handler(req, res) {
  try {
    return await serverlessHandler(req, res);
  } catch (error) {
    console.error("API Error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}

// Configure API route settings
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
    responseLimit: false,
  },
};

// Prevent static generation
export function getServerSideProps() {
  return { props: {} };
}
