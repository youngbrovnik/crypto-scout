// NormalizeCoinIdentifier.js
// 코인 식별자를 "KRW-BTC" 형식으로 변환하는 함수
export function normalizeCoinIdentifier(identifier) {
  // 빗썸의 "BTC_KRW" 형식을 "KRW-BTC"로 변환
  if (identifier.includes("_")) {
    return identifier.split("_").reverse().join("-");
  }
  // 업비트의 "KRW-BTC" 형식은 그대로 반환
  return identifier;
}
