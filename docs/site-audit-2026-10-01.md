# つもログ：セキュリティ・デザイン・SEO監査

確認日：2026-10-01 / 対象：https://tumolog.com/ / ソース：319c76c

## 結論と優先順位

最初に取り組むのは、依存関係の更新、存在しないURLの404対応、画像・広告の表示領域確保、主要ナビゲーションの追加。
記事のタイトル・本文はそのままに、共通部品、表示処理、メタデータ、配信設定で改善できる。

「高」は先に対応したい項目。「中」は通常の改善として順次対応する項目で、直ちに侵入可能だと判定したものではない。
今回は監査のみ。サイトの実装、公開記事、管理画面、配信設定は変更していない。

## 確認範囲

- 公開トップ、記事一覧、プロフィール、プライバシー、プレビュー、本文エディター、robots.txt、サイトマップのHTTP応答。
- サイトマップに掲載された公開記事24件のHTTP応答、説明文、共有画像、見出し、構造化データ。
- Chromeでデスクトップと390×844のスマートフォン幅を確認。トップ、アプリ紹介、microCMS記事、記事一覧とカテゴリ絞り込みを確認。画面幅は確認後にリセット。
- ローカルの公開・プレビュー・エディター処理、スタイル、環境変数管理、CI、依存関係を確認。
- `pnpm test:site`：37件成功、失敗0件。`pnpm audit --prod --json`で脆弱性警告を確認。

Search Consoleのインデックス状態、GA4の実データ、AdSenseの審査・CMP設定、Cloudflare管理画面のWAF設定は未確認。
Lighthouse/PageSpeed Insightsと実ユーザーのCore Web Vitalsは未測定。表示速度や検索順位のスコアは推測していない。
負荷試験、攻撃コードの実行、下書きキーの推測、記事の保存・公開は行っていない。

## 1. セキュリティ

### S1 / 高：依存パッケージの更新と継続チェック

確認：Astro 5.13.10、Vite 6.3.6等に監査警告がある。間接依存の `form-data 4.0.2` にもCritical警告がある。
`form-data` の経路は `astro-icon → @iconify/tools → axios → form-data`。公開サイトは静的配信なので、パッケージの警告数と公開サイトの攻撃可能箇所数は同じではない。Astroのserver islandsや開発サーバーなど、現在の公開構成では利用していない機能の警告も含まれる。

改善：利用経路を切り分けて修正版へ段階更新。不要な旧テーマ依存を整理する。既存のDependabotは継続し、CIに `test:site` と依存関係の監査を追加する。現在のBuild and CheckワークフローはAstroのチェックとビルドのみで、今回成功した37件のテストを実行していない。

根拠：[package.json](/Users/tumotumo/Documents/blog/package.json)、[CI](/Users/tumotumo/Documents/blog/.github/workflows/build.yml)、[form-data公式アドバイザリ](https://github.com/form-data/form-data/security/advisories/GHSA-fjxv-7rqg-78g4)。

### S2 / 中：公開ページのセキュリティヘッダー

確認：トップ・記事一覧・プロフィール等の応答にCSP、HSTS、Permissions-Policyがない。`nosniff` とReferrer-Policyは既にある。エディターだけはmicroCMSからの埋め込みを許可する `frame-ancestors` が設定済み。

改善：CSPをReport-Onlyから導入し、インラインスクリプト、Googleタグ、広告、SNS埋め込みの必要な許可先を確認する。`object-src`、`base-uri`、通常ページの `frame-ancestors` なども整える。HSTSはHTTPS運用を確認して段階導入し、未設定のサブドメインまで一括適用しない。エディターのmicroCMS埋め込みは維持する。

根拠：[公開ヘッダー定義](/Users/tumotumo/Documents/blog/public/_headers)、実際の公開HTTP応答、[OWASPのCSPガイド](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)。

### S3 / 中：プレビューAPIの乱用対策

確認：`/api/preview` はID・下書きキー・Originを検証し、上流リクエストにタイムアウトもある。一方、JSON解析前のリクエスト本文サイズ制限と、コード上のレート制限はない。Originの検査だけではブラウザー以外からの大量アクセスを制限できない。Cloudflare側で別途制限があるかは未確認。

改善：小さなJSONに見合った実際の本文サイズ上限、Cloudflare側のレート制限、429応答、秘密値を含めない失敗・頻度の監視を追加する。正常なプレビュー操作を妨げない制限にする。下書きキーの共有を避ける。

根拠：[preview.js](/Users/tumotumo/Documents/blog/functions/api/preview.js:23)。

### S4 / 中：環境変数の誤コミット防止

確認：`.env` と `.env.production` はGit除外済みだが、`.env.local` と `.dev.vars` は除外されていない。追跡されている環境変数ファイルは `.env.example`。限定したパターンによる現行ファイルの確認では秘密値の混入を検出していないが、Git履歴全体の漏洩検査ではない。

改善：`.env.*`、`.dev.vars*` を除外し、`.env.example` は例外として残す。履歴を含めたシークレット検査をCIに追加する。microCMS APIキーは引き続きサーバー側でのみ利用する。GA4・AdSenseの公開IDは秘密キーとして扱わない。

根拠：[.gitignore](/Users/tumotumo/Documents/blog/.gitignore:16)、`git check-ignore`、`git ls-files`。

### S5 / 中：広告・計測の同意状態とポリシーの整合

確認：アプリ側のGoogleタグは同意を `denied` で初期化しているが、利用者の選択を反映する `consent update` と同意設定UIはない。プライバシーポリシーには地域に応じて認定同意管理機能を表示する旨がある。Google側の地域別CMP設定は未確認なので、設定されていないと断定はしない。

改善：AdSense側のCMPとアプリ側の計測同意の接続を確認し、必要な地域での選択、選択の変更、タグへの反映を一貫させる。ポリシーの記載を実際の挙動に合わせる。`denied` でもConsent Modeの方式によって通信自体は発生し得るため、「拒否なら一切送信しない」と安易に説明しない。法的な適用範囲は別途確認する。

根拠：[GoogleServices](/Users/tumotumo/Documents/blog/src/components/integrations/GoogleServices.astro:27)、[プライバシー](/Users/tumotumo/Documents/blog/src/pages/privacy.astro)、[Google公式Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)。

## 2. デザイン・操作性

### D1 / 高：主要メニューとサイト内検索

確認：ヘッダーはホームロゴと「ブログを読む」のみ。アプリ紹介・記事一覧・プロフィールへの共通メニューはフッターにあるが、ヘッダーにはない。現在の公開レイアウトに検索UIはない。

改善：「記事一覧」「つくったアプリ」「プロフィール」を上部から選べるようにする。スマホはコンパクトなメニューでよい。ビルド済みのPagefindを利用して検索をつなぐ。ブログを主導線にする方針は維持する。

根拠：[SiteMasthead](/Users/tumotumo/Documents/blog/src/components/editorial/SiteMasthead.astro:7)、Chromeの公開画面。

### D2 / 中：スマホのファーストビューを短くする

確認：390×844では最初の画面の大半をバイク写真とキャプションが占め、新着記事は下にある。アプリ紹介の開始位置はページ上端から約6,700 CSS pxで、上部に直接移動するリンクがない。

改善：写真は残し、モバイルだけ高さ・トリミングを調整する。「記事を読む」「アプリを見る」の入口を最初の画面付近に置く。全面的なデザイン変更ではなく、今の黒・白・ライム色と余白を生かす。

根拠：[トップページ](/Users/tumotumo/Documents/blog/src/pages/[...page].astro)、スマホ幅のスクリーンショットとDOM位置。

### D3 / 中：記事一覧の絞り込みを使いやすくする

確認：スマホではカテゴリ・タグ群が記事より先に大きく表示される。Flutterで絞り込むと件数は更新されるが、選択中のボタンにactive表示や `aria-current` がない。また「iOS,Swift」が1つのカテゴリとして存在する。

改善：モバイルでは絞り込みを折りたたみ、選択中のチップと解除ボタンを表示する。カテゴリを少数の大分類、細かな技術名をタグに整理する。既存の本文・タイトルを変えずに分類メタデータを整える。

根拠：[archive.astro](/Users/tumotumo/Documents/blog/src/pages/archive.astro:51)、`/archive/?category=Flutter` の実画面。

### D4 / 中：microCMS記事にも目次を表示する

確認：公開記事 `first-commit` には本文の見出しが4つあるが、目次も見出しIDもない。現在の目次はローカルMarkdownの `headings` だけを参照している。

改善：microCMSの本文・ブロックからも見出しを抽出し、衝突しないIDと目次を生成する。公開表示とプレビューで同じ処理を使う。スマホは折りたたみ、長い記事では現在位置が分かるようにする。

根拠：[記事ページ](/Users/tumotumo/Documents/blog/src/pages/posts/[...slug].astro:39)、[公開microCMS記事](https://tumolog.com/posts/first-commit/)。

### D5 / 中：記事の長さに合わせて広告量を調整する

確認：画面上「528文字・2分」の記事にも本文途中と末尾の2枠が出る。途中広告は「4段落以上なら2段落目の後」という基準なので、短い段落が多い記事にも入る。広告配信そのものが成功しているかは今回判定していない。

改善：段落数だけでなく本文の文字量・節の区切り・商品紹介との距離で配置を判断する。短文記事では末尾1枠などに減らす。広告が未配信の場合の余白も整える。広告量と収益の効果は実データで比較する。

根拠：[AdSlot](/Users/tumotumo/Documents/blog/src/components/integrations/AdSlot.astro)、公開microCMS記事の表示。

## 3. SEO・検索と共有

### E1 / 高：存在しないURLを404にする

確認：`https://tumolog.com/audit-not-found-20261001/` が200を返し、トップページのHTMLとトップのcanonicalを返す。`404.astro` がなく、Cloudflare PagesがSPAとしてトップへフォールバックしている挙動と一致する。Search Consoleが既にsoft 404と判定しているかは未確認。

改善：Astroで専用404ページを生成し、存在しないURLがHTTP 404になることを本番で確認する。404画面には記事一覧・検索への導線を置く。移動済みの記事だけは対応する新URLへ301にする。

根拠：公開HTTP応答、[Cloudflare公式の404・SPA挙動](https://developers.cloudflare.com/pages/configuration/serving-pages/)、[Googleのsoft 404説明](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors)。

### E2 / 中：本文・タイトルを変えずに検索用の説明文を補う

確認：公開記事24件のうち23件でmeta descriptionが記事タイトルと同じ。説明文が空ならタイトルを使う実装になっている。

改善：記事ごとに「何について書いてあり、何が分かるか」を説明するメタデータを追加する。新しいdescriptionを記事上部にも表示する現行仕様なので、検索用フィールドと本文上部のリード文を分けると、記事表示を変えずに対応できる。自動抽出を初期値にし、よく読まれる記事から確認する。Googleでの表示や順位改善は保証しない。

根拠：[記事ページ](/Users/tumotumo/Documents/blog/src/pages/posts/[...slug].astro:42)、同ファイル158行、[Googleの説明文ガイド](https://developers.google.com/search/docs/appearance/snippet)。

### E3 / 中：主要カテゴリを独立したHTMLページにする

確認：カテゴリ・タグは `/archive/?category=...` などでJavaScriptによる絞り込み。ページタイトルとcanonicalは共通の「記事一覧」「/archive/」。現在の設定は一覧に集約する方針としては妥当だが、カテゴリ別に検索で見つけてもらう入口はない。

改善：記事数と内容が十分ある主要テーマだけ `/category/.../` として静的生成し、固有の説明、記事一覧、タイトル、canonical、内部リンクを用意する。少数記事の全タグを一斉に独立ページ化して薄いページを増やさない。

根拠：[archive.astro](/Users/tumotumo/Documents/blog/src/pages/archive.astro:117)、[canonical生成](/Users/tumotumo/Documents/blog/src/layouts/EditorialLayout.astro:48)、実際のカテゴリ絞り込み。

### E4 / 中：記事内容を表す共有画像・構造化データの画像

確認：24記事のうち23件の `og:image` とBlogPostingのimageが共通のロゴ仮画像。仮画像としての表示は正常だが、記事内容を示す画像ではない。残るmicroCMS記事のOG画像は約1.48 MBの元JPEGを指定している。

改善：仮画像は残し、記事に対応する実写・スクリーンショットがある場合は代表画像を設定する。OG用に適切な寸法・容量の画像を生成する。画像がない記事のSNSカードはブランドを保ったタイトル入り画像も選択肢。ただしロゴ・文字だけの画像を、Google向けの記事代表画像の代替として一律に扱わない。

根拠：24記事のHTML、画像HEAD応答、[画像フィールド](/Users/tumotumo/Documents/blog/src/pages/posts/[...slug].astro:44)、[Google画像SEO](https://developers.google.com/search/docs/appearance/google-images)。

### E5 / 高：画像・広告による表示のズレを減らす

確認：UIkit記事は44画像のうち40画像にwidth/heightがなく、その画像例にはlazy指定もない。Qiitaの外部画像URLを直接使っている。広告枠は余白を持つが、広告本体のサイズに合わせた事前の高さ確保はない。実際のCLSの数値は未測定。

改善：画像寸法またはaspect-ratioを設定し、ファーストビュー以外を遅延読み込みする。所有する画像はAstroまたはCMSの最適化配信へ寄せる。広告は端末別に想定サイズを確保し、表示・未配信時に本文が動かないようにする。前後でモバイルのLCP・INP・CLSを測定する。

補足：トップの4つのCSSは非圧縮合計約200 KiBで、フォント定義も多い。不要スタイル・未使用フォントの削減は測定しながら進める。127個のfont-face定義があることは、127個のフォントが全部ダウンロードされた証拠ではない。現在のヒーローとアプリ画像は既にレスポンシブ画像・AVIFを使っている。

根拠：[UIkit記事](https://tumolog.com/posts/memo-uikit-scrollview/)、[広告スタイル](/Users/tumotumo/Documents/blog/src/styles/editorial.css:378)、[GoogleのCLS改善ガイド](https://web.dev/articles/optimize-cls)。

### E6 / 中：アプリ紹介を独立ページとして検索できるようにする

確認：5アプリの紹介はトップの `#works` 内にあり、アプリごとの詳細ページはない。ストアリンクは既にある。

改善：アプリごとに `/apps/.../` を作り、機能、対象ユーザー、対応OS、画面、ストア、関連する開発記事を掲載する。表示している実情報に対応するSoftwareApplication等の構造化データを検討する。評価・レビュー・価格を捏造してマークアップしない。構造化データだけで検索の追加表示が保証されるものではない。

根拠：[ProjectCard](/Users/tumotumo/Documents/blog/src/components/editorial/ProjectCard.astro)、[トップページ](/Users/tumotumo/Documents/blog/src/pages/[...page].astro)。

## 追加の小さな改善・確認事項

- **サイトマップのlastmod**：現状なし。記事の実際の更新日がある場合にだけ正確なlastmodを付ける。デプロイのたびに全記事を更新した扱いにはしない。[Googleのサイトマップガイド](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)。
- **wwwの受け口**：`www.tumolog.com` は確認時DNS未解決。必須ではないが、手入力・外部リンクに備えるならDNS/TLSを整え、パスを保って非wwwへ301にする。
- **説明的な画像alt**：旧記事にCleanShotファイル名のままのaltがある。内容を伝えるスクリーンショットは意味のある代替テキストへ。装飾画像や、隣のタイトルと重複するカード画像は空altのままでもよい。
- **更新後の公開確認**：今後のCIに、実在記事200、存在しないURL404、記事canonical、プレビューnoindex/no-store、公開・プレビューの表示差、microCMS記事件数のスモークテストを追加する。

## 既にある良い対策

- HTTPSへの301、Pagesの公開URLから独自ドメインへの301を確認。
- 公開24記事はすべて200、H1は各1つ。canonical、robots.txt、サイトマップ、BlogPosting・パンくずの構造化データは既に存在する。
- プレビューとエディターはnoindex/no-store。プレビューはReferrer-Policyもno-referrer。
- microCMSのHTMLは許可リストでサニタイズされ、JSON-LDはscriptを閉じられないようエスケープされている。
- エディターはpostMessageの送受信先・親を制限し、開くだけで記事データを更新しないことをテスト済み。
- microCMS取得にタイムアウト・リトライ・形式確認があり、公開記事の不足・重複を検知する。
- メインの記事カードはタイトルリンクの領域をカード全体へ広げる処理が既にある。
- スマホで確認したトップ・microCMS記事・記事一覧には横はみ出しなし。アプリのストアボタンは高さ44 px。

SEOとsecurity-reviewのスキルに従い、実装の存在だけでなく公開HTTP応答を検証し、確認済みの事実と未確認の管理設定・計測値を分けて記載した。
