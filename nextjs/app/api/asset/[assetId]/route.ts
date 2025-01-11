import { db } from "@/server/db";
import { assetTable } from "@/server/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { HttpStatus } from "@/constants/http";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
    if (!assetId) {
      console.log("Missing required parameter: assetId");
      return NextResponse.json(
        { error: "Missing required parameter: assetId" },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    const updateData = await request.json();
    console.log(`Updating asset ${assetId} with data:`, updateData);

    const updateFields: Record<string, any> = {
      content: updateData.content,
      updatedAt: new Date(),
    };

    // Add tokenCount if it exists in the update data
    if (updateData.tokenCount !== undefined) {
      updateFields.tokenCount = updateData.tokenCount;
    }

    const updatedAsset = await db
      .update(assetTable)
      .set(updateFields)
      .where(eq(assetTable.id, assetId))
      .returning();

    if (!updatedAsset || updatedAsset.length === 0) {
      console.log(`Asset ${assetId} not found`);
      return NextResponse.json(
        { error: "Asset not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    console.log(`Successfully updated asset ${assetId}`);
    return NextResponse.json(updatedAsset[0]);
  } catch (error) {
    console.error("Failed to update asset:", error);
    return NextResponse.json(
      { error: "Failed to update asset" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
