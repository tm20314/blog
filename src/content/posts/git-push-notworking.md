---
title: Gitでpushが終わらない時はセキュリティソフトを疑え！！！！！！
published: 2024-10-18
description: ''
image: ''
tags: [雑記]
category: '雑記'
draft: false 
lang: ''
---

# 背景
ワイ大学４年生なんだけど研究室のダチが

ダチ「GitのPushができねぇ！設定はできているのになんでや!?!?!?」
ワイ「おーん？どうした？？見てみようか？」

ってなった感じ

# 状況
コミットしたファイルを
```
git push origin main
```
こんな感じでPushしようとして（ログはあくまでも例）

```
Enumerating objects: 120, done.
Counting objects: 100% (120/120), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (120/120), 670.28 MiB | 762.00 KiB/s, done.
Total 120(delta 1), reused 0 (delta 0), pack-reused 0
```

正常にPushできたかと・・・思えばここで止まるんよね

# 一般的な解決方法
## ターミナル一旦閉じて再度Pushする
困った時は再起動！これに尽きるね。

・・がこんなので治るわけないだろ。

## バッファサイズを上げる
```
git config --global http.postBuffer 157286400
```
ワイ「Unityのプロジェクトフォルダでサイズがデカいからバッファを上げたらいけるんじゃねぇの？」
と思い、バッファサイズを上げ再度pushする。
そうしたら9割の人は治るが・・・・・これでもいかない・・・

ワイ「は？？？？？？？」



# 結論
ワイ「ネットワークも変えたし、バッファサイズもあげたし、Githubの設定関連は問題ないな・・・・？うん・・・？なんだこのステータスバーにあるアイコンは？？？？？？？」

![image.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/cee703a3-d82a-df4d-9d56-df15587e1fa0.png)


ワイ「セキュリティソフトやんけ。ワンチャンこれ保護オフにしたらどうなるかな？」

```
Enumerating objects: 120, done.
Counting objects: 100% (120/120), done.
Delta compression using up to 8 threads
Compressing objects: 100% (120/120), done.
Writing objects: 100% (120/120), 670.28 MiB | 762.00 KiB/s, done.
Total 120 (delta 1), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (1/1), done.
To https://github.com/your-repository.git
 * [new branch]      your-branch -> your-branch
```


ワイ「や　っ　た　ぜ（長年大人のサイトを見てきた経験が役立った）」


というわけでたかがセキュリティソフトのためだけに時間食われました。マジで辛い。
（ちな本人曰くセキュリティソフトが鬱陶しいらしいので無効化してWindowsdefenderに切り替えておいた）

