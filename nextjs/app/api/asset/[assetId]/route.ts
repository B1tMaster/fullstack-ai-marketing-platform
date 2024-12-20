import { db } from "@/server/db";
import { assetTable } from "@/server/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { HttpStatus } from "@/constants/http";

export async function GET(
  request: NextRequest,
  { params }: { params: { assetId: string } }
) {
  try {
    const assetId = params.assetId;
    if (!assetId) {
      console.log("Missing required parameter: assetId");
      return NextResponse.json(
        { error: "Missing required parameter: assetId" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    console.log(`Fetching asset ${assetId}`);

    const asset = await db
      .select()
      .from(assetTable)
      .where(eq(assetTable.id, assetId))
      .execute();

    if (!asset || asset.length === 0) {
      console.log(`Asset ${assetId} not found`);
      return NextResponse.json(
        { error: "Asset not found" },
        { status: HttpStatus.NO_CONTENT }
      );
    }

    console.log(`Successfully fetched asset ${assetId}`);
    return NextResponse.json(asset[0]);
  } catch (error) {
    console.error("Failed to fetch asset:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
