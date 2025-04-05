+++
date = '2025-03-30T22:20:22+08:00'
title = '網站爬蟲'
+++

大多數網站可能只採用了簡單的防爬機制，甚至完全沒有防護，或者你的爬取量不大。這種情況下，其實不需要做太多處理，直接使用一些瀏覽器自動化工具就可以了。但如果目標網站的防護非常嚴密，而我們又需要大量抓取內容時，就必須做一些額外處理。

**這篇文章的內容，其實在其他地方也查得到，只是做個紀錄，不會有針對特定網站的說明。**

## 介紹

為了抓取網站或服務的內容，爬蟲可能會模擬一般使用者訪問網站或 App，也可能透過逆向工程找出 API 的使用方式，直接打 API 來獲取資料。後者需要投入大量時間針對特定網站進行研究，相對麻煩；前者則比較通用。

網站當然不會輕易讓我們抓資料，通常會有以下幾種防護機制：

1. 辨識出大量訪問的使用者，並限制這些異常行為
2. 根據爬蟲特徵阻擋訪問

## Fingerprint

要辨識出哪些使用者很長訪問網站，那就要先能夠辨別哪些請求來自同一個使用者。Fingerprint 是目前最常用來辨識使用者的方式。網站會透過偵測使用者的 IP、作業系統、瀏覽器版本等資訊，來判斷請求是否來自同一個人。像是 [fingerprint.js](https://demo.fingerprint.com/playground) 就是提供這種功能的工具。

fingerprint.js 會透過 HTTP Headers 和 JavaScript 收集各種資訊，稱為 Fingerprint Data Points。這些資料除了用來計算出唯一 ID，也會用來比對使用者是否有試圖竄改或隱藏 Fingerprint 的行為。例如 HTTP Header 顯示使用的是 Mac，但某些字體資訊卻顯示為 Windows 預設字體；又或者透過 Proxy 訪問網站，網站偵測到的 IP 和 WebRTC 偵測到的 IP 不一致（[WebRTC Leak](https://www.security.org/vpn/webrtc-leak/)）。

為了避免被偵測出來，發展出了很多技術。

### 分析

雖然我們可以直接使用現成工具修改各種 Data Point，但當網站使用了不常見的 Data Point，或懷疑某個 Data Point 品質不佳，就需要手動分析網站到底使用了哪些資訊。如果我們檢測出某個產生出來的 Data Point 有問題，但是目標網站根本沒有用到，那我們可以直接忽略，不需要花時間修正。

我比較推薦的工具是 [visiblev8](https://github.com/wspr-ncsu/visiblev8)，可以詳細記錄網站使用到的 JavaScript API。有時候也會 debundle、deobfuscation，找出網站用到的 Data Point。我建議是透過 visiblev8，日子會比較好過一點。以下是 visiblev8 的 log 的範例。

```
g1980:{603865,Window}:"navigator"
g1990:{723022,Navigator}:"userAgent"
g2191:{603865,Window}:"navigator"
g2201:{723022,Navigator}:"serviceWorker"
c2201:%get serviceWorker:{723022,Navigator}
g2215:{726227,ServiceWorkerContainer}:"register"
c2215:%register:{726227,ServiceWorkerContainer}:{256830,TrustedScriptURL}:{195846,scope\:"/static/service_worker",updateViaCache\:"all"}
g2376:{603865,Window}:"navigator"
g2386:{723022,Navigator}:"serviceWorker"
c2386:%get serviceWorker:{723022,Navigator}
g2400:{726227,ServiceWorkerContainer}:"addEventListener"
c2400:%addEventListener:{726227,ServiceWorkerContainer}:"message":<anonymous>
g3139:{603865,Window}:"addEventListener"
c3139:%addEventListener:{603865,Window}:"message":<anonymous>
g2252:{603865,Window}:"navigator"
g2262:{723022,Navigator}:"serviceWorker"
c2262:%get serviceWorker:{723022,Navigator}
g2276:{726227,ServiceWorkerContainer}:"ready"
g2297:{722945,ServiceWorkerRegistration}:"active"
g3212:{20541,MessageEvent}:"origin"
g3249:{115630,ServiceWorker}:"postMessage"
g3263:{20541,MessageEvent}:"data"
```

### 產生

目前開源工具選擇不多，[fingerprint-suite](https://github.com/apify/fingerprint-suite) 是目前最常用的工具。Apify 透過他們的資料訓練一個模型用來產生接近於真實使用者的 Fingerprint。

### 注入

以下是兩種常見的方式：

1. 注入 JavaScript + CDP（Chrome DevTools Protocol）
2. Antidetect Browser：從底層修改瀏覽器（例如用 C++ 修改 Fingerprint）

開源的工具多半是第一種方式，很容易被偵測。例如透過 `defineProperty` 修改 `navigator` 的一些屬性，修改後 `Object.getOwnPropertyNames(navigator)` 會回傳被修改過的屬性名，正常來說要回傳空 Array。[fingerprint-suite](https://github.com/apify/fingerprint-suite) 的 Injector 採用的就是這種方式，因此在防護嚴密的網站上可能無法使用。

許多付費方案採用的是修改開源瀏覽器的方式。像 [Camoufox](https://github.com/daijro/camoufox) 就是其中一個（可能也是為一個）的開源 Antidetect Browser。[這裡](https://github.com/daijro/camoufox/blob/95cc4489d025471368412b035743bb59855b160e/patches/network-patches.patch#L29) 可以看到它直接修改 Firefox，並回傳假的 User-Agent。

在研究做法的時候，還有一種比較特別的方式。有個付費方案透過改 VM 的設定來改 Figerprint。還沒試過這種方式，因為替換 Figerprint 的成本會很高，不確定是否是個好主意。

## Browser Automation

目前主流的自動化瀏覽器工具有三種，實際使用哪一個差異不大：

- [Playwright](https://playwright.dev/)
- [Puppeteer](https://pptr.dev/)
- [Selenium](https://www.selenium.dev/)

唯一需要注意的是，每個工具都會有被偵測到的特徵，必須透過額外方法隱藏這些特徵。舉例來說，當我們使用 Playwright 的 `addInitScript()` 的時候，他會定義一個 `__pwInitScripts` 的全域變數。當網站偵測到這個全域變數的時候，就可以直接判定這次網頁訪問不是來自真實的使用者。

常見的隱匿工具：

- [Rebrowser](https://github.com/rebrowser/rebrowser-patches)
- [puppeteer-extra-plugin-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth)
- [puppeteer-real-browser](https://github.com/ZFC-Digital/puppeteer-real-browser)

我自己測試起來 Rebrowser 直接使用還是會被偵測到，需要參考 puppeteer-real-browser 的做法來使用（沒錯，他也用了 Rebrowser）。

## IP Rotation

IP 代理的部分沒什麼太多好說的，重點就是找到一個穩定且品質高的 IP Provider，在爬取過程中不斷更換 IP。需要注意：

- 每個 IP 請求時間的間隔、一定時間內的請求次數
- geolocation 設定跟 IP 的位置是相符的

## 檢測工具

- https://abrahamjuliot.github.io/creepjs/ - 這個很嚴格，不見得他的每個檢測都會需要通過
- https://demo.fingerprint.com/playground
- https://browserleaks.com/
