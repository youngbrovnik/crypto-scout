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
        // 패치된 업비트 마켓 코드를 콘솔에 출력
        console.log("Fetched Upbit market codes:", upbitMarketCodes);

        // 웹소켓 연결 및 데이터 처리
        const upbitSocket = connectToUpbitWebSocket(upbitMarketCodes, (upbitData) => {
          setUpbitTradePrices(upbitData);
        });

        // 컴포넌트 언마운트 시 웹소켓 종료 함수 반환
        return () => {
          console.log("Closing WebSocket to Upbit");
          upbitSocket.close();
        };
      })
      .catch((error) => console.error("Error fetching data from Upbit API:", error));

    fetchBithumbMarketData()
      .then((bithumbMarketCodes) => {
        // 패치된 빗썸 마켓 코드를 콘솔에 출력
        console.log("Fetched Bithumb market codes:", bithumbMarketCodes);

        // 웹소켓 연결 및 데이터 처리
        const bithumbSocket = connectToBithumbWebSocket(bithumbMarketCodes, (bithumbData) => {
          setBithumbTradePrices(bithumbData);
        });

        // 컴포넌트 언마운트 시 웹소켓 종료 함수 반환
        return () => {
          console.log("Closing WebSocket to Bithumb");
          bithumbSocket.close();
        };
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
