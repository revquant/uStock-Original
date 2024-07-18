// Function to update popup HTML with current stock price and graph
function updatePopup(stockPrice, increaseGainPrice) {
  document.getElementById('stockPrice').textContent = '$' + stockPrice;
  updateIncreaseGainButton(increaseGainPrice);
  drawGraph();
}

// Function to update the increase gain button text
function updateIncreaseGainButton(increaseGainPrice) {
  const increaseGainButton = document.getElementById('increaseGainButton');
  increaseGainButton.textContent = `Increase Stock Gain ($${increaseGainPrice})`;
}

// Function to draw a basic graph based on stock price
function drawGraph() {
  chrome.storage.local.get('stockPriceHistory', function(data) {
    const stockPriceHistory = data.stockPriceHistory || [];
    const canvas = document.getElementById('stockGraph');
    const ctx = canvas.getContext('2d');
    const graphHeight = canvas.height - 20;
    const graphWidth = canvas.width - 20;
    let minPrice = Number.POSITIVE_INFINITY;
    let maxPrice = Number.NEGATIVE_INFINITY;
    const offsetY = 20;   // Offset to shift the graph up

    // Find min and max prices in history
    stockPriceHistory.forEach(price => {
      if (price < minPrice) minPrice = price;
      if (price > maxPrice) maxPrice = price;
    });

    // Ensure minPrice is at least 10 (or your desired minimum)
    minPrice = Math.min(minPrice, 10);
    console.log(minPrice)
    // Add some padding to maxPrice for better visualization
    maxPrice = maxPrice * 1.1; // Increase by 10% for some padding

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
    if (stockPriceHistory.length > 1) {
      ctx.beginPath();
      ctx.moveTo(10, canvas.height - 10 - offsetY);

      stockPriceHistory.forEach((price, index) => {
        const x = (index / (stockPriceHistory.length - 1)) * graphWidth + 10;
        const y = ((price - minPrice) / (maxPrice - minPrice)) * (graphHeight - offsetY) + offsetY;



        ctx.lineTo(x, canvas.height - y - 10);

      });


      
      ctx.strokeStyle = 'green';
      ctx.stroke();
    }
  });
}

// Function to increase max gain
function increaseMaxGain() {
  chrome.storage.local.get(['stockPrice', 'maxGain', 'increaseGainPrice'], function(data) {
    let stockPrice = data.stockPrice || 100;
    let maxGain = data.maxGain || 45;
    let increaseGainPrice = data.increaseGainPrice || 150;

    if (stockPrice >= increaseGainPrice) {
      stockPrice -= increaseGainPrice;
      maxGain += 10;
      maxLoss = Math.ceil(0.35 * maxGain);
      increaseGainPrice += 50;

      chrome.storage.local.set({
        'stockPrice': stockPrice,
        'maxGain': maxGain,
        'increaseGainPrice': increaseGainPrice,
        'maxLoss': maxLoss
      }, function() {
        updatePopup(stockPrice, increaseGainPrice);
        updateMaxGain(maxGain, increaseGainPrice);
        console.log(`Max gain increased to: ${maxGain}`);
      });
    } else {
      alert("Not enough stock value to increase max gain!");
    }
  });
}

// Function to update max gain display
function updateMaxGain(maxGain, increaseGainPrice) {
  document.getElementById('maxGain').textContent = 'Current Max Stock Gain is ' + maxGain;
}

// Initialize popup with initial stock price, max gain, and graph
chrome.storage.local.get(['stockPrice', 'stockPriceHistory', 'maxGain', 'increaseGainPrice'], function(data) {
  const stockPrice = data.stockPrice || 100; // Default to 100 if not set
  const maxGain = data.maxGain || 45; // Default max gain if not set
  const increaseGainPrice = data.increaseGainPrice || 150; // Default increase price if not set
  updatePopup(stockPrice, increaseGainPrice);
  updateMaxGain(maxGain, increaseGainPrice);
});

// Add event listener to the button
document.getElementById('increaseGainButton').addEventListener('click', increaseMaxGain);

// Receive message from background.js and update popup HTML
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'updateStockPrice') {
    updatePopup(message.stockPrice);
  }
});
