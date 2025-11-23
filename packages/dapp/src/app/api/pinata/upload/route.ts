import { NextRequest, NextResponse } from "next/server";

const PINATA_UPLOAD_ENDPOINT = "https://uploads.pinata.cloud/v3/files";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        { error: "PINATA_JWT is not configured on the server" },
        { status: 500 }
      );
    }

    const incomingFormData = await request.formData();
    const file = incomingFormData.get("file");
    const providedName = incomingFormData.get("name") as string | null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const uploadForm = new FormData();
    uploadForm.append("file", file);
    uploadForm.append("name", providedName || file.name || "event-image");
    uploadForm.append("network", "public");

    const response = await fetch(PINATA_UPLOAD_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PINATA_JWT}`,
      },
      body: uploadForm,
    });

    const payload = await response.json();

    if (!response.ok) {
      const message = payload?.error || payload?.message || "Pinata upload failed";
      return NextResponse.json({ error: message }, { status: response.status });
    }

    const data = payload?.data ?? payload;
    const cid = data?.cid;

    if (!cid) {
      throw new Error("Pinata response did not include CID");
    }

    return NextResponse.json({
      success: true,
      cid,
      imageUrl: `https://ipfs.io/ipfs/${cid}`,
      ipfsUri: `ipfs://${cid}`,
      pinataResponse: data,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


