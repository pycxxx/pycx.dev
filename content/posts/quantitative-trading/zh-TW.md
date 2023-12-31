---
title: Quantitative Trading 閱讀心得
description: '閱讀 Quantitative Trading: How to Build Your Own Algorithmic Trading Business 的筆記'
date: '2023-10-01T03:00:27.260Z'
featuredImage: ./featured.avif
featuredImageAuthor:
  name: Dylan Calluy
  url: https://unsplash.com/photos/JpflvzEl5cg
category: Reading
tags:
  - Trading
  - Reading
---

## 這是一本什麼樣的書？

["Quantitative Trading: How to Build Your Own Algorithmic Trading Business"](https://www.amazon.com/-/zh_TW/Ernest-P-Chan-dp-1119800064/dp/1119800064/ref=dp_ob_image_bk) 的作者是 [Eric Chan](http://epchan.blogspot.com/) 。一位物理學博士。曾經任職 IBM，後來進入金融領域，在知名投資銀行與避險基金工作。現在則自己成立了 PredictNow.ai 這個金融 SaaS 服務。 作者在書籍的編排上刻意地略過許多艱澀數學，用較為淺顯的方式說明量化交易所會需要面對的問題以及解決方式。像是該如何尋找策略、驗證策略、風險控管等重要議題。

對於像我一樣完全不暸解量化交易的人來說，這是一本很好的入門書，看完後對於量化交易可以有一個全面的認識。而且看得出書中所介紹的方法、技術背後都有嚴謹的數學在支持。照這本書的目標設定來說，看完之後就能夠直接開始執行量化交易。

這本書也有一些缺點。首先是數學，雖然解釋上沒有用大量數學，但是作者時不時會丟出一些數學式子，也沒解釋。讀者只能從前後文來理解作者所傳達觀念是什麼。另一個問題是他的程式範例不僅排版糟糕，說明還「非常」不詳盡，需要花不少時間去理解。

## 一般人真的能當個獨立的量化交易者？

當初在開始看這本書之前，其實根本沒打算利用這本書中的技術來交易，單純是想了解量化交易是什麼，看看能有什麼啟發。畢盡一般印象中從事量化交易的都是博士，數學底子深厚，而且不是單打獨鬥。一般人是要怎麼跟他們競爭呢？

作者以他多年的交易經驗，告訴我們其實只要善加利用現成資源與技術，我們也可以辦得到。策略不需要自己發想，微調現成策略就可以有不錯的表現。而且複雜的模型不見得好用，會有 Data-Snooping Bias，反而是簡單策略有效。作者也直接給我們各種技術的應用方式，稍微理解概念，在正確的時機使用就可以了。

另一方面，大型機構所管理的資金規模比較大，這使得他們必須放棄許多表現不錯但胃納量不高的策略。而且在避險基金中的交易員不像獨立交易者一樣自由，可能會受到公司各種合理或不合理的限制。因此獨立交易者還是有足夠的生存空間。

## 有系統的管理資金，控制風險

作者在書中問了一個問題，他說：「有一支股票每分鐘都有 50% 的機率上漲 1%，也有 50% 的機率下跌 1%。如果我們買了這支股票，長期來說，我們會賺、會賠還是持平？」。如果你回答「持平」，那你也跟多數人一樣低估了風險的危害，其實在這筆投資上我們會一直賠錢。既然風險對於我們長期的財富累積有負面的影響，那我們就該處理它。

作者首先提出了一個觀念，為了最大化長期財富的累積，必須避免資產歸零（甚至變成負的）的情況發生。接著作者介紹了連續型的 Kelly Formula（[為什麼用連續型](https://youtu.be/u9YWDD9yc-8?si=Td8VS-1EEfb6mdyG&t=1752)），並用它來計算最佳的槓桿倍數、分配資金。只要定期 rebalance，就可以做到風險管理（賠錢的策略降低槓桿，賺錢的部位增加槓桿）。另外為了避免風險管理的效果過強，可以降低 Kelly 建議的槓桿倍數。

這邊細節很多，我覺得是書中最精彩的部分，可以搭配作者的演講一起閱讀。

`youtube: https://www.youtube.com/watch?v=u9YWDD9yc-8`

## 讀完之後的下一步

雖然知道書中的技術可以直接拿來應用，但總感覺光閱讀這本書沒有辦法很好的掌握書中介紹的技術。像是 Cointegration，書中在講 Mean-Reverting Strategy 的時候有提到這個概念，但也只是帶過去而已。可以理解講解這些東西不是這本書的重點，但讀者數學底子不夠的話看完後肯定都會跟我一樣存在不少疑惑。目前看起來大部分知識可以在計量經濟的課程中補齊，所以下一步會是先去學習一下計量經濟。目前看了一點 [Bruce Hansen's Econometrics](https://users.ssc.wisc.edu/~bhansen/econometrics/) 以及 [计量经济学入门教程](https://www.youtube.com/playlist?list=PLCEzQd4LfAhLTuJa89TPuy2nxeNF_GNVF)，前面部分跟臺北大學經濟系的高等統計、迴歸分析內容有大量重疊，所以我想預備知識應該不需要太多。