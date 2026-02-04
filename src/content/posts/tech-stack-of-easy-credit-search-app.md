---
title: 【技術編】大学を留年しかけたので楽単を検索できるアプリを作ってみたらユーザー数が1000人超えちゃった話
published: 2024-03-29
description: ''
image: ''
tags: [Flutter]
category: 'Flutter'
draft: false 
lang: ''
---

# 前回のおさらい
この記事参照

https://qiita.com/gadgelogger/items/34c69f554a70e2beadc6

# なぜこの記事を書こうとしたのか
前回の記事では「制作背景的な話題」が結構多くて、「なぜ自分がFlutterを使ったのか」「どういう機能を実装したのか」「苦戦したポイントは何か？」「何の技術をどう使ったのか」などなど

学んで得たこと

が一切記載できていなくて、お世話になったエンジニアの方から「こりゃあダメやろ」とご指摘を受けたのでしっかりここで書こうと思った感じ。

なので今回は真面目モードでこの記事を書いていこうと思う。

# そもそもなぜFlutterを選んだん？
結論から言うと
- 早くアプリをリリースしたかった
- SwiftやKotlinを両方学ぶのはキャパ的に厳しかったため

の2つが理由だね。当時アプリを作り始めたのが大学２年生からで、自分自身「早くアプリをリリースしてもらってみんなに使ってもらいたい。ただSwiftとKotlin両方を学んでいると期間的に卒業までに間に合わない」と思ったんよ。

そこでGoogleで「Android iOS 両方アプリ　作れる」みたいなワードで検索したら”クロスプラットフォーム”という存在を知って、そこで ReactNativeとFlutterの2つに行き着いた感じ。

そこからなぜFlutterを選んだかというと

- 大元がGoogleなので信頼できそう
- 結構界隈が盛り上がっていて、アップデートの頻度も高く今後の成長がありそうだったから

今思うとすごく安直な選定理由だけど、この選択は間違えてはなかったかなと思う。

# どうやって勉強していった？
筆者はプログラミングの”プ”も分からなかったため
「とりあえず動けばいい」的なスタンスで当時は学び始めて行った。

当時はFlutter大学とか日本語でのコミュニティが少なくて、情報もあまりなかったため

環境構築やレイアウトなど基本的な使い方は以下のページを参考にさせてもらって学習していった。

https://www.flutter-study.dev/

あと逐一このページのQiitaやZenn・StackOverflowなどで「やりたいこと_Qiita」みたいな感じで検索し、勉強して行った。

# Flutterの技能としてどこまで学んだのか
- 基本的なレイアウトの理解（Colum・Row・Padding・Sizedboxなどなど）
- 超基礎的だけどStateFullWidgetやStatelessWIdgetの違いや使い分け
（状態を保つか・持たないかの違い）
- 実際になんらかのAPIを叩いて画面に表示する一連の流れ
（dioの使い方・非同期処理・initStateの最低限の使い方・Jsonの扱い方）
- RiverpodとFreeezed等の使い方（インターン先で現在勉強中）

# Firebaseの技能としてどこまで学んだのか
- Firebase Authenticationを使ったログイン・アカウント管理機能
- FireStore Databaseを使ってデータを保存したりFlutterで表示させる
- Firebase Storageを使ってユーザーデータ（アカウント画像とか）を保存させる
- Remote Configを使ってメンテナンス機能を作ってみる
- Cloud Functionsを使ってFirestoreのデータを操作してみる

# アプリ全般の技能としてどこまで学んだのか
- アプリを作ってリリースするまでの一連の流れ
- Xcode・Vscodeの基本操作
- Appstoreへの申請の一連の流れ
- 審査に合格するためにはどうすればいいのか？のコツ
- iOS Deployment Targetについて
- Githubなどのバージョン管理


# なんの技術をどうやって使った？
### ログイン画面_Firebase Authentication

ログイン画面にてFirebase Authenticationを使ってます。

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/1ed3d78a-9dee-ee81-95fc-808ca52e12a6.png)

今となっては古いんですけど、当時はこの記事を参考にしてメールアドレスとパスワード認証を実装してました。

https://www.flutter-study.dev/firebase/authentication


### 強制アップデート機能 FireStore Database

https://x.com/gadgelogger/status/1633503309171687424?s=20

この記事を参考にして実装していました。

https://zenn.dev/flutteruniv_dev/articles/713dca4c5bf080

### 講義評価の投稿と閲覧機能_FireStore Database
| 1 | 2 | 3 |
|:-:|:-:|:-:|
| ![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/8a09e0b6-66d3-ead3-c388-524f1c331e61.png)| ![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/df216b77-d4e9-c15d-6bb2-08e3c77175f1.png)| ![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/a3e671dc-6668-af84-45ac-d58bd5ab8cfa.png)|

当時は最低限「コレクション内のデータを取得して表示しよう」となっていたので以下の記事を参考に作っていました。

https://www.flutter-study.dev/firebase/cloud-firestore-try

今だとこっちの方がよりわかりやすくて発展的かも

https://zenn.dev/flutteruniv/books/flutter-textbook/viewer/make-chat

### メンテナンス画面_Remote Config

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/5954be56-d3df-eff2-f8d2-3e4b81e3f39a.png)

Firestoreのデータをいじったりするときにメンテナンス機能をつけています。
これを参考にして作ってました。

https://qiita.com/shouhi/items/17e2835aa83cc6cd5da2

### お知らせ機能_universal_html

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/da515aad-3b60-77fa-39fc-3188db6c323a.png)


大学の公式サイトがRSSフィードに対応していなかったので、半ばゴリ押してスクレイピングして情報を取得しています。
思いっきり相手側のサーバーへ負荷をかけてしまうので、さすがに良い機能では無いなと思ってます。（せめてキャッシュしたり状態を保持してリクエスト回数を減らすようにはしている）


https://zenn.dev/maguroburger/articles/flutter_scraping



# やってみて苦戦したこと
### Appleの審査に受かるまでが一苦労した
これに尽きる。ありがちだと思うけど、自分は以下の３点で苦戦した。

- ユーザーの退会機能の実装
- ユーザーのブロック機能の実装
- GoogleSigninを実装するとAppleSigninが必要なこと

### ユーザーの投稿機能の実装
アカウント関連の機能を持つアプリではガイドラインで退会機能をつけないとリジェクトされる。
自分は最初そんなこと知らなかったので、1回目はこれでリジェクトされた。

https://developer.apple.com/jp/support/offering-account-deletion-in-your-app/

### ユーザーのブロック機能の実装
口コミを投稿するアプリなので特定のユーザーをブロック・通報できる機能がないとブロックされる。ただ当時の自分はブロックできる機能を実装できる能力がなくて
「ここで詰みかなぁ。。。」
と思っていたら「通報する機能とブロックする機能はGoogleフォーム経由でもいいらしい」と言う噂を聞いたので、それで実装してみたら無事に審査に合格することができた。

まあ要するに「作れなかったから妥協した」って感じやね。
今なら作れるので今後のアップデートで実装していきたい。

ガイドラインの1.2に書いてある。

https://developer.apple.com/jp/app-store/review/guidelines/


### GoogleSigninを実装するとAppleSigninが必要なこと
これびっくりしたんだけど、サードパーティーのログインサービスを使うとリジェクトされるらしい。
Appleらしいね（皮肉）

https://zenn.dev/n_thy/articles/scade_apple_sign_in_d06b2e9551891b



# 作って運用してみて
正直プログラミングなんもわからんからスタートしたアプリなので課題まみれになっている。
課題は以下の通りで

- シンプルにコードが肥大化していて汚い（Widgetを分割して綺麗にしている）
- 関数名・クラス名・ファイル名・Firebaseのコレクション名やフィールド名の命名規則をきちんと設定していなかったのでぐっちゃぐちゃ
- Riverpodを採用しているが、なぜStateがダメでRiverpodが良いのか？の明確な理由が見つかっていないためそこを説明できるようにする。

```
class reviewscreen extends StatelessWidget {
  const reviewscreen({super.key});

  @override
  Widget build(BuildContext context) {
    const text = '';
    const text1 = '';
    const text2 = '';
    const text3 = '';

    return const Placeholder();
  }
}
```

こんな感じのクソコード（命名規則ガン無視）が爆誕してる。
ただこれらの課題点は今頑張って修正していて、だいぶ改善できてきているとは思う。

最後の部分についてはまだまだ勉強不足だと思う。Flutterは状態（State）が本当に大切だと思うし、これが使いこなせないとお話にならないのでちゃんと勉強して別記事で出そうと思う。


あとFlutterを触っていていくつか気になって点もあって

# Flutterの気になる部分
あくまでも自分の主観だと以下の点が気になる
- ネストが深くなりがち
- 状態管理のパッケージの数おおくね？
- OS特有の機能を使おうとすると厳しい

### ネストが深くなりがち
どうしても凝ったUIとかをゴリゴリ作ろうとするととんでもない量のコードが爆誕したり。。。
まあWidgetかClassとして切り出してあげること＋DevToolsを使って確認すれば問題はないが、意識していないと肥大化しがちなので気をつけたいかも。

### 状態管理のパッケージおおくね？
自分の知っている限りでこんなにあるので、初学者（自分もだけど）が勉強するとなると
「どれ選べばいいんだ。。。。」となる点。
Flutterって簡単にアプリを作れるのが魅力ではあるけど、ある一定のラインを超えるとすっごく複雑かつ奥深くなってくるなと感じる。
Provider 

https://pub.dev/packages/provider

Riverpod

https://pub.dev/packages/flutter_riverpod

GetIt

https://pub.dev/packages/get_it


Bloc

https://pub.dev/packages/flutter_bloc

Rxdart

https://pub.dev/packages/rxdart



# 今後について

なんかまとまりのない記事になってしまって申し訳ない。
この記事を書いている中で「自分全然Flutterに対する知識薄すぎるだろ」と感じてしまったのでもっとがむしゃらに勉強していくしかないな・・・

あとこの後の内容はこの記事とは関係ないかもしれないんだけど、今後はネイティブの部分も攻めていきたいと考えている。(Swift/kotlin)

きっかけは去年のお世話になったインターン先のメンターの方と就活に対する相談事を話す機会があって

自分「Flutterで就活をしていこうと思っているんですよね」
と言ったらメンターの方が
メンター「ちょいまち。それは結構危険かもしれん」
と言ったんよね。（Flutterメインでエンジニアを目指している人はすまない）

理由としては
メンター「確かにFlutterも良い技術ではあるけど、大前提としてネイティブの技術がある上で成り立っているわけだからモバイルアプリのエンジニアを目指すのであればネイティブから取り組んだ方が良いと思うよ。その方がgadgeloggerさんの強みであるFlutterがもっとより良くなると思うし」
な感じ。確かにFlutterでアプリを作る上でどうしてもネイティブ側の知識が必要となってくる場面が多々あるのでこの考え方に自分は賛同した。


ただインターンが終了したのが11月であり、本選考とかぶってなかなかSwiftのキャッチアップができていないのが難点ではある。

（初心者向けの方を一周したりして基本的なことは学習はできているけど、まだまだ半人前）


もし就活を終わらせることができるか、就活を諦めたらSwiftにもしっかりと取り組んでいきたいなと思う。

