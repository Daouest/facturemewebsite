/**
 * Script to generate a new Gmail OAuth2 refresh token
 * Run: node scripts/generate-refresh-token.js
 */

const { google } = require("googleapis");
const readline = require("readline");
const path = require("path");

// Load .env.local file
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

console.log("Loading credentials...");
console.log(
  "Client ID:",
  process.env.GMAIL_CLIENT_ID ? "✓ Found" : "✗ Missing"
);
console.log(
  "Client Secret:",
  process.env.GMAIL_CLIENT_SECRET ? "✓ Found" : "✗ Missing"
);
console.log("Redirect URI:", process.env.GMAIL_REDIRECT_URI || "✗ Missing");

if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
  console.error("\n❌ Error: Missing required environment variables!");
  console.error(
    "Make sure GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET are set in .env.local"
  );
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI ||
    "http://localhost:3000/api/google/oauth2/callback"
);

// Generate the authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline", // Important: this requests a refresh token
  prompt: "consent", // Force consent screen to ensure refresh token is returned
  scope: [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
  ],
});

console.log("=".repeat(80));
console.log("Gmail OAuth2 Refresh Token Generator");
console.log("=".repeat(80));
console.log("\nStep 1: Open this URL in your browser and authorize the app:\n");
console.log(authUrl);
console.log("\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question(
  "Step 2: Paste the authorization code from the callback URL here: ",
  async (code) => {
    try {
      console.log("\nExchanging code for tokens...");
      const { tokens } = await oauth2Client.getToken(code);

      console.log("\n" + "=".repeat(80));
      console.log("SUCCESS! Tokens received:");
      console.log("=".repeat(80));

      if (tokens.refresh_token) {
        console.log("\n✅ REFRESH TOKEN (save this in your .env file):");
        console.log(tokens.refresh_token);
        console.log("\nAdd this to your .env file:");
        console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}`);
      } else {
        console.log("\n⚠️  No refresh token received!");
        console.log(
          "This usually happens if you've already authorized this app."
        );
        console.log("To get a new refresh token:");
        console.log("1. Go to https://myaccount.google.com/permissions");
        console.log("2. Remove access for your app");
        console.log("3. Run this script again");
      }

      console.log("\n📝 Access Token (expires in ~1 hour):");
      console.log(tokens.access_token);

      if (tokens.expiry_date) {
        console.log("\n⏰ Expires at:");
        console.log(new Date(tokens.expiry_date).toLocaleString());
      }

      console.log("\n" + "=".repeat(80));
    } catch (error) {
      console.error("\n❌ Error exchanging code for tokens:");
      console.error(error);
    }

    rl.close();
  }
);
