import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Sparklines, SparklinesLine } from "react-sparklines";
import { db, auth } from "./firebase";
import { signOut } from "firebase/auth";
import AuthForm from "./AuthForm";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import HomeIcon from "@mui/icons-material/Home";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import BookmarksIcon from "@mui/icons-material/Bookmarks";
import LogoutIcon from "@mui/icons-material/Logout";
import Home from "./Components/Home";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import "./App.css";

const CryptoList = () => {
  const [coins, setCoins] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [activeTab, setActiveTab] = useState("markets");
  const [searchTerm, setSearchTerm] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const prevPricesRef = useRef({});
  const [user, setUser] = useState(null);

  // Track user auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Load watchlist from Firebase
  useEffect(() => {
    if (!user) return;

    const loadWatchlist = async () => {
      setLoadingWatchlist(true);
      try {
        const docRef = doc(db, "watchlists", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setWatchlist(docSnap.data().coins);
        } else {
          setWatchlist([]);
        }
      } catch (err) {
        console.error("Error loading watchlist:", err);
        setWatchlist([]);
      } finally {
        setLoadingWatchlist(false);
      }
    };

    loadWatchlist();
  }, [user]);

  // Save watchlist to Firebase whenever it changes
  useEffect(() => {
    if (!user) return;
    const saveWatchlist = async () => {
      try {
        const docRef = doc(db, "watchlists", user.uid);
        await setDoc(docRef, { coins: watchlist });
      } catch (err) {
        console.error("Error saving watchlist:", err);
      }
    };
    saveWatchlist();
  }, [watchlist, user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null); // Reset local user state
      showToastMessage("Logged out successfully");
    } catch (err) {
      console.error("Logout error:", err);
      showToastMessage("Failed to log out");
    }
  };

  // Show toast messages
  const showToastMessage = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  // Fetch coins from API (only when user opens app or switches tabs)
  const fetchCoins = async () => {
    try {
      setError("");
      setInitialLoading(true);

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
          timeout: 30000,
        }
      );

      setCoins((prevCoins) => {
        response.data.forEach((coin) => {
          prevPricesRef.current[coin.id] =
            prevPricesRef.current[coin.id] ?? coin.current_price;
        });
        return response.data;
      });
    } catch (err) {
      console.error("Error fetching coins:", err);
      setError(
        "Failed to load crypto data. Please check your connection or try again later."
      );
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch coins when user switches tabs
  useEffect(() => {
    if (activeTab === "markets" || activeTab === "watchlist") {
      fetchCoins();
    }
  }, [activeTab]);

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

  const toggleWatchlist = (coinId, coinName) => {
    setWatchlist((prev) => {
      if (prev.includes(coinId)) {
        showToastMessage(`${coinName} removed from Watchlist`);
        return prev.filter((id) => id !== coinId);
      } else {
        showToastMessage(`${coinName} added to Watchlist`);
        return [...prev, coinId];
      }
    });
  };

  const watchlistCoins = coins.filter((coin) => watchlist.includes(coin.id));

  // Show auth form if user is not logged in
  if (!user) {
    return <AuthForm onAuth={(u) => setUser(u)} />;
  }

  const tabIcons = {
    home: <HomeIcon />,
    markets: <CandlestickChartIcon />,
    watchlist: <BookmarksIcon />,
    logout: <LogoutIcon />,
  };

  return (
    <div
      className={`app-container ${isDarkTheme ? "dark-theme" : "light-theme"}`}
    >
      <header
        className="app-header"
        style={{ backgroundColor: isDarkTheme ? "black" : "white" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1>Crypto Tracker</h1>
          {refreshing && <div className="small-spinner" aria-hidden />}
        </div>

        <button className="theme-toggle" onClick={toggleTheme}>
          {isDarkTheme ? (
            <LightModeIcon style={{ color: "white" }} />
          ) : (
            <DarkModeIcon />
          )}
        </button>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search coins..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ border: isDarkTheme ? "" : "1px solid black" }}
        />
      </div>

      <main className="main-content">
        {initialLoading && (
          <div className="loading-overlay">
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Fetching crypto prices...</p>
            </div>
          </div>
        )}

        {error && !initialLoading && <p className="error-message">{error}</p>}

        {activeTab === "home" && !initialLoading && !error && (
          <Home coins={coins} isDarkTheme={isDarkTheme} />
        )}

        {activeTab === "markets" &&
          !initialLoading &&
          !error &&
          (filteredCoins.length > 0 ? (
            filteredCoins.map((crypto) => (
              <div
                key={crypto.id}
                className="coin-card"
                style={{ backgroundColor: isDarkTheme ? "black" : "white" }}
              >
                <div className="coin-top">
                  <img src={crypto.image} alt={crypto.name} />
                  <h2>
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </h2>
                </div>
                <br />
                <button
                  style={{ color: isDarkTheme ? "white" : "black" }}
                  className={`watch-btn ${
                    watchlist.includes(crypto.id) ? "on" : ""
                  }`}
                  onClick={() => toggleWatchlist(crypto.id, crypto.name)}
                >
                  {watchlist.includes(crypto.id) ? (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {" "}
                      <StarIcon /> Remove from Watchlist
                    </span>
                  ) : (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      {" "}
                      <StarBorderIcon /> Add to Watchlist
                    </span>
                  )}
                </button>

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
                  <summary>More Details</summary>
                  <p>High 24h: ${crypto.high_24h?.toLocaleString()}</p>
                  <p>Low 24h: ${crypto.low_24h?.toLocaleString()}</p>
                  <p>Total Volume: ${crypto.total_volume?.toLocaleString()}</p>
                  <p>
                    Circulating Supply:{" "}
                    {crypto.circulating_supply?.toLocaleString()}
                  </p>
                  <p>
                    Max Supply: {crypto.max_supply?.toLocaleString() || "N/A"}
                  </p>
                  <a
                    href={`https://www.coingecko.com/en/coins/${crypto.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on CoinGecko
                  </a>
                </details>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", marginTop: 20 }}>No coins found</p>
          ))}
        {loadingWatchlist && (
          <p style={{ textAlign: "center" }}>Loading Crypto Prices...</p>
        )}

        {activeTab === "watchlist" &&
          !initialLoading &&
          !error &&
          (watchlistCoins.length === 0 ? (
            <p className="empty-watch">
              Your watchlist is empty. Add coins by tapping “☆ Add”
            </p>
          ) : (
            watchlistCoins.map((crypto) => (
              <div key={crypto.id} className="coin-card">
                <div className="coin-top">
                  <img src={crypto.image} alt={crypto.name} />
                  <h2>
                    {crypto.name} ({crypto.symbol.toUpperCase()})
                  </h2>
                </div>

                <button
                  className="watch-btn on"
                  onClick={() => toggleWatchlist(crypto.id, crypto.name)}
                >
                  ★ Remove
                </button>

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
                  <summary>More Details</summary>
                  <p>High 24h: ${crypto.high_24h?.toLocaleString()}</p>
                  <p>Low 24h: ${crypto.low_24h?.toLocaleString()}</p>
                  <p>Total Volume: ${crypto.total_volume?.toLocaleString()}</p>
                  <p>
                    Circulating Supply:{" "}
                    {crypto.circulating_supply?.toLocaleString()}
                  </p>
                  <p>
                    Max Supply: {crypto.max_supply?.toLocaleString() || "N/A"}
                  </p>
                  <a
                    href={`https://www.coingecko.com/en/coins/${crypto.id}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View on CoinGecko
                  </a>
                </details>
              </div>
            ))
          ))}
      </main>

      <nav
        className="bottom-nav"
        style={{ backgroundColor: isDarkTheme ? "black" : "white" }}
      >
        {["home", "markets", "watchlist", "logout"].map((tab) => (
          <button
            key={tab}
            style={{
              color: isDarkTheme ? "white" : "black",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              fontSize: "12px",
            }}
            className={activeTab === tab ? "active" : ""}
            onClick={() => {
              if (tab === "logout") {
                handleLogout();
              } else {
                setActiveTab(tab);
              }
            }}
          >
            {tabIcons[tab]}
            <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
          </button>
        ))}
      </nav>

      {showToast && <div className="toast-alert">{toastMessage}</div>}
    </div>
  );
};

export default CryptoList;
