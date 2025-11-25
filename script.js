const backendURL = "https://rrons-scraper.onrender.com/scrape";
let scrapedData = null;

async function scrape() {
    let url = document.getElementById("urlInput").value;
    if (!url) return alert("Please enter a valid URL");

    let res = await fetch(backendURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
    });

    let data = await res.json();
    scrapedData = data.data;

    document.getElementById("result").innerHTML = `
        <h3>Title:</h3> ${scrapedData.title}
        <h3>Headings:</h3> ${scrapedData.headings.join("<br>")}
        <h3>Links:</h3> ${scrapedData.links.join("<br>")}
    `;
}

function exportCSV() {
    if (!scrapedData) return alert("Scrape a site first!");

    let rows = [
        ["Title", scrapedData.title],
        ["Headings", scrapedData.headings.join(" | ")],
        ["Links", scrapedData.links.join(" | ")]
    ];

    let csv = rows.map(r => r.join(",")).join("\n");
    let blob = new Blob([csv], { type: "text/csv" });

    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "scraped_data.csv";
    a.click();
}

function exportPDF() {
    if (!scrapedData) return alert("Scrape a site first!");

    let content = `
Title: ${scrapedData.title}

Headings:
${scrapedData.headings.join("\n")}

Links:
${scrapedData.links.join("\n")}
    `;

    let blob = new Blob([content], { type: "application/pdf" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "scraped_data.pdf";
    a.click();
}
