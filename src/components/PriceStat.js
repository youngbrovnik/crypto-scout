// PriceStat.js
import { Stat, StatLabel, StatNumber } from "@chakra-ui/react";

function PriceStat({ code, price, exchange }) {
  // 가격 포맷팅
  const formattedPrice = price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " KRW";

  return (
    <Stat margin={5} align="center">
      <StatLabel>{`${exchange} ${code} 가격`}</StatLabel>
      <StatNumber>{formattedPrice}</StatNumber>
    </Stat>
  );
}

export default PriceStat;
