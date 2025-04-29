// lib/firebase/auth-utils.ts
import { serverAuth } from "./serverSDK";

export async function verifyAuth(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        authenticated: false,
        error: "Unauthorized: Missing or invalid authorization header",
        status: 401,
      };
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token) {
      return {
        authenticated: false,
        error: "Unauthorized: Missing token",
        status: 401,
      };
    }

    try {
      const decodedToken = await serverAuth.verifyIdToken(token);
      console.log("Decoded token:", decodedToken);
      return {
        authenticated: true,
        user: decodedToken,
        status: 200,
      };
    } catch (error) {
      console.error("Error verifying token:", error);
      return {
        authenticated: false,
        error: "Unauthorized: Invalid token",
        status: 401,
      };
    }
  } catch (error) {
    console.error("Auth verification error:", error);
    return {
      authenticated: false,
      error: "Internal server error",
      status: 500,
    };
  }
}
