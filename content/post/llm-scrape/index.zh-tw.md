+++
date = '2024-12-08T16:21:30+08:00'
title = 'LLM 爬取網頁的小嘗試'
tags = ['dev', 'ai', 'llm']
+++

前公司在我離職前開始有討論一些 LLM 在產品上的應用。
我們想要在一個美食討論的平台上，加上問答系統，依據使用者輸入的內容來推薦餐廳，基本上就是一個常見的 RAG 應用。
因為後來離職了，很遺憾沒有機會參與實作，於是就有了做個小實驗的想法。
自己做小實驗的話，感覺簡易的 RAG 比較無聊一點因為現有的工具完整，很快就能做出個小東西。所以我想了另一個題目：爬取網頁內容。

上網搜尋了下，發現大家在做這個題目時都有一些類似的想法：

1. 網頁的結構時常變化，LLM 似乎很適合應付這種情境，讓我們不需要一直改寫網頁爬蟲。
2. 如果每次爬取網頁時，都要透過 LLM，那費用肯定不便宜。可以用 LLM 去產生爬蟲程式，這樣的話，只有在產生程式的時候會使用到 LLM。

這一次嘗試，我只做到 1. 部分，產生程式的話有空會繼續試試看。

## 一些有趣的專案

在實際開始前，有找到一些有趣的專案，也有實際玩玩看。這些專案目前我看起來都還不是很穩定，bug 不少，但很值得持續關注。

### [ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai)

開源專案，也有付費的線上服務。有做到自動產生程式碼的功能，但是對 Ollama 的支援上有點問題。
在嘗試爬取 Hacker News 的文章列表時，偶爾會漏資料。但輸出的結構倒是很穩定。

### [Crawl4AI](https://github.com/unclecode/crawl4ai)

主要是協助我們抓網頁內容回來，並轉成 LLM 適合處理格式，像是 Markdown。
他也可以提取網頁內容並存到一個 object 內，但是我覺得效果不好。
所以我目前是單純用它來得到 Markdown 格式的網頁內容而已。

### [LlamaIndex](https://www.llamaindex.ai/)

從無到有實作 RAG 或是其他 LLM 應用，會需要自己處理很多繁雜的事情，例如將過大的文檔分塊，又或者是與 embedding 資料溝通的過程。
LlamaIndex 幫我定義好了一些抽象的介面，也提供了一些常見的實作，讓我們可以專注在應用開發上面。

## 實作紀錄

程式語言的選擇應該沒什麼疑義，就是用 Python，工具比較完整。透過 Crawl4AI 抓取 Mrakdown 格式的網頁內容，再利用 LlamaIndex 幫我提取結構化的網頁內容。
一般在爬網站的時候，主要會處理列表頁（像是 PTT 文章列表頁、591 房屋列表頁），還有列表中各個項目的頁面（像是 PTT 文章、591 房屋物件），我在實驗的時候就以提取 [Hacker News](https://news.ycombinator.com/) 文章列表頁內容為目標。

主要會處理的事情有：

1. 取得 LLM 方便處理的網頁內容（感謝 Crawl4AI）
2. 將網頁內容分塊
3. 針對每個分塊嘗試提取文章列表
4. 合併每個分塊回傳的結果
5. 確保返回的資料符合我要求的格式（格式如果很不穩定，後續很難拿這個資料來應用）

Source Code: [GitHub](https://github.com/pycxxx/experiments/tree/main/llmscrape)

### 網頁內容分塊

在 LlamaIndex 中，不需要特別使用 Splitter 去切 Document，預設的行為上就會將大內容切小塊了。可以使用 MarkdownNodeParser 來做比較精準的分塊，他會忽略 code block，再用 header 來分塊。（Hakcer News 網頁比較單純，MarkdownNodeParser 完全沒幫助）

### 對每個分塊嘗試提取文章列表

LlamaIndex 的範例比較常出現 VectorStoreIndex，但這不是我們要的，我們沒有要做 RAG。比較適合的是 SummaryIndex，他會將每個分塊 + prompt + 查詢丟給 LLM，再將結果合併。
在建立 query engine 的時候，有個 `response_synthesizer` 參數可以指定。沒有設定的話，會用 `response_mode` 去產生預設的 Synthesizer。
我是有寫一個 Custom 的 Synthesizer。
一方便修改 Prompt（也可以用 query engine 的 `update_prompts` 去修改，但比較不彈性）。
另一方面我想要在每個分塊執行完提取的資料的動作後，檢查並修正資料的格式。
在最終回傳結果前，我還會用自訂的邏輯去合併提取出來的文章列表。

Source Code: [structured_accumulate.py](https://github.com/pycxxx/experiments/blob/main/llmscrape/scrapper/structured_accumulate.py)

### 確保返回的格式正確

因為我們是要提取資料，所以 temperature 一定是設定成 `0.0`，不要讓 LLM 自己去亂創造內容。文章名稱、連結都需要跟原始的網頁內容的資料相同。
比較麻煩的是要確保回傳的 JSON 格式跟我期望的格式一致。
LlamaIndex 有提供一些簡單易用的方法，但是不知道是不是使用的模型的元因（`llama3.2:3b`），使用上始終都會有問題，每次執行幾乎都會噴 Error。
所以我參考了 LlamaIndex 其中一個 Workflow 範例的做法（[Reflection Workflow for Structured Outputs](https://docs.llamaindex.ai/en/stable/examples/workflow/reflection/)）。
每次提取完內容後，就利用這個 Workflow 去檢查 JSON 格式。當有問題時，就將檢查時發現的錯誤 + 前一個輸出的內容一起丟給 LLM，讓他嘗試修正錯誤，直到正確或超過容許的失敗次數為止。

Source Code: [reflection_workflow.py](https://github.com/pycxxx/experiments/blob/main/llmscrape/scrapper/reflection_workflow.py)

### 後續可以做的事情

1. 輸出結果大致是滿意的，但是不確定會不會因為分塊的關係，導致文章名稱或是連結被截斷。要想個方式來處理這個問題。
2. 有了正確的結果後，要想怎麼產生 BeautifulSoup4 的提取程式，避免每次執行都呼叫 LLM。
