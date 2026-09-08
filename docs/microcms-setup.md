# microCMS運用ガイド

## 方針

既存のMarkdown記事はそのまま残し、新規記事からmicroCMSへ切り替えます。記事一覧、アーカイブ、関連記事、RSSでは両方をまとめ、同じURL設計・記事カード・SEO情報を使います。microCMSが一時的に取得できない場合は、既存のMarkdown記事だけでビルドを継続します。

## 1. APIを作る

作成済みのサービスは `tumolog`、リスト形式のAPI IDは `blogs` です。記事本体には次のフィールドがあります。

| フィールドID | 種類 | 必須 |
| --- | --- | --- |
| `title` | テキストフィールド | はい |
| `content` | リッチエディタ | いいえ |
| `eyecatch` | 画像 | いいえ |
| `category` | コンテンツ参照 | いいえ |
| `slug` | テキストフィールド | はい |
| `description` | テキストエリア | いいえ |
| `tagsText` | テキストエリア（1行に1タグ） | いいえ |
| `blocks` | 繰り返しフィールド | いいえ |

`content` は手早く本文だけを書く場合に使えます。見た目を作り込みたい記事では `blocks` を使い、通常の文章は `richText`、レビューでは `prosCons`、`comparison`、`product` を順番に挿入します。両方へ入力した場合は `content` の後に `blocks` が表示されます。

`blocks` では、STORK19系のブログカード、SNS・動画埋め込み、装飾画像、2カラム、タブ切り替えも選択できます。URLを貼るだけの埋め込みはYouTube、X、Instagram、TikTok、Vimeoに対応しています。入力項目の一覧は `docs/editor-blocks.md` を参照してください。

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

## 4. 記事を公開する

1. `ブログ` から記事を追加します。
2. `タイトル` と英数字の `URLスラッグ` を入力します。
3. `内容` または `装飾ブロック` に本文を入力します。
4. 公開するとWebhook経由でCloudflare Pagesが再ビルドされます。

既存Markdownと同じslugを入力した場合は、記事データを守るためMarkdown版が優先されます。ブログテンプレート付属のサンプルはslugが空なのでサイトには表示されません。

## 5. 公開前にプレビューする

`ブログ` APIの「画面プレビュー」には次のURLを登録します。

```text
https://tumolog.com/preview/#contentId={CONTENT_ID}&draftKey={DRAFT_KEY}
```

記事編集画面の「画面プレビュー」を押すと、公開前の本文・アイキャッチ・カテゴリ・タグ・装飾ブロックを本番サイトと同じデザインで確認できます。下書きキーはURLのハッシュからすぐ消去し、ブラウザには保存しません。プレビュー取得はサーバー側で行い、APIキーをブラウザへ公開しない構成です。プレビューページは検索対象・アクセス解析・広告配信から除外しています。
