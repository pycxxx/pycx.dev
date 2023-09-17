---
title: Quantitative Trading - 範例 3.7
description: 閱讀 Quantitative Trading (Ernest Chan) 範例 3.7 的紀錄
date: '2023-09-17T09:36:51.663Z'
featuredImage: ./featured.avif
featuredImageAuthor:
  name: Alexander Mils
  url: https://unsplash.com/photos/lCPhGxs7pww
category: Reading
tags:
  - Trading
---

這是閱讀 [Quantitative Trading](https://www.amazon.com/Quantitative-Trading-Build-Algorithmic-Business/dp/1119800064) 書中範例 3.7 的紀錄。

書上對策略的說明過於簡略，提供的文章網址也是錯誤的，書中提到的文章是 [What Happened To The Quants
In August 2007?](/files/what_happened_to_the_quants_in_august_2007.pdf)。

策略是空前一天的股價贏過市場平均的股票，多前一天股價低於市場平均的股票，就是在賭股價會均值回歸。

$$$
w_{it} = - \frac{1}{N} (R_{it-k} - R_{mt-k}), R_{mt-k} \equiv \frac{1}{N} \sum_{i=1}^{N} R_{it-k}
$$$

$R_{mt-k}$ 就是書中寫的 Daily Market Return，也就是將每日每支股票的報酬率平均。$R_{mt-k}$ 對應的 Python 程式碼：

```python
# df 是一個 table 紀錄當時 S&P 500 的成分股股價
# 每個 column 是一支股票
dailyret = df.pct_change()
marketDailyret = dailyret.mean(axis=1)
```

因為我們是依據前一天的股價表現來決定要如何分配資金，所以 $k = 1$。有負號是因為表顯優於市場的要買出。（目前還沒想到 $\frac{1}{N}$ 的意義是什麼，這個在書中直接被拿掉，因為計算過程中會被消掉）

$$$
I_t \equiv \frac{1}{2}\sum_{i=1}^{N}|w_{it}|
$$$

$$$
R_{pt} \equiv \frac{\sum_{i=1}^{N}w_{it}R_{it}}{I_t}
$$$

範例可能是因為沒考慮槓桿因素，所以實際計算的是 $I_t \equiv \sum_{i=1}^{N}|w_{it}|$。也就是範例中的

```python
wtsum = np.nansum(abs(weights), axis=1)
```

範例中 Daily Return 計算的程式碼如下

```python{numberLines: true}
# 與 august07 文章相比少了 1/N
weights = -(np.array(dailyret) - np.array(marketDailyret).reshape((dailyret.shape[0], 1)))
# I_{t}
wtsum = np.nansum(abs(weights), axis=1)
# 有可能 weight 是 nan，nan 時候 wtsum 是 0
weights[wtsum == 0,] = 0
# 不能除以 0，什麼值其實都沒差，因為 weight 會是 0，讓後續計算結果也是 0
wtsum[wtsum == 0] = 1
# 開始在計算 R_{pt} 了
# 第一行如果有 1/N 的話，在這邊其實分子分母都會有 1/N，可消掉
weights = weights / wtsum.reshape((dailyret.shape[0],1))
# 這邊會需要 shift 是因為先前計算沒做這件事情（w_{it} 的式子裡的 t-k）
dailypnl=np.nansum(np.array(pd.DataFrame(weights).shift()) * np.array(dailyret), axis=1)
# 計算完 R_{pt} 後，filter 出我們要的時間範圍
dailypnl=dailypnl[np.logical_and(df.index >= startDate, df.index <= endDate)]
```
接著跟之前一樣，先算 Daily 的 Sharpe Ratio，再轉換成 Annualized Sharpe Ratio。

```python
sharpeRatio = np.sqrt(252) * np.mean(dailypnl) / np.std(dailypnl)
```

扣掉交易成本的計算方式還滿好理解的，很直白的扣掉了交易成本

```python
dailypnlminustcost = dailypnl - (np.nansum(abs(weights - np.array(pd.DataFrame(weights).shift())), axis=1) * onewaytcost)
```

範例到這邊就結束了，但是 august07 文章內還有介紹槓桿等一些延伸的內容，等書讀完了再回頭來看看。