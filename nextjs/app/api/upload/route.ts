import { db } from "@/server/db";
import { assetProcessingJobTable, assetTable } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { userId } = await auth();
        if (!userId) {
          return {};
        }

        return {
          allowedContentTypes: [
            "video/mp4",
            "video/quicktime",
            "audio/mpeg",
            "audio/wav",
            "audio/ogg",
            "text/plain",
            "text/markdown",
          ],
          maximumSizeInBytes: 5 * 1024 * 1024 * 1024, // 5GB
          tokenPayload: clientPayload,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow

        if (!tokenPayload) return;

        const { projectId, fileType, mimeType, size } =
          JSON.parse(tokenPayload);

        console.log(
          `Saving blob URL ${blob.url} to database for project ${projectId} with filename ${blob.pathname}`
        );

        try {
          const [newAsset] = await db
            .insert(assetTable)
            .values({
              projectId,
              title: blob.pathname.split("/").pop() || blob.pathname,
              fileName: blob.pathname,
              fileUrl: blob.url,
              fileType,
              mimeType,
              size,
            })
            .returning();

          await db.insert(assetProcessingJobTable).values({
            assetId: newAsset.id,
            projectId,
            status: "created",
          });
        } catch (error) {
          throw new Error(
            `Could not save asset or asset processing job to database ${error}`
          );
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 } // The webhook will retry 5 times waiting for a 200
    );
  }
}
