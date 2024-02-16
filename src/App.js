import { ChakraProvider, Stat, StatLabel, StatNumber, StatGroup } from "@chakra-ui/react";

const upbitTradePrice = 300000;

function App() {
  return (
    <ChakraProvider>
      <StatGroup>
        <Stat>
          <StatLabel>업비트 BTC 가격</StatLabel>
          <StatNumber>{upbitTradePrice.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} KRW</StatNumber>
        </Stat>
      </StatGroup>
    </ChakraProvider>
  );
}

export default App;
