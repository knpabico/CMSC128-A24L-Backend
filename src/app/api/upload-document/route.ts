import { verifyAuth } from "@/lib/firebase/auth-utils";
import { adminStorage } from "@/lib/firebase/serverSDK";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const authResult = await verifyAuth(req);

    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    console.log("Received document upload request");

    const formData = await req.formData();
    const file = formData.get("file");
    const path = formData.get("path");
    if (!file || !(file instanceof File)) {
      console.error("No file received or invalid file object:", file);
      return new Response("No file or invalid file provided", { status: 400 });
    }

    console.log("Received document:", file.name, file.size, file.type);

    const fileName = file.name;
    const bucket = adminStorage.bucket("cmsc-128-a24l.firebasestorage.app");

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Firebase Storage using Admin SDK
    const fileRef = bucket.file(`${path}/${fileName}`);
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
      },
    });

    console.log("Document uploaded successfully");

    // Generate a URL for the uploaded file
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: "03-01-2500", // Long expiration for this example
    });

    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        url,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error uploading document:", error);
    return new Response(
      JSON.stringify({
        error: "Error uploading document",
        message: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
