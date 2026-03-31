import * as cheerio from "cheerio";

export async function scrapeArticleFullContent(url: string): Promise<string> {
  if (!url) return "";

  try {
    // 2.5s timeout per URL to maintain Mega Test performance
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });
    
    clearTimeout(timeout);

    if (!response.ok) throw new Error("Connection unstable.");

    const html = await response.text();
    const $ = cheerio.load(html);

    // Target the main article container
    let mainText = "";
    
    // Multi-tier targeting for high-fidelity extraction
    const $content = $(".entry-content, .entry_content, [id*='post-content'], article, main");
    
    if ($content.length) {
      // Remove noise
      $content.find("script, style, .social-sharing, .adsbygoogle, .sharedaddy, .wpcnt, .related-posts, nav").remove();
      mainText = $content.first().text();
    } else {
      // Emergency fallback
      $("p").each((_, el) => {
        mainText += $(el).text() + " ";
      });
    }

    // Intelligence Cleansing
    const cleanContent = mainText
      .replace(/affairs\s*cloud/gi, "BankPrep Intelligence")
      .replace(/careers\s*cloud/gi, "BankPrep Strategic Node")
      .replace(/\s+/g, " ")
      .trim();

    return cleanContent.length > 500 ? cleanContent.slice(0, 10000) : cleanContent;
  } catch (error) {
    console.error("Vector Fetch Error:", error);
    return "";
  }
}
