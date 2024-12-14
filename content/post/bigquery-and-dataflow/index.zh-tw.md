---
title: Podcast 資料處理筆記
date: 2024-06-23T10:59:11.480Z
tags:
  - podcast
  - dev
excerpt: 紀錄過去在處理 Podcast 資料上遇到的問題、解決問題的方式
---

處理資料能是用個常見的 Database，下個 SQL 整理一下資料就好了嗎？這個就要看我們資料量、用途是什麼。在實作之前，可能要先問：

1. 我們要處理的資料有多大？資料量很小的情況，不管什麼需求，一般的 RDBMS 都夠用。問題只會出現在資料量大的時候。
2. 這份資料是誰要使用？產生公司內部報表？要給資料科學家查詢？又或是要給一般使用者看的資料。對象不同，可接受的等待時間就會不同。在介面上，資料科學家可能等幾分鐘是可以接受的，但一般使用者絕對接受不了。

以 Podcast 產業來說，我們主要處理的資料會是節目的下載數、播放數 ([Podcast 產業介紹](http://localhost:3000/posts/podcast/))。這份資料我們同時會需要即時查詢、產生報表、提供給一般使用者看。所以有些資料在查詢的時候，我們能接受的處理時間非常的短。從使用者發送 HTTP 請求到返回資料，都要跟一般 API 返回的時間差不多。

我覺得我們實驗過的一些方法，可能也會是很多人會想到的做法。在這邊記錄一下為何一些做法不可行，以及我們最終的作法為何。

## BigQuery

如果有在使用 Google Analytics 或是有在用 Google Cloud，選用 BigQuery 來儲存、查詢原始追蹤數據是很直覺的做法。當初我們也是將原始的追蹤資料直接存進 BigQuery。（額外的小抱怨：後來因為其他工作的關係，也有使用過 Amazon Redshift，必須說 BigQuery 強大太多了。不管是維護的難易度、查詢的速度，BigQuery 都遠勝 Redshift。）

BigQuery 是一種 Column Oriented Database (Columnar Database)，有別於一般的 Postgres、MySQL 等 Row Oriented Database。資料儲存、查詢的方式不太相同，使得 Column Oriented Database 更適合做資料分析。（[Wiki 的說明淺顯易懂](https://zh.wikipedia.org/zh-tw/%E5%88%97%E5%BC%8F%E6%95%B0%E6%8D%AE%E5%BA%93)）BigQuery 不只是單純的 Columnar Database，我們在執行查詢的時候，他會將查詢發送給數萬台機器一起運算，最終集解過並回傳給我們。有些單純 SQL 做不到的事情，我們也可以撰寫 UDF (User-Defined Function) 來解決。

## 最早的實驗

一開始，我們定時將資料在 BigQuery 以小時 Aggregate（我們需要的最小單位是小時）。Aggregate 完後，存進 Database。每次執行，只會更新最近一小時的資料（Server 的追蹤數據不用管 Offline 的情況）。實際使用者查看報表時，我們再依據條件彙整出報表。

這個做法在節目數少的時候還堪用。但當節目數、單集數快速增長後，每小時新增的資料量也快速增長，查詢速度越來越慢。當時沒有相關經驗，不知道該如何解決，所以用暫時用 Cache 查詢結果的方式頂著用。但這無法解決根本問題，使用者第一次查詢時還是會很慢。另一個問題是，每小時需要寫入的資料不斷快速變多的情況下，資料庫寫入的速度也會越來越慢。

## 做些調整

既然在我們的 Database 有問題，那就把運算搬上 BigQuery。在 BigQuery 上以小時為單位 Rollup 原始資料，存進一個表內。這邊出現了一個問題，Column Oriented Database 不適合刪除、修改資料，雖然 BigQuery 有支援，但有些[限制](https://cloud.google.com/bigquery/docs/data-manipulation-language#limitations)。

在 Rollup 這部分，我們利用 BigQuery 的 [Wildcard Table](https://cloud.google.com/bigquery/docs/querying-wildcard-tables) 功能，以天分 Table。每小時更新時，只會更動到最新一天的 Table。我們將新的結果存進暫時的 Table，如果當天的 Table 已經存在，刪除他，最後將新 Table 改名成我們一般在使用的 Table 名稱。

Rollup 這段沒有問題了，但查詢的部分呢？我們有兩種選擇:

1. 使用者查詢時，即時查詢 BigQuery。不可行
   1. BigQuery 有查詢限制
   2. 速度不允許。雖然 BigQuery 相對於 OLTP 作法快很多，但還是要個幾秒鐘。一般使用者不會接受。
   3. 費用，BigQuery 是看查詢的資料量計費。每次查詢都要付費。
   4. Cache 不行嗎？第一次查詢還是慢
2. 預先算好報表，將結果存進 Database。

經過研究後，覺得 BigQuery 不適合一般使用者查詢，所以採用第二種做法。查詢、計算、寫入資料庫的速度都大幅提升。

## 還可以更好

計算速度是提升不少沒錯，但在研究的過程中發現了 HyperLogLog 這個演算法似乎可以大幅提升運算效率，而且滿適合我們的使用場景。稍微有點查詢資料庫經驗的話，應該會知道 `count distinct` 在運算上比較耗資源，執行速度慢。因為在運算過程中，需要儲存，並剔除重複。而 HyperLogLog 是透過機率來計估算近似的數字，不是實際算出不重複的數量，因此可以大幅減少資源的使用，提升速度。另一個優點是，這個算法可以將資料分割，分別計算後再合併。可以有效利用分散式運算提升效率，也方便我們 Rollup 資料。

推薦閱讀這篇文章來了解大致的概念：[探索 HyperLogLog 算法（含 Java 实现）](https://dqyuan.top/2018/08/22/hyperloglog.html)。

> 感謝 ChatGPT。把原始論文丟給 GTP，接著就可以針對不懂的地方提出問題，節省理解概念的時間。

## 情況變複雜

當報表類型不斷增加，我們原本的 Rollup 方式會變得沒有效率。所以開始對 Rollup 方式做優化。我們依據不同需求，Rollup 出不同的表，再從這些表產出報表。節省成本，又提升速度。

另一點比較重要的是，有些資料已經不是單純透過 UDF 就可以方便計算出來的。開始需要在 Rollup 前先 Transform 原始資料。這部分必須透過 BigQuery 以外的工具來達成。後來我們選用了一樣由 Google 提供的 Dataflow 這個服務。

## Dataflow

使用 Dataflow，就會遇到 Apache Beam。Dataflow 是一個 Execution Engine，是一個由 Google 提供的服務，類似於 Apache Flink、Apache Spark。Apache Beam 則是一套定義 Data Pipeline 的工具。我們用 Apache Beam 定義好 Pipeline 後，可以讓 Dataflow 來執行，也可以讓其他的 Execution Engine 執行。

我們定義了兩個步驟，1. Filter、Transform，2. Filter、Rollup、Aggregate 並產出報表。分兩個 Job 執行。這邊都是採用 Batch 的方式處理資料，不使用 Stream，因為沒這個必要。而且我們還有 GA 的資料需要處理，兩邊統一作法比較好管理。

第一步驟比較單純。從 BigQuery 撈出資料後，從 User-Agent、IP，判斷出 Podcast 聽眾的資訊，並過濾掉機器人的請求。最後寫回另一個 BigQuery Table。

第二步驟，稍微複雜一點。從 BigQuery 撈出資料後，會依據 [iab 指引](https://iabtechlab.com/standards/podcast-measurement-guidelines/) 過濾資料。像是用 ["Window"](https://pavankumarkattamuri.medium.com/windowing-in-cloud-dataflow-fixed-sliding-session-becda3b12bbd) 來過濾短時間內重複的音檔下載請求。過濾完成後，依據報表需求，分別用不同條件 Rollup 資料。各個 Rollup 完的資料，再各自依據需求產出不同的報表內容。最後寫回 Postgres。

在 Dataflow 後台會看類似下圖的畫面。可惜沒辦法放上當初後台上看到的畫面，看到畫面會比較有感覺。報表越多，  分枝就會越多。

[![](./dataflow.png)_Dataflow job graphs_](https://cloud.google.com/dataflow/docs/guides/job-graph)

## 其他小事情

### 何時 Join Dimensional Table

最初，系統全部是外包團隊開發。功能不完善的時候，我們的 Podcast Player 並沒有 Indexer。節目報表是用節目、單集名稱 Aggregate。可想而知，當名稱修改後，整個資料就壞掉了。

要解決這個問題，必須要決定在哪裡去 Join 節目當前資訊。當初有嘗試過用 BigQuery 的 External table，但效能真的很糟。又再嘗試把節目資料 Sync 到 BigQuery，但 Columnar Database 不適合更新內容，使用上會有些限制，而且維護起來麻煩。最重要的是，因為最後我們是定時將報表算好，存進 Database，如果在 BigQuery Join 資料，使用者有可看到過時的資料。所以最後我們是在使用者查詢資料時，在 Postgres Join Dimensional Tables。

## 補充資料

- [Star Schema in Data Warehouse modeling](https://www.geeksforgeeks.org/star-schema-in-data-warehouse-modeling/)
- [探索 HyperLogLog 算法（含 Java 实现）](https://dqyuan.top/2018/08/22/hyperloglog.html)
