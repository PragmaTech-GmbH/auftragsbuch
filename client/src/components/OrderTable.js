// src/components/OrderTable.js
import React from "react";

const formatNumber = (num) => num.toLocaleString();
const formatPrice = (price) => parseFloat(price).toFixed(2);

function OrderTable({ data, type }) {
  const sortedPrices = Object.keys(data)
    .map(parseFloat)
    .sort((a, b) => (type === "bids" ? b - a : a - b));

  const isBid = type === "bids";
  const header = isBid
    ? ["Total", "Size", "Bid"]
    : ["Ask", "Size", "Total"];
  const priceColor = isBid ? "text-green-600" : "text-red-600";

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {header.map((h) => (
              <th
                key={h}
                className="px-3 py-2 text-xs font-medium tracking-wider text-right text-gray-500 uppercase"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedPrices.map((price) => {
            const quantity = data[price.toString()];
            const total = formatNumber(
              parseFloat((price * quantity).toFixed(2))
            );
            const formattedPrice = formatPrice(price);
            const formattedQuantity = formatNumber(quantity);

            return (
              <tr key={price} className="hover:bg-gray-50">
                {isBid ? (
                  <>
                    <td className="px-3 py-2 text-right whitespace-nowrap text-gray-500">
                      {total}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap text-gray-500">
                      {formattedQuantity}
                    </td>
                    <td
                      className={`px-3 py-2 text-right whitespace-nowrap font-semibold ${priceColor}`}
                    >
                      {formattedPrice}
                    </td>
                  </>
                ) : (
                  <>
                    <td
                      className={`px-3 py-2 text-right whitespace-nowrap font-semibold ${priceColor}`}
                    >
                      {formattedPrice}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap text-gray-500">
                      {formattedQuantity}
                    </td>
                    <td className="px-3 py-2 text-right whitespace-nowrap text-gray-500">
                      {total}
                    </td>
                  </>
                )}
              </tr>
            );
          })}
          {sortedPrices.length === 0 && (
            <tr>
              <td
                colSpan="3"
                className="px-3 py-4 text-center text-gray-400 italic"
              >
                Empty
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTable;
