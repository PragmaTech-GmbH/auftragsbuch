// server/server.js
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const cors = require("cors");

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors()); // Allow requests from React frontend

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// --- Simulation State ---
let bids = {}; // { price: quantity } - Sorted implicitly later
let asks = {}; // { price: quantity } - Sorted implicitly later
let trades = []; // { time, price, quantity }
let simulationInterval = null;
let orderIdCounter = 0;
let basePrice = 100.0;
const MAX_TRADES_HISTORY = 50;

// --- Helper Functions ---
function formatPrice(price) {
  // Avoid floating point issues, work with cents internally if needed
  // For simplicity here, just format to 2 decimal places
  return parseFloat(price.toFixed(2));
}

function getSortedBids() {
  // Descending order by price
  return Object.keys(bids)
    .map(parseFloat)
    .sort((a, b) => b - a);
}

function getSortedAsks() {
  // Ascending order by price
  return Object.keys(asks)
    .map(parseFloat)
    .sort((a, b) => a - b);
}

function addTrade(price, quantity) {
  trades.unshift({ time: Date.now(), price, quantity }); // Add to beginning
  if (trades.length > MAX_TRADES_HISTORY) {
    trades.pop(); // Remove oldest
  }
  // Adjust base price slightly towards the trade price
  basePrice = basePrice * 0.95 + price * 0.05;
}

// --- Order Matching Engine ---
function processOrder(order) {
  console.log(
    `Processing: ${order.type} ${order.quantity} @ ${order.price}`
  );
  let quantityRemaining = order.quantity;

  if (order.type === "buy") {
    const sortedAsks = getSortedAsks();
    for (const askPrice of sortedAsks) {
      if (quantityRemaining === 0) break;
      if (order.price >= askPrice) {
        const availableQuantity = asks[askPrice];
        const tradeQuantity = Math.min(quantityRemaining, availableQuantity);

        console.log(`  Match: Buy ${tradeQuantity} @ ${askPrice} (from Ask)`);
        addTrade(askPrice, tradeQuantity);

        asks[askPrice] -= tradeQuantity;
        if (asks[askPrice] <= 0) {
          delete asks[askPrice];
        }
        quantityRemaining -= tradeQuantity;
      } else {
        // Buy price is lower than the best ask, no more matches possible
        break;
      }
    }

    // If quantity still remains, add to bids
    if (quantityRemaining > 0) {
      const priceStr = formatPrice(order.price).toString();
      bids[priceStr] = (bids[priceStr] || 0) + quantityRemaining;
      console.log(`  Added to Bids: ${quantityRemaining} @ ${priceStr}`);
    }
  } else {
    // Order type is 'sell'
    const sortedBids = getSortedBids();
    for (const bidPrice of sortedBids) {
      if (quantityRemaining === 0) break;
      if (order.price <= bidPrice) {
        const availableQuantity = bids[bidPrice];
        const tradeQuantity = Math.min(quantityRemaining, availableQuantity);

        console.log(`  Match: Sell ${tradeQuantity} @ ${bidPrice} (from Bid)`);
        addTrade(bidPrice, tradeQuantity);

        bids[bidPrice] -= tradeQuantity;
        if (bids[bidPrice] <= 0) {
          delete bids[bidPrice];
        }
        quantityRemaining -= tradeQuantity;
      } else {
        // Sell price is higher than the best bid, no more matches possible
        break;
      }
    }

    // If quantity still remains, add to asks
    if (quantityRemaining > 0) {
      const priceStr = formatPrice(order.price).toString();
      asks[priceStr] = (asks[priceStr] || 0) + quantityRemaining;
      console.log(`  Added to Asks: ${quantityRemaining} @ ${priceStr}`);
    }
  }
}

// --- Random Order Generation ---
function generateRandomOrder() {
  const type = Math.random() < 0.5 ? "buy" : "sell";
  // Generate price around the base price with some volatility
  const priceVolatility = 1.5; // Max deviation from base price
  const price = formatPrice(
    basePrice + (Math.random() - 0.5) * 2 * priceVolatility
  );
  const quantity = Math.floor(Math.random() * 91) + 10; // 10 to 100 shares
  orderIdCounter++;

  return {
    id: orderIdCounter,
    type,
    price,
    quantity,
  };
}

// --- WebSocket Logic ---
function broadcastState() {
  const state = JSON.stringify({
    bids: bids, // Send the raw objects
    asks: asks,
    trades: trades,
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(state);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("Client connected");
  // Send initial state
  ws.send(
    JSON.stringify({
      bids: bids,
      asks: asks,
      trades: trades,
      isSimulating: !!simulationInterval,
    })
  );

  ws.on("message", (message) => {
    try {
      const command = message.toString();
      console.log("Received command:", command);
      if (command === "start") {
        startSimulation();
      } else if (command === "stop") {
        stopSimulation();
      }
      // Broadcast status change immediately
      broadcastState(); // Include isSimulating status indirectly via interval check
    } catch (error) {
      console.error("Failed to process message:", error);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
});

// --- Simulation Control ---
function startSimulation() {
  if (simulationInterval) return; // Already running
  console.log("Starting simulation...");
  simulationInterval = setInterval(() => {
    const order = generateRandomOrder();
    processOrder(order);
    broadcastState(); // Send update after processing
  }, 750); // Generate order every 750ms
}

function stopSimulation() {
  if (!simulationInterval) return; // Already stopped
  console.log("Stopping simulation...");
  clearInterval(simulationInterval);
  simulationInterval = null;
}

// --- Server Start ---
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  // Optional: Start simulation automatically on server start
  // startSimulation();
});

// Basic REST endpoint (optional, as we use WebSockets)
app.get("/api/state", (req, res) => {
  res.json({
    bids: bids,
    asks: asks,
    trades: trades,
    isSimulating: !!simulationInterval,
  });
});
