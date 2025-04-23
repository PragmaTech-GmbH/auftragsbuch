// src/components/PriceChart.js
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Helper to format timestamp for X-axis
const formatXAxis = (tickItem) => {
  return new Date(tickItem).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Helper to format price for Y-axis and Tooltip
const formatPrice = (price) => {
  return price.toFixed(2);
};

function PriceChart({ data }) {
  // Ensure data is sorted chronologically (oldest first) for the chart
  const chartData = [...data].reverse(); // Reverse a copy

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Waiting for trade data...
      </div>
    );
  }

  // Determine price domain with a small buffer for better visualization
  const prices = chartData.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const buffer = (maxPrice - minPrice) * 0.1 || 1; // Add 10% buffer or 1 unit if flat

  return (
    // ResponsiveContainer ensures the chart fills its parent
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={chartData}
        margin={{
          top: 5,
          right: 20, // Add some right margin for labels
          left: 0, // Add left margin for labels
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="time"
          tickFormatter={formatXAxis}
          angle={-30} // Angle labels slightly if they overlap
          textAnchor="end"
          height={50} // Increase height for angled labels
          tick={{ fontSize: 10, fill: "#6b7280" }} // Style ticks
          stroke="#9ca3af"
        />
        <YAxis
          dataKey="price"
          domain={[minPrice - buffer, maxPrice + buffer]} // Dynamic domain with buffer
          tickFormatter={formatPrice}
          tick={{ fontSize: 10, fill: "#6b7280" }} // Style ticks
          stroke="#9ca3af"
          // label={{ value: 'Price (€)', angle: -90, position: 'insideLeft', fill: '#6b7280' }} // Optional Y-axis label
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            border: "1px solid #d1d5db",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
          labelFormatter={(label) => `Time: ${formatXAxis(label)}`} // Format tooltip label (time)
          formatter={(value, name, props) => [
            `Price: ${formatPrice(value)}`, // Format tooltip value (price)
            `Volume: ${props.payload.quantity}`, // Show volume as well
          ]}
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="price"
          name="Trade Price" // Name for Legend and Tooltip
          stroke="#3b82f6" // Tailwind blue-500
          strokeWidth={2}
          dot={false} // Hide dots for cleaner look with many points
          activeDot={{ r: 6 }} // Style for dot on hover
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default PriceChart;
