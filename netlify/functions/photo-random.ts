
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
  const topics = reqUrl.searchParams.get("topics");
  const collections = reqUrl.searchParams.get("collections");
  const query = reqUrl.searchParams.get("query");

  const url = new URL("https://api.unsplash.com/photos/random");
  if (query) {
    url.searchParams.set("query", query);
  } else if (topics && topics !== "all") {
    url.searchParams.set("topics", topics);
  } else if (!collections) {
    // トピックやコレクション、クエリの指定がない場合のデフォルト
    url.searchParams.set("topics", "wallpapers");
  }

  if (collections) {
    url.searchParams.set("collections", collections);
  }

  url.searchParams.set("orientation", "landscape");

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
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch random photo", details: String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
