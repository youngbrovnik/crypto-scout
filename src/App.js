// App.js
import React, { useState, useEffect } from "react";
import {
  ChakraProvider,
  Grid,
  Box,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatGroup,
} from "@chakra-ui/react";
import {
  fetchUpbitMarketData,
  fetchBithumbMarketData,
  fetchBinanceMarketData,
  fetchUsdtPrice,
} from "./util/MarketDataFetchers";
import {
  connectToUpbitWebSocket,
  connectToBithumbWebSocket,
  connectToBinanceWebSocket,
} from "./util/WebSocketConnections";

function App() {
  const [tradePrices, setTradePrices] = useState({});
  const [usdtPrice, setUsdtPrice] = useState(0);
  let minPrice = 0;

  useEffect(() => {
    const fetchDataAndConnect = async () => {
      const price = await fetchUsdtPrice();
      if (price) {
        setUsdtPrice(price);
      } else {
        console.error("Failed to fetch USDT price");
      }
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
        console.log("USDT Price: ", usdtPrice);

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

  function calculateMinPrice(upbit, bithumb, binance, usdtPrice) {
    // 존재하는 가격들을 배열에 담기
    const prices = [];
    if (upbit && upbit.currentPrice) prices.push(upbit.currentPrice);
    if (bithumb && bithumb.currentPrice) prices.push(bithumb.currentPrice);
    if (binance && binance.currentPrice && usdtPrice) prices.push(binance.currentPrice * usdtPrice);

    // 최소값 계산
    const minPrice = prices.length > 0 ? Math.min(...prices) : null;

    return minPrice;
  }

  return (
    <ChakraProvider>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {Object.entries(tradePrices).map(([code, { upbit, bithumb, binance }]) => (
          <Box p={5} shadow="md" borderWidth="1px" key={code}>
            <Text mb={2}>{code}</Text>
            <StatGroup>
              <Text hidden="true">{(minPrice = calculateMinPrice(upbit, bithumb, binance, usdtPrice))}</Text>
              <Stat>
                <StatLabel>Upbit</StatLabel>
                <StatNumber>
                  {upbit
                    ? `${new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(
                        upbit.currentPrice
                      )}`
                    : "데이터 없음"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={upbit ? "increase" : "decrease"} />
                  {upbit
                    ? `${new Intl.NumberFormat("ko-KR", {
                        style: "percent",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format((upbit.currentPrice - minPrice) / minPrice)}`
                    : "데이터 없음"}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Bithumb</StatLabel>
                <StatNumber>
                  {bithumb
                    ? `${new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(
                        bithumb.currentPrice
                      )}`
                    : "데이터 없음"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={bithumb ? "increase" : "decrease"} />
                  {bithumb
                    ? `${new Intl.NumberFormat("ko-KR", {
                        style: "percent",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format((bithumb.currentPrice - minPrice) / minPrice)}`
                    : "데이터 없음"}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Binance</StatLabel>
                <StatNumber>
                  {binance
                    ? `${new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW" }).format(
                        binance.currentPrice * usdtPrice
                      )}`
                    : "데이터 없음"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={binance ? "increase" : "decrease"} />
                  {binance
                    ? `${new Intl.NumberFormat("ko-KR", {
                        style: "percent",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format((binance.currentPrice * usdtPrice - minPrice) / minPrice)}`
                    : "데이터 없음"}
                </StatHelpText>
              </Stat>
            </StatGroup>
          </Box>
        ))}
      </Grid>
    </ChakraProvider>
  );
}

export default App;
