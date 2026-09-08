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
  const page = reqUrl.searchParams.get("page") || "1";
  const perPage = reqUrl.searchParams.get("perPage") || "12";

  const url = new URL("https://api.unsplash.com/collections");
  url.searchParams.set("page", page);
  url.searchParams.set("per_page", perPage);

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

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        // コレクション一覧は頻繁に変わらないため10分CDNキャッシュ
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=120",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch collections", details: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
