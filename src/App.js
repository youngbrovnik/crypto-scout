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
  fetchUsdToKrwRate,
} from "./util/MarketDataFetchers";
import {
  connectToUpbitWebSocket,
  connectToBithumbWebSocket,
  connectToBinanceWebSocket,
} from "./util/WebSocketConnections";

function App() {
  const [tradePrices, setTradePrices] = useState({});
  const [sortedTradePrices, setSortedTradePrices] = useState([]);

  useEffect(() => {
    const fetchDataAndConnect = async () => {
      try {
        const [upbitMarketCodes, bithumbMarketCodes, binanceMarketCodes, fetchedUsdtPrice] = await Promise.all([
          fetchUpbitMarketData(),
          fetchBithumbMarketData(),
          fetchBinanceMarketData(),
          fetchUsdToKrwRate(),
        ]);

        // 결과 출력
        console.log("Fetched Upbit market codes:", upbitMarketCodes);
        console.log("Fetched Bithumb market codes:", bithumbMarketCodes);
        console.log("Fetched Binance market codes:", binanceMarketCodes);
        console.log("Fetched usdt price:", fetchedUsdtPrice);

        // 세 배열의 마켓 코드를 모두 합친 후, 각 마켓 코드별 등장 횟수를 계산합니다.
        const allMarketCodes = [...upbitMarketCodes, ...bithumbMarketCodes, ...binanceMarketCodes];
        const marketCodeCounts = allMarketCodes.reduce((acc, code) => {
          acc[code] = (acc[code] || 0) + 1;
          return acc;
        }, {});

        // 등장 횟수가 2 이상인 마켓 코드만 필터링합니다.
        const commonMarketCodes = Object.entries(marketCodeCounts)
          .filter(([code, count]) => count >= 2)
          .map(([code, count]) => code);
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
        const binanceSocket = connectToBinanceWebSocket(
          commonMarketCodes,
          (binanceData) => {
            setTradePrices(binanceData);
          },
          fetchedUsdtPrice
        );

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

  useEffect(() => {
    const updateTradePricesWithPercent = (prices) => {
      const calculatedPrices = Object.entries(prices).map(([coin, data]) => {
        // 최소 가격과 최대 퍼센트 초기화
        let minPrice = Infinity;
        let maxPercent = -Infinity;

        // 각 거래소별로 최소 가격 계산 및 퍼센트 계산
        const exchangesWithPercent = Object.entries(data).reduce((acc, [exchange, details]) => {
          const currentPrice = parseFloat(details.currentPrice);
          minPrice = Math.min(minPrice, currentPrice);
          return acc; // 이 부분은 거래소별 퍼센트 계산을 위한 초기 단계입니다.
        }, {});

        // 각 거래소별 퍼센트 계산 및 최대 퍼센트 갱신
        Object.entries(data).forEach(([exchange, details]) => {
          const currentPrice = parseFloat(details.currentPrice);
          const percent = (currentPrice - minPrice) / minPrice;
          exchangesWithPercent[exchange] = { ...details, percent: percent.toFixed(4) };
          maxPercent = Math.max(maxPercent, percent);
        });

        return {
          coin,
          ...exchangesWithPercent,
          minPrice, // 각 코인별 최소 가격 추가
          maxPercent: maxPercent.toFixed(4), // 각 코인별 최대 퍼센트 추가
        };
      });

      // maxPercent 기준으로 데이터 정렬
      calculatedPrices.sort((a, b) => parseFloat(b.maxPercent) - parseFloat(a.maxPercent));

      // 계산된 결과를 기반으로 상태 업데이트
      setSortedTradePrices(calculatedPrices);
    };

    updateTradePricesWithPercent(tradePrices);
  }, [tradePrices]); // tradePrices가 변경될 때마다 실행

  function calculateDecimalPlaces(inputValue) {
    if (inputValue > 1000) {
      return 0;
    } else if (inputValue > 100) {
      return 1;
    } else if (inputValue > 10) {
      return 2;
    } else if (inputValue > 1) {
      return 3;
    } else if (inputValue > 0.1) {
      return 4;
    } else if (inputValue > 0.01) {
      return 5;
    } else if (inputValue > 0.001) {
      return 6;
    } else if (inputValue > 0.0001) {
      return 7;
    } else {
      return 8;
    }
  }

  return (
    <ChakraProvider>
      <Grid templateColumns="repeat(2, 1fr)" gap={6}>
        {Object.entries(sortedTradePrices).map(([card, { coin, upbit, bithumb, binance }]) => (
          <Box p={5} shadow="md" borderWidth="1px" key={card}>
            <Text mb={2}>{coin}</Text>
            <StatGroup>
              <Stat>
                <StatLabel>Upbit</StatLabel>
                <StatNumber>
                  {upbit
                    ? `${new Intl.NumberFormat("ko-KR", {
                        style: "currency",
                        currency: "KRW",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: calculateDecimalPlaces(upbit.currentPrice),
                      }).format(upbit.currentPrice)}`
                    : "데이터 없음"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={upbit ? "increase" : "decrease"} />
                  {upbit
                    ? `${new Intl.NumberFormat("ko-KR", {
                        style: "percent",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(upbit.percent)}`
                    : "데이터 없음"}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Bithumb</StatLabel>
                <StatNumber>
                  {bithumb
                    ? `${new Intl.NumberFormat("ko-KR", {
                        style: "currency",
                        currency: "KRW",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: calculateDecimalPlaces(bithumb.currentPrice),
                      }).format(bithumb.currentPrice)}`
                    : "데이터 없음"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={bithumb ? "increase" : "decrease"} />
                  {bithumb
                    ? `${new Intl.NumberFormat("ko-KR", {
                        style: "percent",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(bithumb.percent)}`
                    : "데이터 없음"}
                </StatHelpText>
              </Stat>
              <Stat>
                <StatLabel>Binance</StatLabel>
                <StatNumber>
                  {binance
                    ? `${new Intl.NumberFormat("ko-KR", {
                        style: "currency",
                        currency: "KRW",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: calculateDecimalPlaces(binance.currentPrice),
                      }).format(binance.currentPrice)}`
                    : "데이터 없음"}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type={binance ? "increase" : "decrease"} />
                  {binance
                    ? `${new Intl.NumberFormat("ko-KR", {
                        style: "percent",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }).format(binance.percent)}`
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
