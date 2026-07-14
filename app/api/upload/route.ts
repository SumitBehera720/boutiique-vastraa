import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}.${ext}`;
    const publicDir = path.join(process.cwd(), 'public/images/uploads');

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(path.join(publicDir, filename), buffer);

    return NextResponse.json({ success: true, url: `/images/uploads/${filename}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to upload file." }, { status: 500 });
  }
}
