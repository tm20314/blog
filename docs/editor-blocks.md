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

## 既存の便利機能

- URLを1行だけ貼る: 通常リンク、Amazon商品リンクをカード化
- YouTube、X、Instagram、TikTok、VimeoのURLを1行だけ貼る: 埋め込み表示
- `> [!NOTE]` などのGitHub形式: 補足・注意表示
- 通常のMarkdown: 見出し、リスト、表、引用、画像、コード

## microCMSへ移行するとき

この6種類をmicroCMSの「繰り返しフィールド」に対応させれば、スマホの管理画面からブロックを選んで入力できます。既存Markdown記事は残したまま、新しい記事だけmicroCMSから取得する段階移行を前提にしています。
