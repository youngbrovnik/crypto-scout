// App.js
import React, { useState, useEffect } from "react";
import { ChakraProvider, Grid } from "@chakra-ui/react";
import PriceStat from "./components/PriceStat";
import { fetchUpbitMarketData, fetchBithumbMarketData } from "./util/MarketDataFetchers";
import { connectToUpbitWebSocket, connectToBithumbWebSocket } from "./util/WebSocketConnections";

function App() {
  const [upbitTradePrices, setUpbitTradePrices] = useState({});
  const [bithumbTradePrices, setBithumbTradePrices] = useState({});

  useEffect(() => {
    fetchUpbitMarketData()
      .then((upbitMarketCodes) => {
        const upbitSocket = connectToUpbitWebSocket(upbitMarketCodes, setUpbitTradePrices);
        return () => upbitSocket.close();
      })
      .catch((error) => console.error("Error fetching data from Upbit API:", error));

    fetchBithumbMarketData()
      .then((bithumbMarketCodes) => {
        const bithumbSocket = connectToBithumbWebSocket(bithumbMarketCodes, setBithumbTradePrices);
        return () => bithumbSocket.close();
      })
      .catch((error) => console.error("Error fetching market codes from Bithumb", error));
  }, []);

  return (
    <ChakraProvider>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        <div>
          {Object.entries(upbitTradePrices).map(([code, price]) => (
            <PriceStat key={`${code}-upbit`} code={code} price={price} exchange="업비트" />
          ))}
        </div>
        <div>
          {Object.entries(bithumbTradePrices).map(([code, price]) => (
            <PriceStat key={`${code}-bithumb`} code={code} price={price} exchange="빗썸" />
          ))}
        </div>
      </Grid>
    </ChakraProvider>
  );
}

export default App;
