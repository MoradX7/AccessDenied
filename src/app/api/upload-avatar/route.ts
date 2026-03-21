export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(token);
    } catch (err) {
      console.error("Firebase token verification failed", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const uid = decodedToken.uid;

    // 2. Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file || !file.name) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // 3. Validate Upload
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Uploaded file must be an image" }, { status: 400 });
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    // 4. Upload to Storage Service (Catbox)
    // Convert Web File to the FormData shape Catbox expects
    const catboxFormData = new FormData();
    catboxFormData.append("reqtype", "fileupload");
    catboxFormData.append("fileToUpload", file);

    const uploadRes = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: catboxFormData as any,
    });

    if (!uploadRes.ok) {
      throw new Error(`Storage upload failed with status: ${uploadRes.status}`);
    }

    const avatarUrl = await uploadRes.text();
    
    // Validate Catbox URL
    if (!avatarUrl.startsWith("http")) {
      throw new Error(`Invalid URL returned from storage: ${avatarUrl}`);
    }

    // 5. Update Database
    // Ensure avatar_url column exists and is TEXT
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT`;
    
    // Some versions of postgres need type cast or change if it was originally VARCHAR.
    // It's safe to run ALTER COLUMN TYPE TEXT since VARCHAR can implicitly convert to TEXT.
    await sql`ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT`;

    // Save image URL
    await sql`
      UPDATE users 
      SET avatar_url = ${avatarUrl}, updated_at = CURRENT_TIMESTAMP
      WHERE firebase_uid = ${uid}
    `;

    // 6. Return response
    return NextResponse.json({ url: avatarUrl });
  } catch (error: any) {
    console.error("Avatar upload API error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
