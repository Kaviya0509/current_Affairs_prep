/**
 * Diagnostic Script: Scraper Integrity Test
 * Verification of AffairsCloud extraction for BankPrep MCQ Fidelity.
 */
import { scrapeArticleFullContent } from "./src/lib/scraper.js";

async function testScraper() {
  const testUrl = "https://affairscloud.com/current-affairs-1-april-2024/";
  console.log("-----------------------------------------");
  console.log(`[TEST] Accessing: ${testUrl}`);
  console.log("-----------------------------------------");
  
  try {
    const content = await scrapeArticleFullContent(testUrl);
    
    if (!content) {
      console.error("[FAIL] No content returned from scraper.");
      return;
    }

    console.log(`[SUCCESS] Extracted ${content.length} characters.`);
    console.log("--- START PREVIEW (First 500 chars) ---");
    console.log(content.slice(0, 500));
    console.log("--- END PREVIEW ---");
    
    if (content.toLowerCase().includes("affairscloud")) {
       console.warn("[WARNING] Branding still present, check cleanup regex.");
    } else {
       console.log("[PASS] Branding successfully white-labeled to BankPrep.");
    }
    
  } catch (e) {
    console.error("[ERROR] Test failed:", e);
  }
}

testScraper();
