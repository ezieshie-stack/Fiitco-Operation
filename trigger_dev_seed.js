const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api.js");

// Connect to the DEV database (bold-pelican-781) which Vercel is currently using
const client = new ConvexHttpClient("https://bold-pelican-781.convex.cloud");

async function run() {
  try {
    console.log("Triggering forceReseed on DEV (Vercel-connected) database...");
    await client.mutation(api.mutations.forceReseed);
    console.log("forceReseed completed successfully!");
    
    // Verify results
    const exercises = await client.query(api.queries.getExercises);
    console.log(`Verified: Found ${exercises.length} exercises.`);
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
