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
        setUpbitTradePrices((prevPrices) => ({ ...prevPrices, [data.code]: data.trade_price }));
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

  socket.onopen = () => {
    console.log("WebSocket Connected to Bithumb");
    const subscribeTransaction = JSON.stringify({
      type: "transaction",
      symbols: bithumbMarketCodes,
    });
    socket.send(subscribeTransaction);
  };

  socket.onmessage = (event) => {
    const response = JSON.parse(event.data);
    if (response.type === "transaction") {
      response.content.list.forEach((transaction) => {
        setBithumbTradePrices((prevPrices) => ({
          ...prevPrices,
          [transaction.symbol]: transaction.contPrice,
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
