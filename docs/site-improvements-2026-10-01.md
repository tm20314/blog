# つもログ：監査後の改善・検証記録

実施日：2026-10-01。対応元：`docs/site-audit-2026-10-01.md`。
アプリごとの紹介ページ（E6）はユーザー指定で対象外。
この記事はローカル実装の記録。本番公開済みという意味ではない。

## 維持したもの

- 記事のタイトル・本文と既存URL。`src/content/posts` のGit差分なし。
- 黒・白・ライム色のデザイン、写真、アプリ一覧、既存のCMS記事・装飾。
- microCMSの下書き・公開内容、CloudflareのAPIキー、GA4・AdSenseの既存ID。

security-reviewで入力制限・秘密値・依存関係を確認し、seoで検索用メタデータと実際のHTMLを検証。baseline-uiに合わせ、既存部品の操作・表示を調整した。全面リデザインや記事の書き換えはしていない。

## 対応一覧

| 項目 | ローカル実装 | 補足・残作業 |
| --- | --- | --- |
| S1 依存関係・CI | Astro 7.3.5、関連パッケージ更新、不要依存削除。テスト・監査・履歴シークレット検査のCI追加 | CIはPush後に実行。Node 22.12以上が必要 |
| S2 配信ヘッダー | CSPのobject/base/frame制限、HSTS、Permissions-Policy、nosniff。エディターのCMS埋め込み維持 | スクリプトCSPはReport-Only。地域別広告・SNS動作を本番確認してから全面強制へ |
| S3 プレビューAPI | 実受信サイズ4096バイト、IPごと30回/分、413/429、上流を呼ばない拒否処理 | メモリ内制限はインスタンス間で共有されない。Cloudflare側WAFの分散レート制限は未設定・未確認 |
| S4 秘密値管理 | `.env.*`・`.dev.vars*`除外、例示ファイルだけ例外、Gitleaks CI | 限定パターンでローカル36コミットを検査し検出なし。Gitleaks自体の全履歴検査はCI実行待ち |
| S5 同意と計測 | 解析同意の許可・拒否・変更UI、期限付き保存、許可前GA読込抑止、撤回時無効化。広告と解析の同意を分離 | AdSense地域別CMPの設定は未確認。Google CMPがあれば同意変更画面へ接続。広告同意を独自UIで勝手に許可しない |
| D1 ナビ・検索 | デスクトップ共通ナビ、スマホメニュー、Pagefind検索・ローディング・空結果・エラー表示 | 実ブラウザーでFlutter検索の12件を確認。検索ページはnoindex |
| D2 スマホ導線 | ヒーローの高さ・見出しを調整、新着記事とアプリへの導線 | 390×844で両方の導線が初期表示に収まることを確認 |
| D3 一覧の分類 | スマホの折りたたみ、選択チップ・解除・件数・aria-current、Swift/iOS複合カテゴリの表示統一 | 記事の元データは保持。旧クエリも正規化して絞り込み |
| D4 CMS目次 | 公開・プレビュー共通の見出しID、重複防止、折りたたみ、現在位置 | メイン本文のh2〜h4を対象。非表示タブやアコーディオン内は目次に混ぜない |
| D5 広告密度 | 途中広告は本文1200字以上、8段落以上、600字・35%以上読了後。商品ボックス等を除外。末尾は300字以上。ポリシー記事は広告なし | 未配信枠の高さを保持して急なずれを抑制。配信成功・収益変化は未測定 |
| E1 404 | 独立した404.html、noindex、記事一覧・検索導線 | ローカルHTTP 404確認。本番の未知URLも公開後に確認する |
| E2 説明文 | コードを除いた本文から160字以内で抽出。指定説明文を優先。表示用リードと分離 | 23記事でタイトルと同一のmeta descriptionにならないことを確認 |
| E3 カテゴリHTML | Flutter・iOS・就活の独立ページ、固有タイトル・説明・canonical・CollectionPage | 少数カテゴリは一覧絞り込みを維持。タグは変更しない |
| E4 共有画像 | 実際の記事画像がある場合、1200×630のJPEGを生成。ロゴだけの場合はBlogPosting画像に混ぜない | 今回12画像を生成。`beginner-student-internship-guide`の外部画像取得に失敗し、その記事だけ共有ロゴへ退避、JSON-LD画像省略。本文は変更していない |
| E5 画像・広告領域 | Markdown画像の信頼済みCDN寸法取得・キャッシュ・遅延読込、生成時代替テキスト改善、CMS画像フィールドの寸法使用、広告領域確保 | CMSリッチ本文は保存済み寸法を保持。寸法未提供・取得不能の外部画像は完全保証しない。CWVは本番で測定する |
| E6 アプリ詳細ページ | スキップ | トップの紹介一覧は残す |
| 補足 URL・サイトマップ | wwwとPagesホストの301、実更新日lastmod、私的ページを除外、公開検証スクリプト | wwwのDNS/TLSは管理画面確認待ち。旧GitHub Pages配信停止・Search Console状態は変更していない |

## 検証結果

- `pnpm install --frozen-lockfile`：成功。
- `pnpm build`：成功。36HTMLページ、Pagefind検索インデックス生成。
- `pnpm check`：97ファイル、エラー・警告・ヒント0。
- `pnpm test:site`：51件成功、失敗0。
- `pnpm test:build`：23記事のcanonical・説明文・H1・目次リンク先・JSON-LD・OG画像サイズ・サイトマップ更新日・カテゴリ・検索・404を検証。
- `pnpm audit --prod`：既知の脆弱性警告0。未知の脆弱性までないという保証ではない。
- `git diff --check`：成功。記事ソース差分なし。
- 実ブラウザーで320・390・768・1440px幅のトップを確認。横はみ出しなし。スマホメニュー・検索・Flutterの一覧絞り込みを確認。
- UIKit記事へ遷移して固有URLになり、「戻る」でトップに戻れること、本文画像40枚にwidth/heightがあり、目次項目に実在する見出しIDがあることを確認。
- GA同意・CMS見出し/画像・広告位置は実装を使ったDOMテスト。外部Googleへ送信せず、CMS保存・公開操作なし。

## 本番反映前の注意

1. ローカルはmicroCMSの環境変数なしで23記事をビルドしている。本番はCMS記事を含むため、このローカルdistをそのままアップロードしない。Cloudflareの既存環境変数を保ったGitビルドで公開する。
2. Nodeのバージョン指定は`.node-version`の22とpackage engines。Cloudflareの`NODE_VERSION`環境変数がこれより優先される場合は22.12以上へ合わせる。
3. 公開後に`pnpm test:public`で全公開URL・本当の404・プレビュー/editorのno-store・noindex・Origin拒否を確認する。既存のCMS公開記事が残っていることも確認する。
4. Chromeへの接続が利用できず、Cloudflare WAF・AdSense CMP・www DNS/TLSを管理画面で確定できなかった。コード対応をもってこれらまで完了とはしていない。
5. 広告が実際に配信される地域でCSP報告・CMP・同意変更を確認。Search Consoleのサイトマップ/インデックスとPageSpeed/実ユーザーCWVは公開後に確認する。

このターンでコミット、Push、デプロイ、DNS変更、公開記事の保存は実施していない。

## 参照

- [Astro 7更新ガイド](https://docs.astro.build/en/guides/upgrade-to/v7/)
- [Cloudflare Pagesの404挙動](https://developers.cloudflare.com/pages/configuration/serving-pages/)
- [Cloudflare Pagesのビルド環境](https://developers.cloudflare.com/pages/configuration/build-image/)
- [Google Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)
- [Google CMP要件](https://support.google.com/adsense/answer/13554116?hl=en)
- [Google広告同意変更API](https://developers.google.com/funding-choices/fc-api-docs)
