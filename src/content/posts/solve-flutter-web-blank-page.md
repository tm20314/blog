---
title: FlutterをWebで動かすと白紙になる人へ
published: 2024-03-09
description: ''
image: ''
tags: [Flutter]
category: 'Flutter'
draft: false 
lang: ''
---


# はじめに
![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/fdf196c3-20b3-e174-5655-bb64ebb0213c.png)

FlutterでWebを使おうとしたら、正常にビルドはできるのに表示されないトラブルに遭遇したため、対処法を書いておく。

ちなクッソ雑い記事なのでごめん🙏

## その1:Flutter in app web viewを使っている場合
エラー内容
:::note alert
TypeError: Cannot set properties of undefined (setting 'nativeCommunication'
:::

なんかこのエラーが出ていた為、ひたすらGithubやらネットの海を漁っていると以下の情報がヒットした。

https://github.com/pichillilorenzo/flutter_inappwebview/issues/1468


このコードをweb/index.htmlのどこかに記載してあげると改善する模様。
```
<script type="application/javascript" src="/assets/packages/flutter_inappwebview/assets/web/web_support.js" defer></script>
```

## その2:Firebase関連のパッケージを最新にする
エラー内容

:::note alert
TypeError: Class constructor IndexedDBLocalPersistence cannot be invoked without 'new'
:::

その１の対応をするとエラーメッセージが変わった。ググってみると以下のサイトの情報がヒットした。

https://stackoverflow.com/questions/77705647/flutter-typeerror-class-constructor-indexeddblocalpersistence-cannot-be-invok

このパッケージを最新Verにしてあげると俺は無事に表示することができた。
```
 dependencies:
  firebase_core: ^0.0.0
  cloud_functions: ^0.0.0
  firebase_auth: ^0.0.0
  cloud_firestore: ^0.0.0
```


# まとめ
FlutterでWebを使おうとするとなかなかすんなりいかねぇな。
