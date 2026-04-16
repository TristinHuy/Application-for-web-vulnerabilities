import React, { useState } from "react";
import axios from "axios";

export default function AdminPanel() {
  const [userId, setUserId] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [sleepTime, setSleepTime] = useState(1);
  const [result, setResult] = useState("");

  const API = "http://localhost:8000";

  // DELETE USER
  const handleDelete = async () => {
    try {
      const res = await axios.post(`${API}/admin/delete-user`, {
        user_id: Number(userId),
        confirm: confirm,
      });
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setResult(err.response?.data?.detail || "Error");
    }
  };

  // SLEEP
  const handleSleep = async () => {
    try {
      const res = await axios.post(`${API}/admin/sleep`, {
        seconds: Number(sleepTime),
      });
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setResult("Error");
    }
  };

  // SHUTDOWN
  const handleShutdown = async () => {
    try {
      const res = await axios.post(`${API}/admin/shutdown`);
      setResult(JSON.stringify(res.data, null, 2));
    } catch (err) {
      setResult("Server might be down");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* DELETE USER */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="font-semibold mb-2">Delete User</h2>
        <input
          type="number"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={confirm}
            onChange={(e) => setConfirm(e.target.checked)}
            className="mr-2"
          />
          Confirm delete
        </label>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete
        </button>
      </div>

      {/* SLEEP */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="font-semibold mb-2">Sleep Server</h2>
        <input
          type="number"
          value={sleepTime}
          onChange={(e) => setSleepTime(e.target.value)}
          className="border p-2 w-full mb-2"
        />
        <button
          onClick={handleSleep}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Sleep
        </button>
      </div>

      {/* SHUTDOWN */}
      <div className="mb-6 border p-4 rounded">
        <h2 className="font-semibold mb-2">Shutdown Server</h2>
        <button
          onClick={handleShutdown}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Shutdown
        </button>
      </div>

      {/* RESULT */}
      <div className="border p-4 rounded bg-gray-100">
        <h2 className="font-semibold mb-2">Result</h2>
        <pre>{result}</pre>
      </div>
    </div>
  );
}
