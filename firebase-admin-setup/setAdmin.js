const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccountKey.json")),
});

// Email of the user to make admin
const userEmail = "kupoluyiolawuyi773@gmail.com";

async function makeAdmin() {
  try {
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    console.log(`✅ Admin claim added to ${userEmail}`);
  } catch (error) {
    console.error("Error adding admin claim:", error);
  }
}

makeAdmin();
