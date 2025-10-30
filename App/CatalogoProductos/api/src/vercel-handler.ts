import createApp from "./app";

// Create the Express app
const app = createApp();

// Export the app as a serverless function handler for Vercel
export default app;
