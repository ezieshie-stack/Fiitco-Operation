const { ConvexHttpClient } = require("convex/browser");
const { api } = require("./convex/_generated/api.js");

const client = new ConvexHttpClient("https://bold-pelican-781.convex.cloud");

async function check() {
  try {
    const exercises = await client.query(api.queries.getExercises);
    console.log(`Found ${exercises.length} exercises in dev.`);
    if (exercises.length > 0) {
      console.log(`Sample: ${exercises[0].name} - ${exercises[0].category} - ${exercises[0].subcategory}`);
    }
  } catch (e) {
    console.error(e);
  }
}
check();
