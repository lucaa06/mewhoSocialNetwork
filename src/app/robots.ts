import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://meandwho.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/u/", "/post/", "/community/"],
        disallow: ["/admin", "/settings", "/api/", "/notifications", "/saved"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
