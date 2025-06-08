// firebase.js
const admin = require('firebase-admin');
// const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  databaseURL: "https://inbox-checker-e4be4-default-rtdb.asia-southeast1.firebasedatabase.app/" // Realtime DB URL
});

const db = admin.database();
module.exports = db;
