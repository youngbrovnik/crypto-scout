// WebSocketConnections.js
export function connectToUpbitWebSocket(upbitMarketCodes, setUpbitTradePrices) {
  const socket = new WebSocket("wss://api.upbit.com/websocket/v1");

  socket.onopen = () => {
    console.log("WebSocket Connected to Upbit");
    const requestData = JSON.stringify([
      { ticket: "test example" },
      { type: "trade", codes: upbitMarketCodes },
      { format: "DEFAULT" },
    ]);
    socket.send(requestData);
  };

  socket.onmessage = (event) => {
    const response = event.data;

    if (response instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => {
        const data = JSON.parse(reader.result);
        setUpbitTradePrices((prevPrices) => ({
          ...prevPrices,
          [data.code]: {
            ...prevPrices[data.code],
            upbit: {
              currentPrice: data.trade_price, // 'upbit' 키 사용
            },
          },
        }));
      };
      reader.readAsText(response);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket Error with Upbit:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket Disconnected from Upbit");
  };

  return socket;
}

export function connectToBithumbWebSocket(bithumbMarketCodes, setBithumbTradePrices) {
  const socket = new WebSocket("wss://pubwss.bithumb.com/pub/ws");

  const mapBithumbMarketCodes = bithumbMarketCodes.map((code) => {
    if (code.includes("-")) {
      return code.split("-").reverse().join("_");
    } else {
      return code;
    }
  });

  socket.onopen = () => {
    console.log("WebSocket Connected to Bithumb");
    const subscribeTransaction = JSON.stringify({
      type: "transaction",
      symbols: mapBithumbMarketCodes,
    });
    socket.send(subscribeTransaction);
  };

  socket.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response.type === "transaction") {
      response.content.list.forEach((transaction) => {
        const symbolConverted = transaction.symbol.split("_").reverse().join("-");
        setBithumbTradePrices((prevPrices) => ({
          ...prevPrices,
          [symbolConverted]: {
            ...prevPrices[symbolConverted],
            bithumb: {
              currentPrice: transaction.contPrice, // 'bithumb' 키 사용
            },
          },
        }));
      });
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket Error with Bithumb:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket Disconnected from Bithumb");
  };

  return socket;
}

export function connectToBinanceWebSocket(marketCodes, setBinanceTradePrices) {
  // 마켓 코드 변환 함수
  const convertMarketCode = (code) => {
    return code.toLowerCase().replace("krw-", "") + "usdt";
  };

  marketCodes.forEach((code) => {
    const symbol = convertMarketCode(code);
    const wsUrl = `wss://stream.binance.com:9443/ws/${symbol}@trade`;

    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setBinanceTradePrices((prevPrices) => ({
        ...prevPrices,
        [code]: {
          ...prevPrices[code],
          binance: {
            currentPrice: parseFloat(data.p), // Binance에서 제공하는 최신 가격 정보
          },
        },
      }));
    };

    socket.onerror = (error) => {
      console.error(`WebSocket Error with Binance for ${symbol}:`, error);
    };

    socket.onclose = () => {
      console.log(`WebSocket Disconnected from Binance for ${symbol}`);
    };
  });
}
