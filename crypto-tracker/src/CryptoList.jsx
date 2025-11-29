import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Sparklines, SparklinesLine } from "react-sparklines";
import "./App.css";

const CryptoList = () => {
  const [coins, setCoins] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [activeTab, setActiveTab] = useState("markets");
  const [searchTerm, setSearchTerm] = useState("");
  const prevPricesRef = useRef({});

  // Fetch ONLY markets data (safe, CORS supported)
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              order: "market_cap_desc",
              per_page: 250,
              page: 1,
              sparkline: true,
            },
          }
        );

        setCoins(response.data);

        // Save prices for blinking animation
        response.data.forEach((coin) => {
          prevPricesRef.current[coin.id] = coin.current_price;
        });
      } catch (err) {
        console.error("Error fetching coins:", err);
      }
    };

    fetchCoins();

    // Auto refresh
    const interval = setInterval(fetchCoins, 10000);
    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  const filteredCoins = coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriceChangeClass = (coin) => {
    const prev = prevPricesRef.current[coin.id];
    if (!prev) return "";
    return coin.current_price > prev ? "price-up" : "price-down";
  };

  return (
    <div
      className={`app-container ${isDarkTheme ? "dark-theme" : "light-theme"}`}
    >
      <header className="app-header">
        <h1>Crypto Tracker</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? "🌞" : "🌙"}
        </button>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search coins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <main className="main-content">
        {filteredCoins.map((crypto) => (
          <div key={crypto.id} className="coin-card">
            <div className="coin-top">
              <img src={crypto.image} alt={crypto.name} />
              <h2>
                {crypto.name} ({crypto.symbol.toUpperCase()})
              </h2>
            </div>

            <div className="coin-prices">
              <p className={`price ${getPriceChangeClass(crypto)}`}>
                Price: ${crypto.current_price.toLocaleString()}
              </p>
              <p>24h Change: {crypto.price_change_percentage_24h}%</p>
              <p>Market Cap: ${crypto.market_cap.toLocaleString()}</p>
            </div>

            {crypto.sparkline_in_7d?.price?.length > 0 && (
              <Sparklines
                data={crypto.sparkline_in_7d.price}
                svgWidth={200}
                svgHeight={50}
              >
                <SparklinesLine
                  color={
                    crypto.price_change_percentage_24h >= 0
                      ? "#00ff88"
                      : "#ff5555"
                  }
                />
              </Sparklines>
            )}

            <details>
              <summary>More Info</summary>
              <p>All-Time High: ${crypto.ath}</p>
              <p>
                Circulating Supply:{" "}
                {crypto.circulating_supply?.toLocaleString()}
              </p>
              <p>Total Supply: {crypto.total_supply?.toLocaleString()}</p>
            </details>
          </div>
        ))}
      </main>

      <nav className="bottom-nav">
        {["home", "markets", "watchlist", "settings"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CryptoList;
