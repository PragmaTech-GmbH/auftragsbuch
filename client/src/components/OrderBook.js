// src/components/OrderBook.js
import React from "react";
import OrderTable from "./OrderTable";

const formatPrice = (price) => parseFloat(price).toFixed(2);

function OrderBook({ bids, asks }) {
  const bestBid =
    Object.keys(bids).length > 0
      ? Math.max(...Object.keys(bids).map(parseFloat))
      : null;
  const bestAsk =
    Object.keys(asks).length > 0
      ? Math.min(...Object.keys(asks).map(parseFloat))
      : null;

  const spread =
    bestBid !== null && bestAsk !== null
      ? formatPrice(bestAsk - bestBid)
      : "N/A";
  const spreadPercentage =
    bestBid !== null && bestAsk !== null && bestBid !== 0
      ? `${(((bestAsk - bestBid) / bestBid) * 100).toFixed(2)}%`
      : "N/A";

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-center text-blue-600 mb-2">
        Order Book
      </h3>
      <div>
        <h4 className="text-xs font-medium text-center text-red-600 uppercase mb-1">
          Asks (Sell Orders)
        </h4>
        <OrderTable data={asks} type="asks" />
      </div>
      <div className="py-2 px-3 my-2 text-center bg-gray-100 rounded border border-gray-200">
        <span className="text-sm font-semibold text-gray-700">
          Spread: {spread} ({spreadPercentage})
        </span>
      </div>
      <div>
        <h4 className="text-xs font-medium text-center text-green-600 uppercase mb-1">
          Bids (Buy Orders)
        </h4>
        <OrderTable data={bids} type="bids" />
      </div>
    </div>
  );
}

export default OrderBook;
