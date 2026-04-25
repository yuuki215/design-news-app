# Design News App

毎朝 8:00 JST に自動更新される日本のデザイン最新ニュースアプリ。完全無料で運用できる静的サイト構成。

## 🌟 特徴

- **日本中心の配信**: コリス、LIG blog、PhotoshopVIP、Web担当者Forumなど日本のデザインメディアを優先
- **厳選5〜10本**: スコアリングにより1日あたり5〜10本の質の高い記事に絞り込み
- **ピックアップ表示**: 上位1〜2本をファーストビューに大きく表示
- **パステル調UI**: 余白たっぷりのミニマルで読みやすいデザイン
- **完全無料**: API・ホスティング・ビルドすべて無料枠内で運用
- **毎朝自動更新**: GitHub Actions により毎朝 8:00 JST に自動でニュース取得＆デプロイ

## 📰 ニュースソース

### 日本メディア（優先）
- **コリス**: CSS/デザイン/フロントエンド
- **LIG blog**: デザイン/Web/UX
- **PhotoshopVIP**: デザイン/グラフィックス
- **Web担当者Forum**: Web/マーケティング/デザイン

### 海外メディア（補完）
- **CSS-Tricks**: CSS/フロントエンド
- **Smashing Magazine**: デザイン/UX/アクセシビリティ

## 🛠 技術スタック

- **フレームワーク**: Next.js 16 (App Router + Static Export)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **フォント**: Noto Sans JP（日本語対応）
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
│  ├─ page.tsx               # メインページ（ピックアップ+一覧）
│  └─ globals.css            # パステル配色定義
├─ data/
│  ├─ sources.json           # ソース定義（日本中心）
│  ├─ articles.json          # 取得済み記事（5〜10本）
│  └─ last-updated.json      # 更新メタ情報
├─ scripts/
│  └─ fetch-feeds.ts         # フィード取得・スコアリング・厳選スクリプト
├─ src/
│  ├─ components/
│  │  ├─ header.tsx          # ヘッダー
│  │  ├─ news-card.tsx       # 記事カード
│  │  └─ filter-bar.tsx      # 地域・カテゴリフィルタ
│  └─ types/
│     └─ news.ts             # 型定義（region/language/isPickup拡張）
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
  "categoryHints": ["design", "frontend"],
  "region": "jp",
  "language": "ja"
}
```

### スコアリング調整

`scripts/fetch-feeds.ts` の `calculateScore` 関数で以下を調整可能:
- 日本記事の優先度（デフォルト: +15点）
- 新しさによる加点（1日以内: +10点）
- ソース優先度（priority値）
- カテゴリ関連度

### 厳選件数変更

`scripts/fetch-feeds.ts` の以下を変更:
```ts
const targetCount = Math.max(5, Math.min(10, allArticles.length));
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

## 🎨 デザインシステム

### パステルカラー定義

`app/globals.css` で定義:
- 背景: `#faf8f6` (ベージュ系)
- ピックアップ背景: `#fff4ed` (ピーチ系)
- 日本記事ラベル: `#ffb5a7` (ピンク系)
- 海外記事ラベル: `#a8dadc` (ブルー系)

### 日本語フォント

`Noto Sans JP` をGoogle Fontsから読み込み。ウェイト: 400, 500, 700

## 🔮 将来拡張予定

- [ ] 翻訳機能（海外記事を日本語化）
- [ ] キーワード検索
- [ ] お気に入り保存（localStorage）
- [ ] ダークモード
- [ ] OG画像自動生成

## 📄 ライセンス

MIT

## 🙏 謝辞

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [rss-parser](https://github.com/rbren/rss-parser)
- すべてのニュースソース提供者

