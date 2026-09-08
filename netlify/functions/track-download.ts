export default async (req: Request) => {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return new Response(
      JSON.stringify({ error: "UNSPLASH_ACCESS_KEY is not configured" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const reqUrl = new URL(req.url);
  let downloadLocation = reqUrl.searchParams.get("url");

  if (!downloadLocation && req.method === "POST") {
    try {
      const body = await req.json();
      downloadLocation = body.url;
    } catch {
      // ignore
    }
  }

  if (!downloadLocation) {
    return new Response(
      JSON.stringify({ error: "url parameter is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // UnsplashのURLのみ許可する安全策
  if (!downloadLocation.startsWith("https://api.unsplash.com/")) {
    return new Response(
      JSON.stringify({ error: "Invalid download location URL" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const res = await fetch(downloadLocation, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    return new Response(JSON.stringify({ success: res.ok }), {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Tracking failed", details: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
