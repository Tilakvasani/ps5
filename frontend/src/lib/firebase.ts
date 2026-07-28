import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA-HE5oNIUxLisyNoCAVOf1i6ZPtTKB2zY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "zupwell-2eb25.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "zupwell-2eb25",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "zupwell-2eb25.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "695914934748",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:695914934748:web:2dd1f9c2c549dc16501f19",
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

/**
 * Sets up invisible reCAPTCHA verifier for phone authentication
 * @param buttonId - HTML ID of the submit/send button or container
 */
export function setupRecaptcha(buttonId: string = "send-otp-btn") {
  if (typeof window === "undefined") return null;

  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved — allow signInWithPhoneNumber
      },
    });
  }
  return (window as any).recaptchaVerifier;
}

/**
 * Sends OTP via Google Firebase SMS (10,000 free SMS/month)
 * @param phone 10-digit mobile number or formatted E.164 number
 */
export async function sendFirebaseOtp(phone: string): Promise<ConfirmationResult> {
  const formattedPhone = phone.startsWith("+") ? phone : `+91${phone.trim()}`;
  const appVerifier = setupRecaptcha("send-otp-btn");

  return await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
}
