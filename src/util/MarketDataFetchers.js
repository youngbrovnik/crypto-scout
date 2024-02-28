// MarketDataFetchers.js

// Upbit KRW 시장 데이터를 가져오는 함수
export const fetchUpbitMarketData = () => {
  const url = "https://api.upbit.com/v1/market/all?isDetails=false";

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      return data.filter((item) => item.market.startsWith("KRW")).map((item) => item.market);
    });
};

// Bithumb KRW 시장 데이터를 가져오는 함수
export const fetchBithumbMarketData = () => {
  const url = "https://api.bithumb.com/public/ticker/ALL_KRW";

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((response) => {
      if (response.status !== "0000") {
        throw new Error("Response status is not ok");
      }
      const data = response.data;
      return Object.keys(data).map((key) => `KRW-${key}`);
    });
};

export const fetchBinanceMarketData = () => {
  const url = "https://api.binance.com/api/v3/exchangeInfo";

  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      // quoteAsset가 'USDT'인 심볼만 필터링
      const symbolsWithUSDT = data.symbols
        .filter((symbol) => symbol.quoteAsset === "USDT")
        .map((symbol) => symbol.symbol);

      return symbolsWithUSDT;
    })
    .catch((error) => {
      console.error("Error fetching Binance market data:", error);
      throw error;
    });
};
