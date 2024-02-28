// App.js
import React, { useState, useEffect } from "react";
import { ChakraProvider, Grid, Box, Text } from "@chakra-ui/react";
import { fetchUpbitMarketData, fetchBithumbMarketData, fetchBinanceMarketData } from "./util/MarketDataFetchers";
import {
  connectToUpbitWebSocket,
  connectToBithumbWebSocket,
  connectToBinanceWebSocket,
} from "./util/WebSocketConnections";

function App() {
  const [tradePrices, setTradePrices] = useState({});

  useEffect(() => {
    const fetchDataAndConnect = async () => {
      try {
        const [upbitMarketCodes, bithumbMarketCodes, binanceMarketCodes] = await Promise.all([
          fetchUpbitMarketData(),
          fetchBithumbMarketData(),
          fetchBinanceMarketData(),
        ]);

        // 결과 출력
        console.log("Fetched Upbit market codes:", upbitMarketCodes);
        console.log("Fetched Bithumb market codes:", bithumbMarketCodes);
        console.log("Fetched Binance market codes:", binanceMarketCodes);

        // 업비트 마켓 코드를 Set으로 변환하여 공통 마켓 코드 확인
        const upbitMarketCodesSet = new Set(upbitMarketCodes);
        const commonMarketCodes = bithumbMarketCodes.filter((code) => upbitMarketCodesSet.has(code));
        console.log("Common market codes:", commonMarketCodes);

        // 업비트 웹소켓 연결 및 데이터 업데이트
        const upbitSocket = connectToUpbitWebSocket(commonMarketCodes, (upbitData) => {
          setTradePrices(upbitData);
        });

        // 빗썸 웹소켓 연결 및 데이터 업데이트
        const bithumbSocket = connectToBithumbWebSocket(commonMarketCodes, (bithumbData) => {
          setTradePrices(bithumbData);
        });

        // 바이낸스 웹소켓 연결 및 데이터 업데이트
        const binanceSocket = connectToBinanceWebSocket(commonMarketCodes, (binanceData) => {
          setTradePrices(binanceData);
        });

        // 컴포넌트 언마운트 시 웹소켓 종료
        return () => {
          console.log("Closing WebSocket connections");
          upbitSocket.close();
          bithumbSocket.close();
          binanceSocket.close();
        };
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    // fetchDataAndConnect 함수 실행 및 클린업 함수 설정
    fetchDataAndConnect();
  }, []);

  return (
    <ChakraProvider>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {Object.entries(tradePrices).map(([code, { upbit, bithumb, binance }]) => (
          <Box p={5} shadow="md" borderWidth="1px" key={code}>
            <Text mb={2}>{code}</Text>
            <Text mb={2}>
              Upbit:{" "}
              {upbit
                ? `${new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(upbit.currentPrice)}`
                : "데이터 없음"}
            </Text>
            <Text mb={2}>
              Bithumb:{" "}
              {bithumb
                ? `${new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(
                    bithumb.currentPrice
                  )}`
                : "데이터 없음"}
            </Text>
            <Text mb={2}>
              Binance:{" "}
              {binance
                ? `${new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(
                    // to-do: USDT의 가격을 가져와서 곱하기
                    binance.currentPrice * 1384
                  )}`
                : "데이터 없음"}
            </Text>
          </Box>
        ))}
      </Grid>
    </ChakraProvider>
  );
}

export default App;
