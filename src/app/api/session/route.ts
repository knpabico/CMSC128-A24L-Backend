import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token)
      return NextResponse.json({ error: "No token provided" }, { status: 400 });

    // Store token in an HTTP-only cookie
    (await cookies()).set("session", token, {
      httpOnly: true, // Secure cookie (not accessible via JavaScript)
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: (error as Error).message },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  (await cookies()).delete("session"); // Remove session cookie
  return NextResponse.json({ success: true });
}
