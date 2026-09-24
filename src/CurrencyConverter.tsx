import { useState, useEffect, useCallback } from "react";
import "./App.css";

const API_BASE = "/api/currencybeacon";
const API_KEY = import.meta.env.VITE_CURRENCYBEACON_API_KEY;

interface Currency {
  code: string;
  name: string;
}

interface CurrencyApiItem {
  code?: string;
  currency_code?: string;
  short_code?: string;
  name?: string;
  currency_name?: string;
}

interface CurrenciesResponse {
  response?: CurrencyApiItem[];
  data?: CurrencyApiItem[];
}

interface ConvertResponse {
  meta: { code: number };
  response: {
    from: string;
    to: string;
    amount: number;
    value: number;
  };
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<string>("1");
  const [from, setFrom] = useState<string>("USD");
  const [to, setTo] = useState<string>("EUR");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const loadCurrencies = async () => {
      if (!API_KEY) {
        setError("Add VITE_CURRENCYBEACON_API_KEY to your .env file");
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/currencies?api_key=${API_KEY}`);
        if (!res.ok) throw new Error("Failed to fetch currencies");

        const data: CurrenciesResponse = await res.json();
        const items = data.response ?? data.data ?? [];
        const options = items
          .map((item) => ({
            code: item.short_code ?? item.currency_code ?? item.code ?? "",
            name: item.name ?? item.currency_name ?? "",
          }))
          .filter((currency) => currency.code);

        if (options.length === 0) throw new Error("No currencies were returned");
        setCurrencies(options);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load currencies");
      }
    };

    loadCurrencies();
  }, []);

  const convert = useCallback(async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount < 0) {
      setError("Enter a valid amount");
      setResult(null);
      return;
    }
    if (from === to) {
      setResult(numericAmount);
      setRate(1);
      setError("");
      return;
    }

    if (!API_KEY || currencies.length === 0) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/convert?api_key=${API_KEY}&from=${from}&to=${to}&amount=${numericAmount}`
      );
      if (!res.ok) throw new Error("Failed to fetch exchange rate");
      const data: ConvertResponse = await res.json();
      if (data.meta.code !== 200) throw new Error("CurrencyBeacon returned an error");
      const converted = data.response.value;
      setResult(converted);
      setRate(converted / numericAmount);
      setDate(new Date().toLocaleDateString());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [amount, currencies.length, from, to]);

  // Debounce conversion as inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      convert();
    }, 400);
    return () => clearTimeout(timer);
  }, [convert]);

  const swapCurrencies = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <main className="converter-page">
      <section className="converter-card">
        <h1>Currency Converter</h1>

        <label className="field-label" htmlFor="amount">Amount</label>
        <input
          id="amount"
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="amount-input"
          placeholder="Enter amount"
        />

        <div className="currency-row">
          <div className="currency-field">
            <label className="field-label" htmlFor="from">From</label>
            <select
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="currency-select"
              disabled={currencies.length === 0}
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={swapCurrencies}
            className="swap-button"
            aria-label="Swap currencies"
            title="Swap currencies"
          >
            ⇄
          </button>

          <div className="currency-field">
            <label className="field-label" htmlFor="to">To</label>
            <select
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="currency-select"
              disabled={currencies.length === 0}
            >
              {currencies.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code} - {currency.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="result-box" aria-live="polite">
          {loading && <p className="muted-text">Converting...</p>}
          {!loading && error && <p className="error-text">{error}</p>}
          {!loading && !error && result !== null && (
            <>
              <p className="result-text">
                {amount} {from} = {result.toFixed(2)} {to}
              </p>
              {rate !== null && (
                <p className="muted-text">
                  1 {from} = {rate.toFixed(4)} {to}
                  {date ? ` · rates from ${date}` : ""}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}

