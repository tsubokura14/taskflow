/** スタブ用（本番環境はPostgreSQLで設定） */
export function getCurrentDate(): string {
    const now = new Date();

    const year = now.getFullYear();
    // getMonth()は0（1月）～11（12月）を返すため、+1して調整
    // padStart(2, '0')は、月や日が1桁の場合に2桁へゼロ埋め
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}${month}${day}`;
}