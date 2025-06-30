import admin from 'firebase-admin';

// Check if the app is already initialized to prevent errors during hot-reloading
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // The private key from .env. The .env parser handles newlines when the string is quoted.
        privateKey: process.env.FIREBASE_PRIVATE_KEY,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error.stack);
  }
}

export default admin;
