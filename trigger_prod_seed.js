const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api.js");

const client = new ConvexHttpClient("https://posh-coyote-465.convex.cloud");

async function run() {
  try {
    console.log("Triggering forceReseed on production...");
    await client.mutation(api.mutations.forceReseed);
    console.log("forceReseed completed successfully!");
    
    // Verify results
    const exercises = await client.query(api.queries.getExercises);
    console.log(`Verified: Found ${exercises.length} exercises in prod.`);
  } catch (e) {
    console.error("Failed:", e);
  }
}
run();
