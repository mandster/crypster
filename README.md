Crypster: Cryptocurrency Trading Dashboard
Overview
Crypster is a React-based web application designed to simplify cryptocurrency trading using Relative Strength Index (RSI) and Bollinger Bands. It integrates with the MEXC exchange for real-time market data via WebSocket and trade execution. With candlestick charts, an order panel, risk management, and a trading journal with CSV export, Crypster empowers users to make quick, informed trades without information overload.
Features

Real-Time Data: Streams 1-hour candlestick and price data for BTCUSDT, ETHUSDT, XRPUSDT via MEXC WebSocket with heartbeat for reliability.
Candlestick Charts: Displays price, volume, RSI, and Bollinger Bands using Lightweight Charts.
Buy Signals: Triggers when RSI < 30 and price is at or below the lower Bollinger Band, with suggested stop-loss (2% below) and take-profit (middle band).
Order Panel: Places real trades on MEXC with prefilled signal-based parameters.
Risk Management: Configures stop-loss, take-profit, and position size based on risk percentage.
Trading Journal: Logs trade details (time, symbol, action, price, MEXC order ID, outcome, profit/loss) with CSV export.
Stop-Loss/Take-Profit Monitoring: Automatically updates trade outcomes when price hits stop-loss or take-profit levels.
Customizable: Adjust RSI threshold for signals.
Responsive: Supports light/dark themes and all screen sizes.

Prerequisites

Node.js: Version 16+ (LTS recommended).
npm/Yarn: For dependency management.
MEXC API Access: Obtain API key and secret from MEXC (https://www.mexc.com/user/api) for trading.
Browser: Chrome, Firefox, or Edge.

Installation

Clone Repository:
git clone https://github.com/mandster/crypster.git
cd crypster


Install Dependencies:
npm install
npm install dompurify @types/dompurify crypto
# or
yarn install
yarn add dompurify @types/dompurify crypto


Configure Environment:

Create .env.local:MEXC_API_KEY=your_mexc_api_key
MEXC_API_SECRET=your_mexc_api_secret


The MEXC WebSocket (wss://wbs.mexc.com/ws) does not require API keys for public data.


Run Application:
npm run dev
# or
yarn dev


Open http://localhost:3000.



Usage
Configuring MEXC API

Sign into MEXC, navigate to API management, and create an API key with trading permissions.
Add MEXC_API_KEY and MEXC_API_SECRET to .env.local for trade execution.
Ensure your MEXC account has funds (e.g., USDT for BTCUSDT).

Selecting a Trading Pair

Choose BTCUSDT, ETHUSDT, or XRPUSDT from the dropdown in ChartContainer.
Adjust RSI threshold (default: 30) to fine-tune signals.
View real-time price, volume, RSI, and Bollinger Bands on the chart.

Interpreting Buy Signals

Signal: RSI < 30 and price at or below the lower Bollinger Band.
Visual Cue: Yellow highlight with “Buy Signal” and suggested stop-loss/take-profit.
Example: For BTCUSDT, RSI = 27.5, price = 64,600 (lower BB = 64,500) triggers a signal with stop-loss at 63,308 and take-profit at 66,250.

Taking Action

Spot Signal:
When a signal appears, click “Trade Now” to prefill the Order Panel.


Place Trade:
Review prefilled price, amount, stop-loss, and take-profit.
Click “Place Trade” to execute on MEXC.


Manage Risks:
Adjust risk per trade (1%), stop-loss (2%), and take-profit (4%) in Risk Management.


Track Performance:
View trades in Trading Journal, including MEXC order ID, outcome, and profit/loss.
Export trade history as CSV using the “Export to CSV” button.


Monitor Outcomes:
Open trades are monitored every 5 seconds; Trading Journal updates when stop-loss or take-profit is hit.



Example Workflow

Select XRPUSDT.
Signal triggers: RSI = 26.2, price = 0.43 (lower BB = 0.42).
Click “Trade Now” to prefill Order Panel (price: 0.43, stop-loss: 0.42, take-profit: 0.45).
Place trade and monitor in Trading Journal (check MEXC order ID and outcome).
Export trades to CSV for analysis.

Security Considerations

API Security: Store MEXC API keys securely in .env.local and use HTTPS for API calls.
XSS Prevention: Inputs are sanitized with DOMPurify.
Rate Limits: MEXC WebSocket has no strict rate limits for public data; trading API allows 20 requests/sec.
Risk Warning: Trading is risky. Use signals as a guide and set stop-losses.

Troubleshooting

Chart Not Updating: Check console for WebSocket errors (e.g., connection failures). Verify selectedSymbol matches MEXC format (e.g., BTCUSDT). Ensure heartbeat pings are sent every 30 seconds.
Trading Journal Error: If trades don’t appear, verify tradeJournalType (should be object) and tradeJournalLength in console logs.
Stop-Loss/Take-Profit Not Triggering: Ensure currentPrice updates via WebSocket and MEXC ticker API returns valid prices.
CSV Export Issues: Check downloaded CSV for formatting; ensure tradeJournal has data.
MEXC API Errors: Check for 429 (rate limit) or 401 (auth) errors in page.tsx. Verify API keys and account funds.
Contact: Share console logs with [your-email@example.com].

Contributing

Fork the repository.
Create a branch (git checkout -b feature/your-feature).
Commit changes (git commit -m "Add feature").
Push (git push origin feature/your-feature).
Open a Pull Request.

License
MIT License. See LICENSE.
Disclaimer
Crypster is a trading tool integrated with MEXC. Cryptocurrency trading carries significant risks. Conduct your own research and consult a financial advisor.
Contact
Open a GitHub issue or email [your-email@example.com].