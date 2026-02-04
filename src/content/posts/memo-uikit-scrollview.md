---
title: メモ:UIkitでスクロールさせる方法
published: 2024-06-30
description: ''
image: ''
tags: [iOS]
category: 'iOS'
draft: false 
lang: ''
---

:::warning
ド素人が書いた記事です。「おい！もっと良いやり方あるやろが！？」と思うかもしれませんが勘弁してください。
あとやり方が間違えていたらコメント欄で指摘してくださると助かります。。。！
:::

# 普通に制約をつける場合(ContainerView編+縦スクロール）

https://qiita.com/Swift-User/items/67a5dd3d9eabf513aa2c
この記事を書いてくださった方が非常に分かりやすいのでこのセクションのやり方はこっちを見てもらえればいいのだが、一点だけ躓いた部分があったので再度共有しておく。

### 1
| ScrollViewを設置 | ScrollViewにつける制約 |
|:-:|:-:|
|  ![CleanShot 2024-06-30 at 00.38.47@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/eebec900-aabe-329b-6506-b487492458a2.png) | ![CleanShot 2024-06-30 at 00.40.01@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/25273d97-8ce0-eb67-e5a2-87830ba82725.png)  |






ViewControllerにScrollViewを配置してAutolayoutで制約をつける。
（今回は全体に配置したいから上下左右0でいいな）

### 2
![CleanShot 2024-06-30 at 00.40.58@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/e0be99bf-0dfc-8f76-898c-88075e938602.png)
設置できたと思ったら何故か制約エラーが出やがる。

### 3
| エラー内容 | ガバガバ翻訳 |
|:-:|:-:|
| ![CleanShot 2024-06-30 at 00.41.31@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/44b44816-4cbc-fb8f-3a49-8842ff570f6b.png)  |  ![CleanShot 2024-06-30 at 00.42.11@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/cae34b2e-d3c1-d095-33a0-4a548ed975f0.png)
 |

エラーを見てみると
**"Has ambiguous scrollable content height and width"**
となっており英検すら受けたこと無い俺は理解できないのでGoogle翻訳に聞いたところ（文章めちゃくちゃ）
Xcode「スクロール可能なコンテンツの高さと幅が曖昧やでー」と言っている。

### 4
![CleanShot 2024-06-30 at 00.45.08@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/0a0de5f4-095a-ee68-451b-a41ad52f45f2.png)

とりあえず初心者なのでこのエラーはガン無視するとして（よくないが）
ScrollViewの中にContainerViewを配置する。
![CleanShot 2024-06-30 at 00.45.49@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/84293632-cb05-e1f3-1187-1799e58102ed.png)
ここまで無事にできていればこのような構成になっているはず。
### 5
![CleanShot 2024-06-30 at 00.48.38@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/120f2616-8bc3-0a5a-9422-918bc1938a68.png)
ScrollViewのContent Layout GuideとContainerViewを⌘キーを押しながら同時に選択をする。
![CleanShot 2024-06-30 at 00.49.30@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/b774ac7a-bd5d-a29d-3c8d-8c68a9fb6b62.png)

選択できた状態でAutolayoutのAliginを使って上下左右を固定する。（余計制約エラーが増えるがこの後の手順で消えるので大丈夫）

### 6
![CleanShot 2024-06-30 at 00.51.10.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/63a529ec-6aba-1197-820c-8d7897c34ee4.gif)
次にContainerViewから左クリックorkCtrlキーを押しながらFrameLayoutGuideに青い線を伸ばし、Equal Widthsを選択する。
### 7(ココ重要）
![CleanShot 2024-06-30 at 00.54.31@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/3cd4c0e5-72bd-6b19-377f-a9042063b1f4.png)

・・・とここまではさっきの引用した記事どおりなのだがココで記事にはない現象が起こってしまう
なぜかContainerViewが左にずれる現象が起こってしまう感じ。
これを解消する場合は
![CleanShot 2024-06-30 at 00.56.13@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/3ea6e95d-51d6-bf24-9b6f-893008a88d02.png)
ContainerViewのWidthの部分が怪しいので
![CleanShot 2024-06-30 at 00.56.47@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/aa3336f4-2c72-f31a-10e5-e9c78c2b8d99.png)
０．６・・・・・の部分を「1」に変更する
![CleanShot 2024-06-30 at 00.57.28@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/1d67c97e-54a1-9cc2-a64c-69c95d498ab3.png)
そうするといい感じになったはずや
### 8
![CleanShot 2024-06-30 at 00.58.09@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/73cf5f6e-d945-331d-f3c4-a4c23cea1a5b.png)
あとはContainerViewにHeightの制約（ココでは大げさに2000にしてる）をつけてあげればOK


### 9
![CleanShot 2024-06-30 at 01.03.05@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/3e224232-1097-1f37-1f5f-14314e395329.png)
あとはContainerView側にUI部品を配置すればOK
![Simulator Screen Recording - iPhone 15 - 2024-06-30 at 01.03.55.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/bc7bf650-6edd-5cdd-6392-226af1843848.gif)
こんな感じでスクロールできているはずや

## 普通に制約をつける場合(ContainerView編+横スクロール）

カンの鋭いなら分かるけど、横スクロールの場合はさっきの方法の「5」までは同じで
### 1
![CleanShot 2024-06-30 at 01.08.49.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/8790d179-716c-70db-f25c-c8806d8e6117.gif)
ContainerViewから左クリックorkCtrlキーを押しながらFrameLayoutGuideに青い線を伸ばし、Equal Heightを選択する。（Widthじゃないよ！）
### 2
![CleanShot 2024-06-30 at 01.10.04@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/23a1ebfc-dce6-4315-0039-5d42fd8340a7.png)
こんな感じにさっきは横長だったが、縦長になるので
![CleanShot 2024-06-30 at 01.10.36@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/8af67c2d-c1a6-edaf-0a39-fd80ef13fbf5.png)
この部分の制約を1に変更する。

### 3

![CleanShot 2024-06-30 at 01.11.26@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/591d2324-b50f-d65d-7d12-3dc48cfb3cad.png)
![CleanShot 2024-06-30 at 01.11.45@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/e928bf4d-d6ed-1847-815f-dce2936245d2.png)

あとはContainerViewにWidthの制約をつけてあげればOK


# StackViewを使って縦スクロールする場合
###1
![CleanShot 2024-06-30 at 03.15.58@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/69d27a91-de3a-7e7c-ab48-ed97c12cea4f.png)
親の顔より見たScrollViewをおいて上下左右制約をつける(同じく0な)
###2
![CleanShot 2024-06-30 at 03.16.41@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/6db31683-0278-50a7-5a97-6769081163aa.png)
StackViewをScrollViewの中にいれる（書くのめんどくさくなってきたのでスクショ丸ごと貼り付ける）

###3
![CleanShot 2024-06-30 at 03.18.29@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/b7821ed4-068d-da2a-e8c4-0225a8592154.png)
Content Layout GuideとStackViewを⌘キーで同時選択してAutolayoutのAliginを使って上下左右を固定する。
![CleanShot 2024-06-30 at 03.19.27@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/f795f592-9d78-e645-9dd5-78e1688e511e.png)
こんな感じになればおｋ
###4
![CleanShot 2024-06-30 at 03.20.06@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/13d7160e-2feb-72ed-1e11-6451374747a2.png)
StackViewとFrame Layout Guideを⌘キーで同時選択して
![CleanShot 2024-06-30 at 03.20.37@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/bc2899e9-acc1-882f-3055-95880ac6d629.png)
Equal WidthsとEqual　Hightsを追加する
![CleanShot 2024-06-30 at 03.21.27@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/99c4da17-cead-e7aa-12b4-2b68c8a05687.png)
制約エラーが消えて「なんかいい感じじゃん」みたいになればおｋ
###5
![CleanShot 2024-06-30 at 03.22.24@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/fd89d604-4094-ff2e-4ddc-2d0f1776b3e5.png)
![CleanShot 2024-06-30 at 03.23.30@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/a0eb69b4-5853-44f9-bca1-7e39bdd45039.png)

ただこのままだと高さの制約が被ってしまっていてスクロールできなくなるため赤部分の制約のpriorityを下げる(Highにする)
![CleanShot 2024-06-30 at 03.24.15@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/84529bd7-5fe5-e101-6f4e-bb3b9b2af260.png)
高さの制約の部分が点々になればおｋ
###6
![CleanShot 2024-06-30 at 03.25.43@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/4ea65426-75e3-77b9-d2cd-e04cad992718.png)
StackViewの中にUIパーツを追加する（とりま今回はViewを２つ追加した）

###7
![CleanShot 2024-06-30 at 03.26.32@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/c5e28cc8-af83-1f0d-f67a-288c7e2811c5.png)
このままだと制約エラーになる+今回は部品を均等に配置したいので
![CleanShot 2024-06-30 at 03.27.08@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/4ea03dd2-d3ec-98d2-8eff-cac135049c87.png)
![CleanShot 2024-06-30 at 03.27.08@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/b7db8b52-304d-f03c-b673-c93b81751eeb.png)

StackViewのDistributionをFillequallyに変更する

### 8
![CleanShot 2024-06-30 at 03.33.39@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/52ebc4b2-0779-2c2d-a0c9-8ff723ba13a7.png)

それぞれのViewとFrame Layout Guideを⌘キーをで同時選択して
![CleanShot 2024-06-30 at 03.34.07@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/03ebf324-94d4-2a62-f8e7-076730ddc110.png)
Equal WidthsとEqual Heightsを追加する

そうするとスクロール可能になっているはずだ。

### 9 補足
![CleanShot 2024-06-30 at 03.34.55@2x.png](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/54dcba6f-07d9-4b42-cde3-bf1faae213e1.png)
なぜかFillequallyにしているのにそれぞれのViewが半分になる場合は
それぞれのViewに追加した制約のEqual Heightsの数値が「1」になっているか確認してほしい。
なぜかわからんが0.6・・・となったので。
これを１にすれば

### 結果
![Simulator Screen Recording - iPhone 15 - 2024-06-30 at 03.37.45.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/1657253/3f3aa89f-3bdc-a184-fbf9-9aeb8b590854.gif)
こんな感じでスクロールできるはずだ。お疲れ様です。

・・・・・スクロール実装するのにこんなに時間かかるのだるすぎる。

