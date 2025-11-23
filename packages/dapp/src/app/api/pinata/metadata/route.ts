import { NextRequest, NextResponse } from "next/server";
import { uploadFileFromUrl, uploadJson } from "@/lib/pinata";
import { createEventTicketMetadata, EventTicketData } from "@/utils";

interface MetadataRequestBody {
  tokenId: string;
  commitment?: string;
  imageCid?: string;
  ticket: EventTicketData;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as MetadataRequestBody;

    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        { error: "PINATA_JWT is not configured on the server" },
        { status: 500 }
      );
    }

    if (!body?.tokenId) {
      return NextResponse.json({ error: "tokenId is required" }, { status: 400 });
    }

    if (!body.ticket) {
      return NextResponse.json({ error: "ticket payload is required" }, { status: 400 });
    }

    let imageCid = body.imageCid;
    let imageUri: string | undefined;

    if (!imageCid) {
      if (!body.ticket.imageUrl) {
        return NextResponse.json(
          { error: "ticket.imageUrl is required when imageCid is not provided" },
          { status: 400 }
        );
      }

      const fileName = `${body.tokenId}.png`;
      const upload = await uploadFileFromUrl(body.ticket.imageUrl, fileName);
      imageCid = upload.cid;
      imageUri = `ipfs://${imageCid}`;
    } else {
      imageUri = `ipfs://${imageCid}`;
    }

    const metadata = createEventTicketMetadata({
      ...body.ticket,
      imageUrl: imageUri,
    });

    const metadataUpload = await uploadJson(`${body.tokenId}-metadata`, metadata);
    const metadataCid = metadataUpload.cid;

    return NextResponse.json({
      success: true,
      imageCid,
      metadataCid,
      metadataUri: `ipfs://${metadataCid}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload metadata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

