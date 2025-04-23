// src/App.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import OrderBook from "./components/OrderBook";
import TradeLog from "./components/TradeLog";
import Controls from "./components/Controls";
import PriceChart from "./components/PriceChart"; // Import the chart

const WEBSOCKET_URL =
  process.env.REACT_APP_WEBSOCKET_URL || "ws://localhost:3001";
  
const MAX_CHART_POINTS = 50; // Limit data points for chart performance

function App() {
  const [bids, setBids] = useState({});
  const [asks, setAsks] = useState({});
  const [trades, setTrades] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const ws = useRef(null);

  // Prepare data for the chart (limit points)
  const chartData = trades.slice(0, MAX_CHART_POINTS);

  const connectWebSocket = useCallback(() => {
    console.log("Attempting to connect WebSocket...");
    ws.current = new WebSocket(WEBSOCKET_URL);

    ws.current.onopen = () => {
      console.log("WebSocket Connected");
      setIsConnected(true);
    };

    ws.current.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
      setIsSimulating(false);
      setTimeout(connectWebSocket, 5000);
    };

    ws.current.onerror = (error) => {
      console.error("WebSocket Error:", error);
      ws.current.close();
    };

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.bids) setBids(data.bids);
        if (data.asks) setAsks(data.asks);
        if (data.trades) setTrades(data.trades); // Keep newest first
        if (typeof data.isSimulating === "boolean") {
          setIsSimulating(data.isSimulating);
        }
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    };
  }, []); // Empty dependency array ensures this function is stable

  useEffect(() => {
    connectWebSocket();
    return () => {
      ws.current?.close();
    };
  }, [connectWebSocket]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    } else {
      console.error("WebSocket not connected.");
    }
  };

  const handleStart = () => {
    sendMessage("start");
    setIsSimulating(true);
  };

  const handleStop = () => {
    sendMessage("stop");
    setIsSimulating(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-700">
        Auftragsbuch Simulation
      </h1>

      <Controls
        isSimulating={isSimulating}
        onStart={handleStart}
        onStop={handleStop}
        isConnected={isConnected}
      />

      {/* Chart Section */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-semibold text-center mb-4 text-gray-700">
          Price Chart (Last {MAX_CHART_POINTS} Trades)
        </h2>
        <PriceChart data={chartData} />
      </div>

      {/* Order Book and Trade Log Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-lg shadow">
          <OrderBook bids={bids} asks={asks} />
        </div>
        <div className="p-4 bg-white rounded-lg shadow min-h-[400px] lg:min-h-0">
          {" "}
          {/* Ensure TradeLog has height */}
          <TradeLog trades={trades} />
        </div>
      </div>
    </div>
  );
}

export default App;
