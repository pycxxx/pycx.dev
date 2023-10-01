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

對於像我一樣完全不暸解量化交易的人來說，這是一本很好的入門書，看完後對於量化交易可以有一個比較全面的基本認識。而且看得出書中所介紹的方法、技術背後都有嚴謹的數學在支持。照這本書的目標設定來說，看完之後就能夠直接開始執行量化交易。

這本書也有一些缺點。首先是數學，雖然解釋上沒有用大量數學，但是作者時不時會丟出一些數學式子，也沒解釋。讀者只能從前後文來理解作者所傳達觀念是什麼。另一個問題是他的程式範例不僅排版糟糕，說明還「非常」不詳盡。像我自己是軟體開發者，我都覺得在這部分閱讀上會有一點阻礙，相信不熟程式的人在讀範例的時候應該會滿痛苦的。

## 一般人真的能當個獨立的量化交易者？

當初在開始看這本書之前，其實根本沒打算利用這本書中的技術來交易，單純是想了解量化交易是什麼，看看能有什麼啟發。畢盡一般印象中從事量化交易的都是博士，數學底子深厚，而且不是單打獨鬥。一般人是要怎麼跟他們競爭呢？

作者以他多年的交易經驗，告訴我們其實只要善加利用現成資源與技術，我們也可以辦得到。策略不需要自己發想，微調現成策略就可以有不錯的表現。而且複雜的模型不見得好用，會有 Overfitting 或是 Data-Snooping Bias 的問題，反而是簡單策略有效。作者也直接給我們各種技術的應用方式，稍微理解改念，在正確的時機使用就可以了。

另一方面，大型機構所管理的資金規模比較大，這使得他們必須放棄許多表現不錯但胃納量不高的策略。而且在避險基金中的交易員不像獨立交易者一樣自由，可能會受到公司各種合理或不合理的限制。因此獨立交易者還是有足夠的生存空間。

## 讀完之後的下一步

雖然知道書中的技術可以直接拿來應用，但總感覺光閱讀這本書沒有辦法很好的掌握書中介紹的技術。像是 Cointegration，書中在講 Mean-Reverting Strategy 的時候有提到這個概念，但也只是帶過去而已。可以理解講解這些東西不是這本書的重點，但讀者數學底子不夠的話看完後肯定都會存在不少疑惑。

個人認為覺得可能還是要再回去補補金融系、經濟系的數學課程，然後再讀作者的另一本書 ["Algorithmic Trading: Winning Strategies and Their Rationale"](amazon.com/Algorithmic-Trading-Winning-Strategies-Rationale/dp/1118460146) 之後，可能才能充分理解書中內容。
