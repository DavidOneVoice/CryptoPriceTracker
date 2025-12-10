import React, { useState } from "react";
import "../Styles/Home.css";

const Home = ({ coins, isDarkTheme }) => {
  const [activeList, setActiveList] = useState("gainers"); // "gainers" or "losers"

  if (!coins || coins.length === 0) {
    return (
      <div className="home-container">
        <p>Loading market overview…</p>
      </div>
    );
  }

  const topGainers = [...coins]
    .sort(
      (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h
    )
    .slice(0, 5);

  const topLosers = [...coins]
    .sort(
      (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h
    )
    .slice(0, 5);

  const trending = [...coins]
    .sort((a, b) => a.market_cap_rank - b.market_cap_rank)
    .slice(0, 6);

  const totalMarketCap = coins.reduce((sum, c) => sum + c.market_cap, 0);
  const totalVolume = coins.reduce((sum, c) => sum + c.total_volume, 0);

  const listToShow = activeList === "gainers" ? topGainers : topLosers;

  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <h2>Welcome back 👋</h2>
        <p>Here’s what’s happening in the crypto market today.</p>
      </div>

      {/* Market Overview */}
      <div className="home-section">
        <h3 className="section-title">Market Overview</h3>
        <div
          className="home-card"
          style={{
            backgroundColor: isDarkTheme ? "#111" : "#fff",
            color: isDarkTheme ? "white" : "black",
          }}
        >
          <p>
            Total Market Cap: <span>${totalMarketCap.toLocaleString()}</span>
          </p>
          <p>
            24h Volume: <span>${totalVolume.toLocaleString()}</span>
          </p>
          <p>
            Listed Coins: <span>{coins.length}</span>
          </p>
        </div>
      </div>

      {/* Gainers / Losers Toggle */}
      <div className="home-section">
        <h3 className="section-title">Market Movers</h3>

        <div className="toggle-buttons">
          <button
            style={{
              color: isDarkTheme ? "#fff" : "#000",
            }}
            className={activeList === "gainers" ? "active-toggle" : ""}
            onClick={() => setActiveList("gainers")}
          >
            Top Gainers 🚀
          </button>

          <button
            style={{
              color: isDarkTheme ? "#fff" : "#000",
            }}
            className={activeList === "losers" ? "active-toggle" : ""}
            onClick={() => setActiveList("losers")}
          >
            Top Losers 📉
          </button>
        </div>

        <div className="list-container">
          {listToShow.map((c) => (
            <div
              key={c.id}
              className="list-item"
              style={{
                backgroundColor:
                  activeList === "gainers"
                    ? isDarkTheme
                      ? "#0f1f0f"
                      : "#eaffea"
                    : isDarkTheme
                    ? "#2a1616"
                    : "#ffe8e8",
              }}
            >
              <img src={c.image} alt={c.name} />
              <p>{c.name}</p>
              <span className={activeList === "gainers" ? "gainer" : "loser"}>
                {activeList === "gainers"
                  ? `+${c.price_change_percentage_24h.toFixed(2)}%`
                  : `${c.price_change_percentage_24h.toFixed(2)}%`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="home-section">
        <h3 className="section-title">Trending 🔥</h3>
        <div className="trending-grid">
          {trending.map((coin) => (
            <div
              key={coin.id}
              className="trending-item"
              style={{
                backgroundColor: isDarkTheme ? "#1a1a1a" : "#f3f3f3",
              }}
            >
              <img src={coin.image} alt={coin.name} />
              <p>{coin.name}</p>
              <small>Rank #{coin.market_cap_rank}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
