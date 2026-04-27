const https = require('https');

https.get('https://fiit-ops.vercel.app', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const match = data.match(/https:\/\/[a-z0-9\-]+\.convex\.cloud/g);
    console.log("Found Convex URLs:", [...new Set(match)]);
  });
}).on('error', (err) => {
  console.log("Error: " + err.message);
});
