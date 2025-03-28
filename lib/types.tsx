export { type GameInfo };

interface GameInfo {
    name: string;
    // 游戏的iframe url
    iframe_url?: string;
    // 游戏在本网站的地址
    href?: string;
    image?: string;
    votes?: number;
    score?: number;
    article?: string;
}