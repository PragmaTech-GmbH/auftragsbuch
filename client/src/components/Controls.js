// src/components/Controls.js
import React from "react";

function Controls({ isSimulating, onStart, onStop, isConnected }) {
  const baseButtonClass =
    "px-4 py-2 rounded font-semibold text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const startButtonClass = `${baseButtonClass} bg-green-500 hover:bg-green-600 focus:ring-green-500`;
  const stopButtonClass = `${baseButtonClass} bg-red-500 hover:bg-red-600 focus:ring-red-500`;

  return (
    <div className="p-4 mb-6 bg-white rounded-lg shadow">
      <div className="flex justify-center space-x-4">
        <button
          className={startButtonClass}
          onClick={onStart}
          disabled={isSimulating || !isConnected}
        >
          Start Simulation
        </button>
        <button
          className={stopButtonClass}
          onClick={onStop}
          disabled={!isSimulating || !isConnected}
        >
          Stop Simulation
        </button>
      </div>
      <div className="mt-3 text-center text-sm text-gray-600 italic">
        Status:{" "}
        {isConnected
          ? isSimulating
            ? "Running"
            : "Connected (Stopped)"
          : "Disconnected"}
      </div>
    </div>
  );
}

export default Controls;
