const backendURL = "https://rrons-backend.onrender.com/scrape"; // use YOUR actual render URL

async function startScrape() {
  const url = document.getElementById("urlInput").value.trim();
  const resultBox = document.getElementById("result");
  resultBox.style.border = "1px solid #eee";
  resultBox.innerText = "";

  if (!url) {
    resultBox.innerText = "❗ Please enter a website URL.";
    return;
  }

  resultBox.innerText = "⏳ Checking permissions and scraping...";

  try {
    const resp = await fetch(backendURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, usePlaywright: "auto" })
    });

    const json = await resp.json();

    if (!json.success) {
      // friendly messages for common reasons
      if (json.reason === 'blocked_by_robots') {
        resultBox.innerText = "❌ Cannot scrape: this site disallows scraping in robots.txt.";
      } else if (json.reason === 'blocked_by_bot_protection' || json.reason === 'blocked_after_playwright') {
        resultBox.innerText = "❌ Cannot scrape: this site appears to block automated scrapers (bot protection).";
      } else if (json.reason === 'playwright_failed') {
        resultBox.innerText = "❌ Scrape failed when rendering the page. Try again later.";
      } else if (json.reason === 'fetch_failed') {
        resultBox.innerText = "❌ Network error: failed to fetch the site.";
      } else {
        resultBox.innerText = "❌ Scraping failed: " + (json.message || 'unknown reason');
      }
      return;
    }

    // success
    const { engine, data } = json;
    let out = `Engine: ${engine}\n\nTitle: ${data.title || '—'}\n\nHeadings:\n${(data.headings && data.headings.join('\n')) || '—'}\n\nLinks:\n${(data.links && data.links.slice(0,200).join('\n')) || '—'}\n\n\nText preview:\n${(data.text && data.text.substring(0, 2000)) || '—'}`;
    resultBox.innerText = out;

    // store globally for exports
    window.__rrons_last_scrape = data;
  } catch (err) {
    resultBox.innerText = "❌ Unexpected error: " + err.message;
  }
}

function exportCSV() {
  const data = window.__rrons_last_scrape;
  if (!data) return alert("Scrape something first!");

  const rows = [
    ["title", data.title || ""],
    ["headings", (data.headings || []).join(" | ")],
    ["links", (data.links || []).join(" | ")],
    ["text", data.text || ""]
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "scraped_data.csv";
  a.click();
}

function exportPDF() {
  const data = window.__rrons_last_scrape;
  if (!data) return alert("Scrape something first!");
  const content = `Title: ${data.title}\n\nHeadings:\n${(data.headings||[]).join('\n')}\n\nLinks:\n${(data.links||[]).join('\n')}\n\n\n${data.text || ''}`;
  const win = window.open("", "_blank");
  win.document.write('<pre>' + content.replace(/</g,'&lt;') + '</pre>');
  win.document.close();
  win.print();
}


