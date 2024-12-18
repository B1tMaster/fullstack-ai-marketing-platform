import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { HttpStatus } from "./constants/http";

const isPublicRoute = createRouteMatcher(["/", "/pricing", "/api/upload"]);
const isSecureRoute = createRouteMatcher(["/api/asset-processing-job(.*)"]);

const SERVER_API_KEY = process.env.SERVER_API_KEY;

if (!SERVER_API_KEY) {
  throw new Error("SERVER_API_KEY is not set in .env file");
}

const validateBearerToken = (request: NextRequest) => {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  return token === SERVER_API_KEY;
};

export default clerkMiddleware(async (auth, request) => {
  // Check secure routes first
  if (isSecureRoute(request)) {
    if (!validateBearerToken(request)) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid bearer token" },
        { status: HttpStatus.UNAUTHORIZED }
      );
    }
    return NextResponse.next();
  }

  // Handle other protected routes with Clerk
  if (!isPublicRoute(request)) {
    console.log(`Protected route ${request.url}`);
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
