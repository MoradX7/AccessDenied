import * as admin from "firebase-admin";

if (!admin.apps.length) {
  // When running in Firebase Functions, credentials and projectId are picked up
  // from the environment. For local development, you can set GOOGLE_APPLICATION_CREDENTIALS
  // to point to a service account JSON file.
  admin.initializeApp();
}

export const db = admin.firestore();
export const auth = admin.auth();
export const storage = admin.storage();

