async function startScrape() {
    const url = document.getElementById("urlInput").value.trim();
    const resultBox = document.getElementById("result");

    if (!url) {
        resultBox.innerText = "❗ Please enter a website URL.";
        return;
    }

    // Clear previous results
    resultBox.innerText = "";
    resultBox.style.border = "1px solid #eee";

    // Show loading
    resultBox.innerText = "⏳ Scraping... please wait ";

    try {
        const response = await fetch("https://rrons-scraper.onrender.com/scrape", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data.error) {
            resultBox.innerText = "❌ Error: " + data.error;
            return;
        }

        // Show scraped content
        resultBox.innerText = data.text || "No text found on the website.";
    } catch (error) {
        resultBox.innerText = "❌ Failed to scrape. Website may be blocking scraping.";
    }
}



// EXPORT AS CSV
function exportCSV() {
    const text = document.getElementById("result").innerText;

    if (!text) {
        alert("Scrape something before exporting!");
        return;
    }

    const blob = new Blob([text], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "scraped_data.csv";
    link.click();
}



// EXPORT AS PDF
function exportPDF() {
    const text = document.getElementById("result").innerText;

    if (!text) {
        alert("Scrape something before exporting!");
        return;
    }

    const win = window.open("", "", "width=600,height=600");
    win.document.write("<pre>" + text + "</pre>");
    win.document.close();
    win.print();
}


