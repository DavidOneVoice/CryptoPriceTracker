import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Sparklines, SparklinesLine } from "react-sparklines";
import "./App.css";

const CryptoList = () => {
  const [coins, setCoins] = useState([]);
  const [detailedCoins, setDetailedCoins] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [activeTab, setActiveTab] = useState("markets");
  const [searchTerm, setSearchTerm] = useState("");
  const prevPricesRef = useRef({});

  // Fetch all coins
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get(
          "https://coinranking1.p.rapidapi.com/coins",
          {
            headers: {
              "X-RapidAPI-Key":
                "0f9356c3cemsh261eaa5adabb825p1342b2jsnd29d75618110",
              "X-RapidAPI-Host": "coinranking1.p.rapidapi.com",
            },
          }
        );

        const allCoins = response.data.data.coins;

        // Optional: keep popular symbols at the top
        const popularSymbols = [
          "BTC",
          "ETH",
          "USDT",
          "LTC",
          "BNB",
          "SOL",
          "DOGE",
          "MATIC",
          "TRX",
          "USDC",
          "BUSD",
          "BCH",
        ];

        const sortedCoins = [
          ...allCoins.filter((c) => popularSymbols.includes(c.symbol)), // favorites
          ...allCoins.filter((c) => !popularSymbols.includes(c.symbol)), // rest
        ];

        setCoins(sortedCoins);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCoins();
  }, []);

  // Fetch coin details
  const fetchAdditionalData = async (coin) => {
    try {
      const response = await axios.get(
        `https://coinranking1.p.rapidapi.com/coin/${coin.uuid}`,
        {
          params: { referenceCurrencyUuid: "yhjMzLPhuIDl" },
          headers: {
            "X-RapidAPI-Key":
              "0f9356c3cemsh261eaa5adabb825p1342b2jsnd29d75618110",
            "X-RapidAPI-Host": "coinranking1.p.rapidapi.com",
          },
        }
      );

      const data = response.data.data.coin;

      return {
        ...coin,
        marketCap: data.marketCap || "N/A",
        volume24h: data["24hVolume"] || "N/A",
        change24h: data.change || "N/A",
        allTimeHigh: data.allTimeHigh?.price || "N/A",
        circulatingSupply: data.supply?.circulating || "N/A",
        totalSupply: data.supply?.total || "N/A",
        price: data.price || "N/A",
        description: data.description || "No description available.",
        iconUrl: data.iconUrl,
        coinrankingUrl: data.coinrankingUrl,
        sparkline: data.sparkline || [],
      };
    } catch (err) {
      console.error(err);
      return {
        ...coin,
        marketCap: "N/A",
        volume24h: "N/A",
        change24h: "N/A",
        allTimeHigh: "N/A",
        circulatingSupply: "N/A",
        totalSupply: "N/A",
        price: "N/A",
        description: "No description available.",
        sparkline: [],
      };
    }
  };

  // Fetch details and refresh every 10s
  useEffect(() => {
    const fetchAllDetails = async () => {
      const details = await Promise.all(coins.map(fetchAdditionalData));
      setDetailedCoins(details);
      details.forEach((c) => (prevPricesRef.current[c.uuid] = c.price));
    };
    if (coins.length) fetchAllDetails();
    const interval = setInterval(() => {
      if (coins.length) fetchAllDetails();
    }, 10000);
    return () => clearInterval(interval);
  }, [coins]);

  const toggleTheme = () => setIsDarkTheme((prev) => !prev);

  const filteredCoins = detailedCoins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriceChangeClass = (coin) => {
    const prevPrice = prevPricesRef.current[coin.uuid];
    if (!prevPrice || prevPrice === coin.price) return "";
    return Number(coin.price) > Number(prevPrice) ? "price-up" : "price-down";
  };

  return (
    <div
      className={`app-container ${isDarkTheme ? "dark-theme" : "light-theme"}`}
    >
      {/* Header */}
      <header className="app-header">
        <h1>Crypto Tracker</h1>
        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? "🌞" : "🌙"}
        </button>
      </header>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search coins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Coin List */}
      <main className="main-content">
        {filteredCoins.map((crypto) => (
          <div key={crypto.uuid} className="coin-card">
            <div className="coin-top">
              <img src={crypto.iconUrl} alt={crypto.name} />
              <h2>
                {crypto.name} ({crypto.symbol})
              </h2>
            </div>

            <div className="coin-prices">
              <p className={`price ${getPriceChangeClass(crypto)}`}>
                Price: $
                {crypto.price !== "N/A"
                  ? Number(crypto.price).toLocaleString()
                  : crypto.price}
              </p>
              <p>24h Change: {crypto.change24h}%</p>
              <p>
                Market Cap:{" "}
                {crypto.marketCap !== "N/A"
                  ? Number(crypto.marketCap).toLocaleString()
                  : crypto.marketCap}
              </p>
            </div>

            {crypto.sparkline.length > 0 && (
              <Sparklines data={crypto.sparkline} svgWidth={200} svgHeight={50}>
                <SparklinesLine
                  color={crypto.change24h >= 0 ? "#00ff88" : "#ff5555"}
                />
              </Sparklines>
            )}

            <details>
              <summary>More Info</summary>
              <p>{crypto.description}</p>
              <p>All-Time High: ${crypto.allTimeHigh}</p>
              <p>
                Circulating Supply:{" "}
                {crypto.circulatingSupply !== "N/A"
                  ? Number(crypto.circulatingSupply).toLocaleString()
                  : crypto.circulatingSupply}
              </p>
              <p>
                Total Supply:{" "}
                {crypto.totalSupply !== "N/A"
                  ? Number(crypto.totalSupply).toLocaleString()
                  : crypto.totalSupply}
              </p>
              <a
                href={crypto.coinrankingUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on CoinRanking
              </a>
            </details>
          </div>
        ))}
      </main>

      {/* Bottom Navigation */}
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
