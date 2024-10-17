import { useState, useEffect } from 'react';
import axios from 'axios';
import btclogo from './assets/btclogo.png';
import usdlogo from './assets/usdlogo.png';
import bfxlogo from './assets/bfxlogo.jpg';
import './App.css';

const CryptoList = () => {
  const [coins, setCoins] = useState([]);
  const [detailedCoins, setDetailedCoins] = useState([]);
  const [isDarkTheme, setIsDarkTheme] = useState(true); // State for theme

  // Fetch the initial list of coins
  useEffect(() => {
    const fetchCoins = async () => {
      const options = {
        method: 'GET',
        url: 'https://coinranking1.p.rapidapi.com/coins',
        headers: {
          'X-RapidAPI-Key': '0f9356c3cemsh261eaa5adabb825p1342b2jsnd29d75618110',
          'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com',
        },
      };

      try {
        const response = await axios.request(options);
        console.log('API Response:', response.data);

        const popularCoinSymbols = [
          'BTC', 'ETH', 'USDT', 'LTC', 'BNB', 'SOL', 'DOGE', 'MATIC', 'TRX', 'USDC', 'BUSD',
           'BCH'
        ];

        const sortedCoins = response.data.data.coins
          .filter(coin => popularCoinSymbols.includes(coin.symbol))
          .sort((a, b) => popularCoinSymbols.indexOf(a.symbol) - popularCoinSymbols.indexOf(b.symbol));

        setCoins(sortedCoins.length ? sortedCoins : response.data.data.coins);
      } catch (error) {
        console.error('Error fetching coins:', error);
      }
    };

    fetchCoins();
  }, []);

  // Fetch additional data for each coin
  const fetchAdditionalData = async (coin) => {
    const coinOptions = {
      method: 'GET',
      url: `https://coinranking1.p.rapidapi.com/coin/${coin.uuid}`,
      params: {
        referenceCurrencyUuid: 'yhjMzLPhuIDl',
      },
      headers: {
        'X-RapidAPI-Key': '0f9356c3cemsh261eaa5adabb825p1342b2jsnd29d75618110',
        'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com',
      },
    };

    try {
      const coinDetails = await axios.request(coinOptions);
      console.log(`Details for ${coin.name}:`, coinDetails.data.data.coin);

      const {
        marketCap = 'N/A',
        "24hVolume": volume24h = 'N/A',
        change = 'N/A',
        allTimeHigh = { price: 'N/A' },
        supply = { circulating: 'N/A', total: 'N/A' },
        price = 'N/A',
        description = 'No description available.',
        uuid,
        iconUrl,
        coinrankingUrl,
      } = coinDetails.data.data.coin || {};

      return {
        ...coin,
        marketCap,
        volume24h,
        change24h: change,
        allTimeHigh: allTimeHigh.price,
        circulatingSupply: supply.circulating,
        totalSupply: supply.total,
        price,
        description,
        uuid,
        iconUrl,
        coinrankingUrl,
      };
    } catch (error) {
      console.error(`Error fetching details for ${coin.name}:`, error);
      return {
        ...coin,
        marketCap: 'N/A',
        volume24h: 'N/A',
        change24h: 'N/A',
        allTimeHigh: 'N/A',
        circulatingSupply: 'N/A',
        totalSupply: 'N/A',
        price: 'N/A',
        description: 'No description available.',
      };
    }
  };

  // Fetch details for each coin after the initial fetch and update every 10 seconds
  useEffect(() => {
    const fetchAllDetails = async () => {
      const details = await Promise.all(coins.map(fetchAdditionalData));
      setDetailedCoins(details);
    };

    if (coins.length) {
      fetchAllDetails();
    }

    // Set an interval to update prices every 10 seconds
    const intervalId = setInterval(() => {
      if (coins.length) {
        fetchAllDetails();
      }
    }, 10000); // 10000ms = 10 seconds

    // Cleanup the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, [coins]);

  // Function to toggle theme
  const toggleTheme = () => {
    setIsDarkTheme(prevTheme => !prevTheme);
  };

  return (
    <div style={{ backgroundColor: isDarkTheme ? 'black' : 'white' }} className={`container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <section style={{ borderColor: isDarkTheme ? 'orange' : 'black' }}>
        <img className='bfxlogo' src={bfxlogo} alt='logo' />
        <img src={usdlogo} alt='usdlogo' className='currlogos' />
        <img className='currlogos' src={btclogo} alt='btclogo' />
        <button style={{ color: isDarkTheme ? 'black' : 'orange', backgroundColor: isDarkTheme ? 'orange' : 'black' }} onClick={toggleTheme}>
          {isDarkTheme ? (
            <i className="fas fa-sun" aria-label="Switch to light theme"></i>
          ) : (
            <i className="fas fa-moon" aria-label="Switch to dark theme"></i>
          )}
        </button>
      </section>
      <h2 className='topic'>GET LIVE UPDATE FOR POPULAR COINS</h2>

      <ul>
        {detailedCoins.map((crypto) => (
          <li key={crypto.uuid} style={{ backgroundColor: isDarkTheme ? 'black' : 'white', borderColor: isDarkTheme ? 'orange' : 'black' }}>
            <div style={{ borderBottom: '1px solid', borderRadius: '10px', borderColor: isDarkTheme ? 'orange' : 'black', marginBottom: '2em' }}>
              <h2 className='nameSymbol'>
                <img src={crypto.iconUrl} alt={`${crypto.name} logo`} />
                {crypto.name} ({crypto.symbol})
              </h2>
              <p style={{lineHeight: '1.5em'}}>Description: {crypto.description}</p>
            </div>
            <div>
              <h3><b>Price: ${crypto.price !== 'N/A' ? Number(crypto.price).toLocaleString() : crypto.price}</b></h3>
              <p>Market Cap: {crypto.marketCap !== 'N/A' ? Number(crypto.marketCap).toLocaleString() : crypto.marketCap}</p>
              <p>24h Volume: {crypto.volume24h !== 'N/A' ? Number(crypto.volume24h).toLocaleString() : crypto.volume24h}</p>
              <p>Change (24h): {crypto.change24h}%</p>
            </div>
            <div>
              <p>All-Time High: ${crypto.allTimeHigh}</p>
              <p>Circulating Supply: {crypto.circulatingSupply !== 'N/A' ? Number(crypto.circulatingSupply).toLocaleString() : crypto.circulatingSupply}</p>
              <p>Total Supply: {crypto.totalSupply !== 'N/A' ? Number(crypto.totalSupply).toLocaleString() : crypto.totalSupply}</p>
              <p>
                <a href={crypto.coinrankingUrl} target="_blank" rel="noopener noreferrer">
                  View on CoinRanking
                </a>
              </p>
            </div>
          </li>
        ))}
      </ul>
      <footer>
        <h4 style={{ textAlign: 'center' }}>Copyright &copy; OVTech 2024</h4>
      </footer>
    </div>
  );
};

export default CryptoList;
