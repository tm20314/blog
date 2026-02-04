---
title: FlutterでReleaseビルドをするとネットが繋がらなくなる問題への対処法
published: 2024-02-23
description: ''
image: ''
tags: [Flutter]
category: 'Flutter'
draft: false 
lang: ''
---

# 起こっていること

https://github.com/gadgelogger/kokorahenn_flutter

ワイ「Flutter使ってこんなアプリ作ってるんやけど、そろそろ完成しそうやな」

ワイ「せや！release buildしてAndoridでチェックしたろ」
↓
ビルドしてAPKで書き出し
↓
「無事にビルドできたわ。。。。。うん？？？なんか店舗情報取得できねぇ。。。どうなってんだこれ？？？」

みたいな状況が発生した。

| 正常な時 | 今回の現象 |
|:-:|:-:|
| ![Screenshot_1708617694.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/4008052d-f5ac-553b-94f8-8433fbd47015.png)|  ![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/61980595-f873-6362-7363-144ca4d0d3c7.png) |



# 対処法

https://minpro.net/socketexception-failed-host-lookup

パーミッションの設定漏れが原因でしたね。分かっている人なら
「初歩的なミスだなwwwwおいwwww」となるけど、意外と忘れがち。


```xml:/flutter_project/android/app/src/main/AndroidManifest.xml
<uses-permission android:name=”android.permission.INTERNET”/>
```

コレを追加しておこう。
