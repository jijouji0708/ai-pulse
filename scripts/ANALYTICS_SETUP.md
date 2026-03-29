# Google Analytics & Search Console API セットアップガイド

AI Pulse の `fetch-analytics.js` と `fetch-search-console.js` を動かすための設定手順。

---

## 1. Google Cloud プロジェクトの作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 画面上部のプロジェクト選択 → 「新しいプロジェクト」をクリック
3. プロジェクト名を入力（例: `ai-pulse-analytics`）→ 「作成」

## 2. API の有効化

Google Cloud Console のプロジェクト内で、以下の2つのAPIを有効化する。

### Google Analytics Data API（GA4用）
1. 左メニュー「APIとサービス」→「ライブラリ」
2. 「Google Analytics Data API」を検索
3. 「有効にする」をクリック

### Search Console API
1. 同じく「ライブラリ」
2. 「Google Search Console API」を検索
3. 「有効にする」をクリック

## 3. サービスアカウントの作成

1. 左メニュー「APIとサービス」→「認証情報」
2. 「認証情報を作成」→「サービスアカウント」
3. 名前を入力（例: `ai-pulse-reader`）→ 「作成して続行」
4. ロールは不要（スキップしてOK） → 「完了」
5. 作成されたサービスアカウントをクリック
6. 「キー」タブ → 「鍵を追加」→「新しい鍵を作成」
7. **JSON** を選択 → 「作成」
8. JSONファイルがダウンロードされる

### 認証情報ファイルの配置

ダウンロードしたJSONファイルを以下のいずれかに配置:

```bash
# 方法A: プロジェクト内に配置（推奨）
mkdir -p credentials
cp ~/Downloads/ai-pulse-analytics-xxxxx.json credentials/ga4-service-account.json

# 方法B: 環境変数で指定
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your-service-account.json"
```

**重要**: `credentials/` ディレクトリは `.gitignore` に追加済みであることを確認してください。認証情報をGitにコミットしないこと。

```bash
echo "credentials/" >> .gitignore
```

## 4. GA4 プロパティへのアクセス権限設定

サービスアカウントのメールアドレス（`xxx@xxx.iam.gserviceaccount.com`）をGA4に追加する。

1. [Google Analytics](https://analytics.google.com/) にアクセス
2. 左下の歯車アイコン（管理）をクリック
3. プロパティ列の「プロパティのアクセス管理」をクリック
4. 右上の「+」→「ユーザーを追加」
5. サービスアカウントのメールアドレスを入力
6. 権限:「閲覧者」を選択 → 「追加」

## 5. Search Console へのアクセス権限設定

1. [Google Search Console](https://search.google.com/search-console/) にアクセス
2. 対象プロパティを選択
3. 左メニュー「設定」→「ユーザーと権限」
4. 「ユーザーを追加」をクリック
5. サービスアカウントのメールアドレスを入力
6. 権限:「フル」を選択 → 「追加」

## 6. GA4 プロパティID の確認

1. [Google Analytics](https://analytics.google.com/) にアクセス
2. 左下の歯車アイコン（管理）をクリック
3. プロパティ列の「プロパティ設定」→「プロパティの詳細」
4. **プロパティID**（数字のみ、例: `123456789`）をコピー

注意: トラッキングID（G-CEZ686BD8J）ではなく、数字のプロパティIDが必要です。

## 7. 環境変数の設定

```bash
# GA4
export GA4_PROPERTY_ID="ここにプロパティID（数字）"

# Search Console
export GSC_SITE_URL="https://takamuranaoya.github.io/ai-pulse/"

# 認証情報（方法Bの場合）
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/ga4-service-account.json"
```

`.env` ファイルに書いておくと便利:

```bash
# ai-company/.env
GA4_PROPERTY_ID=123456789
GSC_SITE_URL=https://takamuranaoya.github.io/ai-pulse/
GOOGLE_APPLICATION_CREDENTIALS=./credentials/ga4-service-account.json
```

## 8. パッケージインストール

```bash
cd site
npm install
```

`@google-analytics/data` と `googleapis` は `package.json` に追加済み。

## 9. 動作確認

```bash
# GA4 レポート取得
node scripts/fetch-analytics.js

# Search Console レポート取得
node scripts/fetch-search-console.js

# ファイルに保存
node scripts/fetch-analytics.js --output agents/analytics/reports/ga-report.md
node scripts/fetch-search-console.js --output agents/analytics/reports/gsc-report.md
```

## トラブルシューティング

### 「PERMISSION_DENIED」エラー
- サービスアカウントのメールアドレスがGA4 / Search Console に追加されているか確認
- API が Google Cloud Console で有効化されているか確認
- サービスアカウントのJSONキーが正しいパスに配置されているか確認

### 「NOT_FOUND」エラー
- GA4_PROPERTY_ID が正しいか確認（数字のみ。G-CEZ686BD8J ではない）
- GSC_SITE_URL が Search Console に登録済みのURLと完全一致しているか確認

### 「データなし」
- GA4: トラッキングコード設置後、数時間〜24時間でデータが蓄積される
- Search Console: サイトのインデックスに時間がかかる。サイトマップを送信すると早まる

### Search Console で「サイトが見つからない」
- URL の末尾スラッシュの有無が一致しているか確認
- ドメインプロパティ vs URLプレフィックスプロパティの違いに注意
