---
title: 字體切片的方式
date: 2024-06-23T11:33:51.185Z
tags:
  - dev
  - fontend
excerpt: 介紹一下目前 web font subset 技術
---

中日韓的字體過大，不適合放在網站上，這應該是所有人都理解的事情。但解決方法是什麼？靜態網頁很好解決，在 build 的時候，判斷有哪些文字有被使用到，讓字體只包含這些文字就好了。那動態網頁呢？過去些作法類似於靜態網頁，在網頁載入時動態產生字體檔案。但最近偶然發現 Google Fonts 不是這樣做，覺得很有趣，做個研究紀錄。

## 字體 Subset

一個字體檔案內，被區分成很多 Table。有的紀錄每個文字資料存放的位置，有的紀錄文字的形狀，有些則是存針對小螢幕裝置優化的規則。Subset 的概念就是讀取字體檔案，依據需要的文字，從各個 Table 找出所需資料，重寫這些 Table，最後輸出一個比較小的字體檔案。目前有很多工具可以協助我們做到這些事情，例如 [fonttools](https://github.com/fonttools/fonttools)。大部分靜態網站生成工具也都可以找到相關的 Plugin。

## 動態 Subset

一般 Subset 工具都需要預先知道我們需要哪些字體，這對於動態網站來說有點麻煩。如果說要在內容發布時產生字體檔案，那又很難做出一個一般性的工具讓任何網站都能使用，必須跟內容發布有比較深入的整合。有些人想到可以利用 JavaScipt 來解決這個尷尬的情況。

當 Browser 打開網頁時，JS 會偵測網頁內容，將所有用到的文字丟給負責 Subset 字體的服務。這個作法有些麻煩的點：

1. 必須等待網頁載入完成，開始執行 JS 後，才能請後端服務 Subset 並下載字體。
2. 對後端的要求較高。開始下載字體的時間已經延遲了，還必須要 Subset 字體。所以後端 Subset 的速度必須要非常快，不然會影響使用者體驗。
3. 無法 Preload 字體。

## 字體切片

Google Fonts 採取完全不同的思路，他們將字體切片成很多小的檔案，利用當時新的 css 特性 `unicode-range` 來載入有用到的字體檔案。最早，這項技術用於韓文字體，嘗試透過分析出各個文字之間的相關程度，以此去切片字體。他們希望可以找到一個最佳的接片方式，讓下載的資料量最小，但又不會發送太多 HTTP 請求（[Google Fonts launches Korean support](https://web.archive.org/web/20231206043303/https://developers.googleblog.com/2018/04/google-fonts-launches-korean-support.html)）。

在發布他們研究韓文字體成果的幾個月後，Google Fonts 發布了另一篇文章，介紹了他們研究日文字體後的一些新成果。在研究日文字體的過程中，他們發現日韓字體常用的字其實不多，所以他們改以文字出現的頻率為依據來將字體切片。另一個重要的發現是，支援 `unicode-range` 等新技術的 Browser 同時也支援 HTTP/2，HTTP/2 可以並行傳送多個小檔案，不會像以前需要考慮請求的數量影響網頁載入效能。所以他們可以不用擔心切片數量，將優化的焦點集中在如何減少傳輸的資料量（[Google Fonts launches Japanese support](https://web.archive.org/web/20240223011828/https://developers.googleblog.com/2018/09/google-fonts-launches-japanese-support.html)）。

這種作法幾個好處：

1. 跨網站 Cache。使用者瀏覽了某個 Google Fonts 的網站後，他的 Browser 會 Cache 住字體檔。當同個使用者在造訪另一個同樣使用 Google Fonts 的網站時，他不需要再次下載檔案。
2. 利用 Browser 特性，不需要額外的 JS 才能運作。不需等待 JS 執行。
3. 如果不是使用 Google Fonts 等服務，我們可以 Preload 常用的字體切片。（但這樣就失去了 1 的優勢）

Google Fonts 的問題：

1. 2022 年，有人因使用 Google Fonts 被罰，因為違反 GDPR。法院建議自己 host 字體檔案。（[Leak of IP Address Via Google Fonts Prompts GDPR Fine](https://www.cpomagazine.com/data-protection/leak-of-ip-address-via-google-fonts-prompts-gdpr-fine/)）
2. 無法使用自己的字體。

## 對任何字體做切片

有時候，我們可能會想要使用一些 Google Fonts 或其他服務沒有的字體，這時候就必須想辦法自己處理 Web font。因為前面提到的一些問題，我們不太可能採用動態 Subset 字體的方式，處理起來太麻煩，速度也不快。比較簡單的做法是，利用 Google Fonts 的成果來切片字體，這樣可以達到跟 Google Fonts 類似的效果。

那我們要怎麼得到文字的使用頻率呢？其實我們不需要知道，直接參考 Google Fonts 提供的 CSS 檔案，我們就可已知道 Google 對各語言字體的切片方式。麻煩的事情 Google 處理掉了，我們只需要負責切片、產生 CSS 檔案就好了。

細節直接看程式碼比較清楚：[pycxx/fontina](https://github.com/pycxxx/fontina)

## 補充

- [Subsetting Web Fonts](https://support.monotype.com/en/articles/7859214-subsetting-web-fonts)：Monotype 也採用類似 Google Fonts 的作法
- [unicode-range](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/unicode-range)
