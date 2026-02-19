import { NextResponse } from "next/server";

export async function GET() {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;

  if (!apiToken || !zoneId) {
    return NextResponse.json(
      { error: "Cloudflare credentials not configured" },
      { status: 400 }
    );
  }

  try {
    // Get the date range (last 7 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];

    // Fetch analytics from Cloudflare GraphQL API
    const query = `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequests1dGroups(
              limit: 7
              filter: { date_geq: "${formatDate(startDate)}", date_leq: "${formatDate(endDate)}" }
              orderBy: [date_DESC]
            ) {
              dimensions {
                date
              }
              sum {
                requests
                pageViews
                bytes
                threats
                cachedBytes
                cachedRequests
              }
              uniq {
                uniques
              }
            }
            httpRequests1dGroups_sum: httpRequests1dGroups(
              limit: 1
              filter: { date_geq: "${formatDate(startDate)}", date_leq: "${formatDate(endDate)}" }
            ) {
              sum {
                requests
                pageViews
                bytes
                threats
                cachedBytes
                cachedRequests
                countryMap {
                  clientCountryName
                  requests
                }
              }
              uniq {
                uniques
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.cloudflare.com/client/v4/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Cloudflare API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error(data.errors[0]?.message || "GraphQL error");
    }

    const zones = data.data?.viewer?.zones;
    if (!zones || zones.length === 0) {
      return NextResponse.json({ error: "No zone data found" }, { status: 404 });
    }

    const dailyData = zones[0].httpRequests1dGroups || [];
    const totals = zones[0].httpRequests1dGroups_sum?.[0] || null;

    // Format the response
    const analytics = {
      period: {
        start: formatDate(startDate),
        end: formatDate(endDate),
      },
      totals: totals
        ? {
            requests: totals.sum?.requests || 0,
            pageViews: totals.sum?.pageViews || 0,
            uniqueVisitors: totals.uniq?.uniques || 0,
            bandwidth: totals.sum?.bytes || 0,
            threats: totals.sum?.threats || 0,
            cachedRequests: totals.sum?.cachedRequests || 0,
            cachedBytes: totals.sum?.cachedBytes || 0,
            topCountries: (totals.sum?.countryMap || [])
              .sort((a: { requests: number }, b: { requests: number }) => b.requests - a.requests)
              .slice(0, 5),
          }
        : null,
      daily: dailyData.map((day: {
        dimensions: { date: string };
        sum: { requests: number; pageViews: number; bytes: number; threats: number };
        uniq: { uniques: number };
      }) => ({
        date: day.dimensions.date,
        requests: day.sum?.requests || 0,
        pageViews: day.sum?.pageViews || 0,
        uniqueVisitors: day.uniq?.uniques || 0,
        bandwidth: day.sum?.bytes || 0,
        threats: day.sum?.threats || 0,
      })),
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Cloudflare API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
