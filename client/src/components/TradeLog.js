// src/components/TradeLog.js
import React from "react";

const formatPrice = (price) => parseFloat(price).toFixed(2);
const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

function TradeLog({ trades }) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-semibold text-center text-purple-600 mb-2">
        Recent Trades
      </h3>
      <div className="flex-grow overflow-y-auto border border-gray-200 rounded bg-white p-2">
        {trades.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400 italic">
            No trades yet
          </div>
        )}
        <ul className="space-y-1">
          {trades.map((trade, index) => (
            <li
              key={`${trade.time}-${index}`} // More robust key
              className="flex justify-between items-center text-xs border-b border-gray-100 last:border-b-0 py-1"
            >
              <span className="text-gray-500 w-1/4">
                {formatTime(trade.time)}
              </span>
              <span className="text-right w-3/4">
                <span className="font-medium text-gray-700">
                  {trade.quantity}
                </span>
                <span className="text-gray-500 mx-1">@</span>
                <span className="font-semibold text-blue-600">
                  {formatPrice(trade.price)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default TradeLog;
