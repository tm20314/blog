# microCMS導入設計

## 方針

既存のMarkdown記事はそのまま残し、新規記事からmicroCMSへ切り替えます。記事一覧と関連記事では両方をまとめ、同じURL設計・記事カード・SEO情報を使う想定です。

## 1. APIを作る

microCMSでリスト形式のAPIを作り、API IDを `blogs` にします。記事本体には次のフィールドを用意します。

| フィールドID | 種類 | 必須 |
| --- | --- | --- |
| `title` | テキストフィールド | はい |
| `slug` | テキストフィールド | いいえ（空ならコンテンツIDを使用） |
| `description` | テキストエリア | はい |
| `cover` | 画像 | いいえ |
| `category` | セレクトフィールド | はい |
| `tags` | 複数選択フィールド | いいえ |
| `blocks` | 繰り返しフィールド | はい |

`blocks` から選べるカスタムフィールドは `docs/editor-blocks.md` の一覧どおりに作ります。通常の文章は `richText`、レビューでは `prosCons`、`comparison`、`product` を挿入します。

## 2. Cloudflare Pagesへ秘密情報を登録する

ローカルでは `.env.example` をコピーして値を入れます。本番ではCloudflare Pagesの環境変数に次を登録します。

```text
MICROCMS_SERVICE_DOMAIN=サービスドメインの先頭部分
MICROCMS_API_KEY=GET権限だけを持つAPIキー
MICROCMS_API_ENDPOINT=blogs
```

`MICROCMS_API_KEY` に `PUBLIC_` を付けるとブラウザへ公開されるため、付けません。

## 3. 公開時の自動デプロイ

Cloudflare PagesでDeploy Hookを作り、そのURLをmicroCMSのWebhookに登録します。記事の公開・更新を契機に本番サイトを再ビルドします。

## 4. 次の接続作業

サービスドメインとAPIキーが揃ったら、記事ルートの静的パス生成へ `getMicroCMSArticles()` を追加し、`StructuredArticleBody.astro` で本文を表示します。移行中はslugが既存Markdownと重複しないようにします。
