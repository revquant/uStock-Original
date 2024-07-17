// Function to update popup HTML with current stock price and graph
function updatePopup(stockPrice) {
  document.getElementById('stockPrice').textContent = '$' + stockPrice;
  drawGraph();
}

// Function to draw a basic graph based on stock price
function drawGraph() {
  chrome.storage.local.get('stockPriceHistory', function(data) {
    const stockPriceHistory = data.stockPriceHistory || [];
    const canvas = document.getElementById('stockGraph');
    const ctx = canvas.getContext('2d');
    const graphHeight = canvas.height - 20;
    const graphWidth = canvas.width - 20;
    const maxPrice = 200;
    const minPrice = 10;
    const offsetY = 20; // Offset to shift the graph up

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(10, 10);
    ctx.lineTo(10, canvas.height - 10);
    ctx.lineTo(canvas.width - 10, canvas.height - 10);
    ctx.strokeStyle = 'black';
    ctx.stroke();

    // Draw stock price history
    ctx.beginPath();
    ctx.moveTo(10, canvas.height - 10 - offsetY);

    stockPriceHistory.forEach((price, index) => {
      const x = (index / stockPriceHistory.length) * graphWidth + 10;
      const y = ((price - minPrice) / (maxPrice - minPrice)) * (graphHeight - offsetY);
      ctx.lineTo(x, canvas.height - y - 10 - offsetY);
    });

    ctx.strokeStyle = 'red';
    ctx.stroke();
  });
}

// Initialize popup with initial stock price and graph
chrome.storage.local.get(['stockPrice', 'stockPriceHistory'], function(data) {
  const stockPrice = data.stockPrice || 100; // Default to 100 if not set
  updatePopup(stockPrice);
});

// Receive message from background.js and update popup HTML
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'updateStockPrice') {
    updatePopup(message.stockPrice);
  }
});
