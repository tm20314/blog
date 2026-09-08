# つもログ 記事ブロック早見表

記事のMarkdown内で使える、つもログ専用の編集ブロックです。STORK19でよく使う用途を、現在のサイトデザインに合わせて再構成しています。

## 情報ボックス

`type` は `note`、`point`、`check`、`warning` から選べます。

```md
:::box{type="point" title="ここがポイント"}
本文を書きます。**Markdownも利用できます。**
:::
```

## ボタン

`variant` は `primary` または `secondary` です。

```md
::button[公式サイトを見る]{href="https://example.com" variant="primary"}
```

## 吹き出し

`side` は `left` または `right` です。`avatar` を省略すると「つ」のマークを表示します。

```md
:::speech{name="つもつも" side="left"}
実際に1週間使ってみた感想です。
:::
```

## FAQ

```md
:::faq{question="このアプリは無料ですか？"}
基本機能は無料で利用できます。
:::
```

## 折りたたみ

```md
:::accordion{title="詳しい仕様を見る"}
ここに補足の内容を書きます。
:::
```

## 手順

```md
::::steps
:::step{title="アプリを開く"}
ホーム画面からアプリを起動します。
:::

:::step{title="設定を選ぶ"}
右上の設定ボタンを押します。
:::
::::
```

## 良かった点・気になった点

ガジェットのレビュー結論を、記事内で見つけやすくするブロックです。

```md
::::proscons{title="1週間使った結論"}
:::pros
- 軽くて持ち運びやすい
- 充電が速い
:::

:::cons
- ケーブルは別売り
- 高負荷時は少し熱くなる
:::
::::
```

## 比較表

スマホでは表だけ横にスクロールできます。1列目には比較項目を書きます。

```md
:::comparison{caption="65W充電器の比較"}
| 比較項目 | 製品A | 製品B |
| --- | --- | --- |
| 重量 | 120g | 150g |
| ポート | 3 | 2 |
:::
```

## 商品カード

入力したリンクだけを表示します。Amazon・楽天リンクには広告リンクであることを示す属性が自動で付きます。

```md
::product{name="製品名" image="/images/product.webp" alt="製品名" summary="実際に使って良かった65W充電器。" amazon="https://www.amazon.co.jp/..." rakuten="https://..." official="https://..."}
```

## microCMSで追加したSTORK19系ブロック

microCMSの「装飾ブロック」では、上記に加えて次のブロックを選べます。

| フィールドID | 表示 | 主な入力欄 |
| --- | --- | --- |
| `linkCard` | 内部・外部ブログカード | URL、タイトル、説明、画像 |
| `embed` | SNS・動画埋め込み | URL、キャプション |
| `imagePanel` | 装飾画像 | 画像、代替テキスト、キャプション、スタイル |
| `columns` | レスポンシブ2カラム | 左右のタイトル・本文 |
| `tabs` | タブ切り替え | 最大3組のタブ名・本文 |

埋め込みはYouTube、X、Instagram、TikTok、Vimeoに対応します。画像スタイルは `plain`、`rounded`、`shadow`、`browser` から選択できます。2カラムはスマートフォンでは自動的に縦並びになります。

## 既存の便利機能

- URLを1行だけ貼る: 通常リンク、Amazon商品リンクをカード化
- YouTube、X、Instagram、TikTok、VimeoのURLを1行だけ貼る: 埋め込み表示
- `> [!NOTE]` などのGitHub形式: 補足・注意表示
- 通常のMarkdown: 見出し、リスト、表、引用、画像、コード

## 記事ページ側で自動表示する機能

- X、Facebook、はてなブックマーク、LINEへのシェアリンク
- タグ一致を優先し、次にカテゴリと公開日の近さで選ぶ関連記事3件
- 記事カードは画像・余白を含むカード全体から開けます
- 従来の前後ページ送りは関連記事と役割が重なるため表示しません

## microCMSへ移行するとき

Markdown用の記法とmicroCMS用の入力欄は別ですが、最終的には同じCSSと見た目を使います。microCMSでは本文に1つの巨大なリッチエディタを置くのではなく、「繰り返しフィールド」で次のカスタムフィールドを選べるようにします。

| microCMSのフィールドID | 用途 | 主な入力欄 |
| --- | --- | --- |
| `richText` | 通常本文 | `body`（リッチエディタ） |
| `box` | 補足・注意 | `tone`, `title`, `body` |
| `button` | CTA | `label`, `url`, `variant` |
| `speech` | 吹き出し | `name`, `avatar`, `side`, `body` |
| `faq` | FAQ | `question`, `answer` |
| `accordion` | 折りたたみ | `title`, `body` |
| `stepList` | 手順 | `title`, `items` |
| `prosCons` | 長所・短所 | `title`, `pros`, `cons` |
| `comparison` | 比較表 | `caption`, `headers`, `rows` |
| `product` | 商品・広告リンク | `name`, `summary`, `image`, `disclosure`, `links` |
| `linkCard` | ブログカード | `url`, `title`, `description`, `image` |
| `embed` | SNS・動画 | `url`, `caption` |
| `imagePanel` | 装飾画像 | `image`, `alt`, `caption`, `style` |
| `columns` | 2カラム | `leftTitle`, `leftBody`, `rightTitle`, `rightBody` |
| `tabs` | タブ | `label1`〜`label3`, `body1`〜`body3` |

`src/components/editorial/StructuredArticleBody.astro` がこのデータを安全に表示し、FAQがある記事ではFAQ構造化データも出力します。`src/lib/microcms.ts` はサーバー側から記事を取得する準備です。既存Markdown記事は残したまま、新しい記事だけmicroCMSから取得できます。

接続にはCloudflare Pagesへ `MICROCMS_SERVICE_DOMAIN` と `MICROCMS_API_KEY` を登録します。APIキーは公開用の `PUBLIC_` を付けません。公開・更新時に自動再ビルドするWebhookもmicroCMSからCloudflare Pagesへ設定します。詳細は `docs/microcms-setup.md` を参照してください。
