# Design News App

毎朝 8:00 JST に自動更新されるデザイン最新ニュースアプリ。完全無料で運用できる静的サイト構成。

## 🌟 特徴

- **完全無料**: API・ホスティング・ビルドすべて無料枠内で運用
- **毎朝自動更新**: GitHub Actions により毎朝 8:00 JST に自動でニュース取得＆デプロイ
- **モダンUI**: Next.js + Tailwind CSS によるミニマルで読みやすいデザイン
- **多様なソース**: Hacker News, CSS-Tricks, Smashing Magazine などから集約

## 📰 ニュースソース

- **Hacker News**: テック/プロダクト系ニュース
- **CSS-Tricks**: CSS/UI実装/フロントエンド
- **Smashing Magazine**: デザイン/UX/アクセシビリティ
- **Designer News**: デザインコミュニティ（RSS状態により可変）

## 🛠 技術スタック

- **フレームワーク**: Next.js 16 (App Router + Static Export)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **フィード取得**: rss-parser
- **自動更新**: GitHub Actions (cron)
- **ホスティング**: GitHub Pages

## 🚀 セットアップ

### 前提条件

- Node.js 20+
- npm または pnpm

### ローカル開発

```bash
# 依存関係インストール
npm install

# フィード取得
npm run fetch

# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build
```

### GitHub Pages デプロイ設定

1. リポジトリを **public** に設定
2. Settings → Pages で以下を設定:
   - Source: **GitHub Actions**
3. Actions 権限を確認:
   - Settings → Actions → General → Workflow permissions で **Read and write permissions** を有効化
4. 初回手動実行:
   - Actions タブ → "Update News and Deploy" → "Run workflow"

## 📂 ディレクトリ構成

```
.
├─ .github/workflows/
│  └─ update-news.yml        # 自動更新ワークフロー
├─ app/
│  ├─ layout.tsx
│  ├─ page.tsx               # メインページ
│  └─ globals.css
├─ data/
│  ├─ sources.json           # ソース定義
│  ├─ articles.json          # 取得済み記事
│  └─ last-updated.json      # 更新メタ情報
├─ scripts/
│  └─ fetch-feeds.ts         # フィード取得スクリプト
├─ src/
│  ├─ components/
│  │  ├─ header.tsx
│  │  ├─ news-card.tsx
│  │  └─ filter-bar.tsx
│  └─ types/
│     └─ news.ts
└─ next.config.ts
```

## ⚙️ カスタマイズ

### ソース追加

`data/sources.json` を編集:

```json
{
  "id": "new-source",
  "name": "New Source",
  "type": "rss",
  "feedUrl": "https://example.com/feed",
  "siteUrl": "https://example.com",
  "enabled": true,
  "priority": 8,
  "categoryHints": ["design", "frontend"]
}
```

### 更新時刻変更

`.github/workflows/update-news.yml` の `cron` を編集:

```yaml
schedule:
  # JST 9:00 = UTC 0:00
  - cron: '0 0 * * *'
```

### basePath 変更

リポジトリ名が `design-news-app` 以外の場合、`next.config.ts` の `basePath` を修正:

```ts
basePath: process.env.NODE_ENV === "production" ? "/your-repo-name" : "",
```

## 🧪 検証

```bash
# TypeScript型チェック
npx tsc --noEmit

# ESLint
npm run lint

# ビルド確認
npm run build
```

## 📝 運用

### 手動更新

```bash
# ローカルでフィード取得
npm run fetch

# コミット＆プッシュ
git add data/*.json
git commit -m "Update news data"
git push
```

### GitHub Actions での手動実行

Actions タブ → "Update News and Deploy" → "Run workflow"

### トラブルシューティング

- **フィード取得失敗**: `data/last-updated.json` の `failedSources` を確認
- **ビルドエラー**: Actions のログを確認
- **Pages 404**: リポジトリ Settings → Pages で Source が "GitHub Actions" になっているか確認

## 🔮 将来拡張案

- [ ] キーワード検索機能
- [ ] お気に入り保存（localStorage）
- [ ] ダークモード切り替え
- [ ] OG画像自動生成
- [ ] "News" と "Inspiration" タブ分離

## 📄 ライセンス

MIT

## 🙏 謝辞

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [rss-parser](https://github.com/rbren/rss-parser)
- すべてのニュースソース提供者

