/**
 * Creates the default Email/Password admin in Firebase Auth (one-time).
 * Requires Email/Password provider enabled in Firebase Console.
 *
 * Run: npm run seed:admin
 */
const API_KEY = process.env.FIREBASE_WEB_API_KEY || "AIzaSyBNttUs2fdhivQqtODC-_Dgq6_M3LmJJD8";
const EMAIL = "admin@quincy.school";
const PASSWORD = process.env.ADMIN_PASSWORD || "Quincy@2026";

const url = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

const res = await fetch(url, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD, returnSecureToken: true }),
});

const data = await res.json();

if (!res.ok) {
  if (data.error?.message === "EMAIL_EXISTS") {
    console.log(`Admin user already exists: ${EMAIL}`);
    process.exit(0);
  }
  const msg = data.error?.message || JSON.stringify(data);
  console.error("Failed:", msg);
  if (msg === "CONFIGURATION_NOT_FOUND") {
    console.error(
      "Fix: Firebase Console → Authentication → Sign-in method → enable Email/Password for this project."
    );
  }
  process.exit(1);
}

console.log(`Created admin user: ${EMAIL}`);
console.log("You can sign in at /admin/login with user ID 'Admin' or this email, and your password.");
