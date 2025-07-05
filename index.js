const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/q3df", async (req, res) => {
  const profileId = req.query.id || "10052";
  const url = `https://www.q3df.org/profil?id=${profileId}`;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  // Click twice to sort Date/Time descending
  await page.click("th:nth-child(1)");
  await page.waitForTimeout(300);
  await page.click("th:nth-child(1)");
  await page.waitForTimeout(1000);

  const rows = await page.$$eval("table tbody tr", (trs) =>
    trs.slice(0, 20).map((tr) => {
      const tds = tr.querySelectorAll("td");
      return {
        date: tds[0]?.innerText.trim(),
        map: tds[1]?.innerText.trim(),
        time: tds[2]?.innerText.trim(),
        rank: tds[3]?.innerText.trim(),
        physic: tds[4]?.innerText.trim(),
        server: tds[5]?.innerText.trim(),
      };
    })
  );

  await browser.close();
  res.json(rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
