import { db } from "@/server/db";
import { assetTable } from "@/server/db/schema";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { HttpStatus } from "@/constants/http";

type Params = Promise<{ projectId: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const projectId = (await params).projectId;

  // Auth check
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  try {
    const assets = await db
      .select()
      .from(assetTable)
      .where(eq(assetTable.projectId, projectId))
      .execute();

    return NextResponse.json(assets);
  } catch (error) {
    console.error("Failed to fetch assets", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const assetId = searchParams.get("assetId");

  if (!assetId) {
    return NextResponse.json(
      { error: "Asset ID is required" },
      { status: HttpStatus.BAD_REQUEST }
    );
  }

  // TODO: AUTH
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: HttpStatus.UNAUTHORIZED }
    );
  }

  try {
    const deletedAsset = await db
      .delete(assetTable)
      .where(eq(assetTable.id, assetId))
      .returning();

    if (deletedAsset.length === 0) {
      return NextResponse.json(
        { error: "Asset not found" },
        { status: HttpStatus.NOT_FOUND }
      );
    }

    await del(deletedAsset[0].fileUrl);

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Failed to delete asset", error);
    return NextResponse.json(
      { error: "Failed to delete asset" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
