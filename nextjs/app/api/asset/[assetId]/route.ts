import { db } from "@/server/db";
import { assetTable } from "@/server/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { HttpStatus } from "@/constants/http";
import { z } from "zod";

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

    // Define schema with optional fields but strict validation rules
    const updateSchema = z.object({
      content: z.string().optional(),
      tokenCount: z.number().int().nonnegative().optional()
    }).refine(data => data.content !== undefined || data.tokenCount !== undefined, {
      message: "At least one field must be provided for update",
      path: ["content", "tokenCount"]
    });

    const updateData = await request.json();
    console.log(`Updating asset ${assetId} with data:`, updateData);

    // Validate input data
    const validationResult = updateSchema.safeParse(updateData);
    if (!validationResult.success) {
      console.error("Validation failed:", validationResult.error);
      return NextResponse.json(
        { 
          error: "Invalid update data",
          details: validationResult.error.errors 
        },
        { status: HttpStatus.BAD_REQUEST }
      );
    }

    // Build update fields with only provided values
    const updateFields: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (updateData.content !== undefined) {
      updateFields.content = updateData.content;
    } else {
      console.warn(`Content not provided in update for asset ${assetId}, keeping existing value`);
    }

    if (updateData.tokenCount !== undefined) {
      updateFields.tokenCount = updateData.tokenCount;
    } else {
      console.warn(`Token count not provided in update for asset ${assetId}, keeping existing value`);
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
