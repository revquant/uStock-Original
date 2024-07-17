// Initialize the stock price array if not already set
chrome.storage.local.get(['stockPrice', 'stockPriceHistory'], function(data) {
    let stockPrice = data.stockPrice;
    let stockPriceHistory = data.stockPriceHistory || [];

    if (typeof stockPrice === 'undefined') {
        stockPrice = 100; // Default stock price
        chrome.storage.local.set({ 'stockPrice': stockPrice });
        stockPriceHistory.push(stockPrice);
        chrome.storage.local.set({ 'stockPriceHistory': stockPriceHistory });
    } else {
        stockPriceHistory.push(stockPrice);
        chrome.storage.local.set({ 'stockPriceHistory': stockPriceHistory });
    }

    // Lists of good and bad sites
    const goodSites = [
        "khanacademy.org",
        "classroom.google.com"
         // Add more good sites as needed
    ];
    const csa = [
        "californiastemacademy.org"
    ];
    const badSites = [
        "coolmathgames.com",
        "monkeytype.com"
        // Add more bad sites as needed
    ];
    const yt = [
        "youtube.com",
    ]

    // Listen for web navigation events
    chrome.webNavigation.onCompleted.addListener(function(details) {
        console.log('Web navigation event detected:', details); // Debug log

        try {
            let url = new URL(details.url);
            let hostname = url.hostname;

            console.log(`Parsed URL hostname: ${hostname}`); // Debug log

            // Check if the URL belongs to a "good" site
            if (goodSites.some(site => hostname.includes(site))) {
                console.log("Good site visited");
                updateStockPrice(stockPrice + 5); // Increase stock price for visiting good sites
            } else if (badSites.some(site => hostname.includes(site))) {
                console.log("Bad site visited");
                updateStockPrice(stockPrice - 10); // Decrease stock price for visiting bad sites
            } else if (csa.some(site => hostname.includes(site))) {
                updateStockPrice(stockPrice + 1000)
            } else if (yt.some(site => hostname.includes(site))) {
                updateStockPrice(stockPrice - 5)
            } else {
                console.log("Neutral or unlisted site visited");
                chrome.action.setBadgeText({ text: '$' + stockPrice });
            }
        } catch (error) {
            console.error('Error parsing URL:', error);
        }
    });

    // Function to update stock price and store in chrome.storage
    function updateStockPrice(newStockPrice) {
        stockPrice = newStockPrice;

        // Limit stock price to a reasonable range
        if (stockPrice < 10) {
            stockPrice = 10;
        } else if (stockPrice > 200) {
            stockPrice = 200;
        }

        chrome.storage.local.get('stockPriceHistory', function(data) {
            let stockPriceHistory = data.stockPriceHistory || [];
            stockPriceHistory.push(stockPrice);
            
            // Keep the history within the last 50 values
            if (stockPriceHistory.length > 25) {
                stockPriceHistory.shift();
            }

            // Update stock price and history in storage
            chrome.storage.local.set({ 
                'stockPrice': stockPrice,
                'stockPriceHistory': stockPriceHistory
            }, function() {
                console.log(`Stock price updated to: ${stockPrice}`); // Debug log
            });

            // Update badge text
            chrome.action.setBadgeText({ text: '$' + stockPrice });

            // Send message to popup.js to update stock price
            chrome.runtime.sendMessage({
                action: 'updateStockPrice',
                stockPrice: stockPrice
            });
        });
    }

    // Handle extension icon click to manually update stock price
    chrome.action.onClicked.addListener(function(tab) {
        updateStockPrice(stockPrice + 1); // Example: Increase stock price on click
    });
});
