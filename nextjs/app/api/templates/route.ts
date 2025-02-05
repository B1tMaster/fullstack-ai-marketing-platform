import { NextResponse } from "next/server";
import { getTemplatesForUser } from "@/server/queries";
import logger from "@/utils/logger";
import { HttpStatus } from "@/constants/http";

export async function GET() {
  try {
    logger.debug("Fetching templates for user", {
      component: "api",
      action: "getTemplates"
    });
    const templates = await getTemplatesForUser();
    logger.debug("Templates fetched successfully", {
      component: "api",
      action: "getTemplates",
      templateCount: templates.length
    });
    return NextResponse.json(templates);
  } catch (error) {
    logger.error(
      "Failed to fetch templates",
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "api",
        action: "getTemplates",
      }
    );
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }
}
