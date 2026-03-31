const fs = require('fs');
const path = require('path');

const files = [
  "src/lib/groq.ts",
  "src/lib/fetchOfficialPDFs.ts",
  "src/lib/fetchCurrentAffairs.ts",
  "src/lib/CurrentAffairsPDF.tsx",
  "src/app/quiz/page.tsx",
  "src/app/downloads/page.tsx",
  "src/app/digest/page.tsx",
  "src/app/current-affairs/CurrentAffairsClient.tsx",
  "src/components/features/NewsCard.tsx",
  "src/app/news/page.tsx"
];

for (const f of files) {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    let newContent = content
      .replace(/affairscloud/gi, "BankPrep Intelligence")
      .replace(/affairs cloud/gi, "BankPrep Intelligence")
      .replace(/careerscloud/gi, "BankPrep Intelligence")
      .replace(/careers cloud/gi, "BankPrep Intelligence")
      .replace(/BankPrep Intelligence\.com/ig, "BankPrep.com")
      .replace(/BankPrep Intelligence RSS/ig, "BankPrep AI Sync");

    if (content !== newContent) {
      fs.writeFileSync(p, newContent, 'utf8');
      console.log("Updated", f);
    }
  }
}
