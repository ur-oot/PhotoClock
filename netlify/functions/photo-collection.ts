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
  const collectionId = reqUrl.searchParams.get("collectionId");
  const totalPhotosStr = reqUrl.searchParams.get("totalPhotos") || "10";
  const totalPhotos = Math.max(1, parseInt(totalPhotosStr, 10) || 10);

  if (!collectionId) {
    return new Response(
      JSON.stringify({ error: "collectionId query parameter is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 最大3回リトライして横長写真を取得
  for (let attempt = 0; attempt < 3; attempt++) {
    const randomPage = Math.floor(Math.random() * totalPhotos) + 1;
    const url = new URL(`https://api.unsplash.com/collections/${collectionId}/photos`);
    url.searchParams.set("page", String(randomPage));
    url.searchParams.set("per_page", "1");

    try {
      const res = await fetch(url.toString(), {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        return new Response(errorText, {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      const photos = await res.json();
      if (Array.isArray(photos) && photos.length > 0) {
        const photo = photos[0];
        // 横長優先、または最終試行ならそのまま返却
        if (photo.width >= photo.height || attempt === 2) {
          return new Response(JSON.stringify(photo), {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
            },
          });
        }
      }
    } catch (error) {
      if (attempt === 2) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch collection photo", details: String(error) }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }
  }

  return new Response(
    JSON.stringify({ error: "No photo found in collection" }),
    {
      status: 404,
      headers: { "Content-Type": "application/json" },
    }
  );
};
