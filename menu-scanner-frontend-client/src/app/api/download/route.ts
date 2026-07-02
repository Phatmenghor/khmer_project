import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new NextResponse(`Failed to fetch image: ${response.statusText}`, { status: response.status });
    }

    const blob = await response.blob();
    const headers = new Headers();
    
    // Copy content type from source image
    const contentType = response.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }
    
    // Extract filename from URL or default
    const filename = url.substring(url.lastIndexOf("/") + 1) || "download";
    headers.set("content-disposition", `attachment; filename="${filename}"`);

    return new NextResponse(blob, { headers });
  } catch (error) {
    return new NextResponse(`Download failed: ${(error as Error).message}`, { status: 500 });
  }
}
