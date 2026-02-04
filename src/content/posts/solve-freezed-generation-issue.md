---
title: freezedでxxx.g.dartが生成されなくてキレている人へ
published: 2024-02-14
description: ''
image: ''
tags: [Flutter]
category: 'Flutter'
draft: false 
lang: ''
---

# チェックポイント

# その１　必要なパッケージはちゃんと入ってる？

https://pub.dev/packages/freezed

![CleanShot 2024-02-14 at 16.20.57@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/7c2c37d3-c806-0659-37a4-12380b0fc26f.png)


Readmeのinstallセクションで必要なパッケージが記載されている。Freezed単体だけでは動かないので注意。

あとちゃんと公式のドキュメントを見よう（俺な）


# その２　ファイル名をミスってないか？
![CleanShot 2024-02-14 at 16.21.58@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/52dc2ba7-ddcc-c6a4-ad3b-00bb42ddd8e8.png)

partのファイル名とlib配下にあるファイル名が違ってると生成できないで。
アホ初歩的なミスだけど俺はやらかしたので書いておく

# その３　puspec.yamlのインデントがあっているか？
![CleanShot 2024-02-14 at 16.23.47@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/ad531736-21c3-fb5e-3402-95d1e4464e8f.png)

ターミナルからパッケージをインストールした人は問題ないけど、
ファイルに直接入力した人は要注意。
インデントミスっててちゃんとインストールできてなかったりする。

# その４　.fromJsonをちゃんと書いてる？
例えば飯のAPIを叩きたいときにRestaurantクラスを書いたとする
```
  factory Restaurant.fromJson(Map<String, dynamic> json) =>
      _$RestaurantFromJson(json);
```
```
.fromJson//コレが必要なので注意
```
コレちゃんと書いてないと動かんよ。

# その５　ていうかpartを記述していない
![CleanShot 2024-02-14 at 16.28.37@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/05c46d53-ad17-29eb-395d-67ad142b75a8.png)

赤枠の部分な。意外と忘れがち。

# その他
### ファイルがちゃんとlibとbinディレクトリの中にある？
特に何も指定しないとlib/かbin/配下のファイルだけが生成対象となるので注意。

### pubspec.lockを一旦削除
コレは俺のカンやけど、pubspec.lockを削除して再度
```
flutter pub get
```
すると治ることもある。

### ターミナルとエディタを再起動
これでも治ることがある。（困ったときは再起動ってやつやな）

