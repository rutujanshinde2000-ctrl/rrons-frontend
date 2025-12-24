const backendURL = "https://rrons-backend.onrender.com/scrape";

let lastScrapedData = null;

async function startScrape() {
  const url = document.getElementById("urlInput").value.trim();
  const selector = document.getElementById("selectorInput")?.value.trim();
  const resultBox = document.getElementById("result");

  resultBox.style.border = "1px solid #eee";
  resultBox.innerText = "";

  if (!url) {
    resultBox.innerText = "❗ Please enter a website URL.";
    return;
  }

  // collect selected fields
  const fields = [];
  document
    .querySelectorAll(".options input[type=checkbox]")
    .forEach(cb => {
      if (cb.checked) fields.push(cb.value);
    });

  if (fields.length === 0) {
    resultBox.innerText = "❗ Please select at least one item to scrape.";
    return;
  }

  resultBox.innerText = "⏳ Checking permissions and scraping…";

  try {
    const resp = await fetch(backendURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        fields,
        selector
      })
    });

    const json = await resp.json();

    if (!json.success) {
      if (json.reason === "robots_block") {
        resultBox.innerText =
          "❌ Scraping blocked by robots.txt (not legally allowed).";
      } else if (json.reason === "blocked") {
        resultBox.innerText =
          "❌ Website is protected (Cloudflare / CAPTCHA).";
      } else {
        resultBox.innerText =
          "❌ Scraping failed: " + (json.message || "Unknown error");
      }
      return;
    }

    const data = json.data;
    lastScrapedData = data;

    let output = "";

    if (data.title) {
      output += `📄 TITLE\n${data.title}\n\n`;
    }

    if (data.headings && data.headings.length) {
      output += `🧩 HEADINGS\n${data.headings.join("\n")}\n\n`;
    }

    if (data.links && data.links.length) {
      output += `🔗 LINKS\n${data.links.slice(0, 200).join("\n")}\n\n`;
    }

    if (data.text) {
      output += `📝 TEXT (preview)\n${data.text.substring(0, 3000)}\n`;
    }

    resultBox.innerText = output || "No data found.";
  } catch (err) {
    resultBox.innerText = "❌ Server error: " + err.message;
  }
}

/* =======================
   EXPORT FUNCTIONS
======================= */

function exportCSV() {
  if (!lastScrapedData) {
    alert("Scrape something first!");
    return;
  }

  const rows = [];

  for (const key in lastScrapedData) {
    const value = Array.isArray(lastScrapedData[key])
      ? lastScrapedData[key].join(" | ")
      : lastScrapedData[key];

    rows.push([key, value]);
  }

  const csv = rows
    .map(r =>
      r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");

  download(csv, "scraped_data.csv", "text/csv");
}

function exportPDF() {
  if (!lastScrapedData) {
    alert("Scrape something first!");
    return;
  }

  let content = "";
  for (const key in lastScrapedData) {
    content += key.toUpperCase() + ":\n";
    content +=
      (Array.isArray(lastScrapedData[key])
        ? lastScrapedData[key].join("\n")
        : lastScrapedData[key]) + "\n\n";
  }

  const win = window.open("", "_blank");
  win.document.write(
    "<pre>" + content.replace(/</g, "&lt;") + "</pre>"
  );
  win.document.close();
  win.print();
}

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


