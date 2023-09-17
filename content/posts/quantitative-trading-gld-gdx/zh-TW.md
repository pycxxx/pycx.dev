---
title: Quantitative Trading - 範例 3.6
description: 閱讀 Quantitative Trading (Ernest Chan) 範例 3.6 的紀錄
date: '2023-09-16T13:58:19.050Z'
featuredImage: ./featured.avif
featuredImageAuthor:
  name: Alexander Grey
  url: https://unsplash.com/photos/8lnbXtxFGZw
category: Reading
tags:
  - Trading
---

這是閱讀 [Quantitative Trading](https://www.amazon.com/Quantitative-Trading-Build-Algorithmic-Business/dp/1119800064) 書中範例 3.6 的紀錄。書中對範例的說明其實沒有很詳細，花了一點時間理解。這邊記錄下來，以免日後忘記。

GLD 反應的是黃金現貨價格，GDX 則是黃金礦業 ETF，直覺上他們價格是有關連的，所以拿來作配對交易。策略是希望不受黃金價格波動影響，賺取 GLD、GDX 價格異常與正常情況間的價差。

為了達到對沖黃金價格波動風險的效果，需要決定資金分配在 GLD、GDX 的比例，也就是書中提到的 [__Hedge Ratio__](https://www.yesfund.com.tw/z/glossary/glexp_4541.djhtm)。要決定 Hedge Ratio 會需要知道，GLD 價格變動與 GDX 價格變動的關係，範例採用線性回歸來做這件事情 $Y = b_0 + b_{1}X + \varepsilon$。$Y$ 是 GDX 價格，$X$ 是 GLD 價格，$b_1$ 代表的是 $X$ 每變動一單位 $Y$ 的變化量，也就是我們要的 Hedge Ratio。

接下來書中直接給了 spread = GLD - hedgeRatio * GDX 這個公式，然後用 spread 的 z-score 來判斷買賣時機。想了一下，其實 spread 就是上面回歸式中的 $b_0 + \varepsilon$，而 $b_0$ 是常數，所以我們算的其實就是殘差 $e_{i}$ 的 z-score。也就是說如果我們把上面的線性回歸來做圖的話，我們就是抓出那些偏離回歸線比較多的點當成是他們的價格異常，可以買入或賣出。

接下來他在原有的 table 中，加入 4 個 column，分別表示多/空 GLD 與 GDX。會需要 4 個而不是 2 個 column，我想是因為可能有波動比較大的時候，可能 z-score 隔天就從 -2 變成 2，或反過來。最後再將 4 個 column 合併（相加）成 2 個以相互抵銷多空部位。1 代表有「多」的部位，-1 代表有「空」的部位，0 則是沒有部位。一開始因為作者只有在交易的那天才修改多空部位的設定，所以從修改部位一直到賣出前，設定一直都會是 na。而 na 不代表有多空部位，需要將所有 na 值設定為前一次出現的值，這樣才代表我持續持有部位，直到賣出。

有了紀錄部位變化的來為之後，就可以依據這個欄位計算報酬率變化。這邊需要注意的是，我是以前一天的價格來計算是否要調整部位，因此部位變化的欄位需要向後移動一天。將移動後的欄位與股價的每日報酬率相乘，得到我們持有的部位的每日報酬率。把 GLD、GDX 的報酬率相加，得到這個策略整體的報酬率。接下以每日策略的報酬率計算 Sharpe Ratio，最後再換算成 Annualized Sharpe Ratio(第二版 48 頁有詳細說明計算方式)。
