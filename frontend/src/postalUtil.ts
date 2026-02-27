// 郵便番号から住所を取得するユーティリティ関数
// 例: fetchAddressByPostalCode('1000001')
export async function fetchAddressByPostalCode(postalCode: string): Promise<string | null> {
  // 郵便番号API（zipcloud）を利用
  const res = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postalCode}`);
  const data = await res.json();
  if (data && data.results && data.results.length > 0) {
    const result = data.results[0];
    // 都道府県+市区町村+町域
    return `${result.address1}${result.address2}${result.address3}`;
  }
  return null;
}
