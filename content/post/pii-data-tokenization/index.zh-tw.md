+++
date = '2024-12-14T14:03:30+08:00'
title = '資料安全 - PII Data Tokenization'
tags = ['security', 'dev']
+++

最近公司在做 PII (Personally Identifiable Information) Data 的處理方式的更新，引入了 PII Data Tokenization 的方法，有幸參與到其中一小部分。
因為過去工作經驗主要是在比較早期的新創公司，比較沒這麼在乎資料安全問題，所以這對我來說是個很特別的經驗。

### Tokenization

以最常見的 User Table 來說，最簡單粗暴的方式是將所有用戶都資料都存在這個 Table 內，包含姓名、Email、手機等個人資料。這樣的問題在於，當 DB 被攻陷時，所有的使用者資料都會外洩。那不是用對稱式加密就好了嗎？你可能會這樣想（我第一時間也是這樣想）。但不是的，用了對稱式加密後，要怎麼確保資料不重複？怎麼保管 Key？每個 User 都有自己的 Key？這會衍生出很多麻煩的問題。而且如果是要加強現有系統的資料安全性，採用對稱是加密的改動會非常巨大。

因此，Tokenization 技術就顯得重要。粗略地來說，我們會有一個 Token Service，負責 Tokenize、Detokenize 還有保存資料。DB 的 Schema 不需要改變，只是儲存的資料從原來的原始資料，改成了 Token Service 處理過後的 Token。當需要使用 PII Data 時，在從 Token Service 取得原始資料。因為 Tokenize/Detokenize 的時機是很好判斷的（寫入 DB 前、讀取時），所以有些工具是在 DB、Application 之間做手腳，讓整個導入過程無感，幾乎不需要改任何程式碼邏輯。而且 PII Data 是存在另一個地方，所以可以針對儲存 PII Data 的 DB 加強安全性，方便控管。

#### 區分 Data Type

我們公司會區分 PII Data Type，姓名、Email、手機都是不同 Type，每個 Type 會的資料會存在不同的地方（Vault）。當其中一個 Vault 被攻陷時，只有特定 Type 的資料會洩漏，不會影響其他 Vault。除了不會洩漏其他資料外，洩漏出去的資料也比較難被利用。舉例來說，我們的生日資料外洩了，破解的人拿到了生日資料，但他不知道生日是誰的生日，所以對他而言他就只是拿到一大串的日期而已。

#### ACL

有了 Data Type 後，我們更進一步限制存取權限。不是每個 Service 都可以拿到所有 PII Data，如果某個 Service 只需要顯示使用者名稱，那他就只能要求 Token Service 去 Detokenzie 使用者名稱。當我們有上百個 Service 的時候，這可以大大提高資料安全性。以使用者名稱來說，通常是負責 Render UI 的那個 Service 才會需要用到，中間所有 Service 都只拿得到 Token。

#### Unique Key

前面有提到，採用 Tokenization 技術時，不需要改 DB Schema，也不需要改什麼程式邏輯。那要怎麼讓原來有 Unique Key 的欄位不會失效？
這就要靠 Deterministic Token，只要輸入資料是一樣的，得到的 Token 也會是一樣的。方便於應用到 Unique 欄位，但安全性較低。
一般的 Token 則是 Nondeterministic Token，每次得到的 Token 都不會相同，安全性較高。

### 開源專案

做 Tokenization 的服務不少，但大部分是付費服務，Open Source 工具非常少。

- [Hashicrop Vault](https://developer.hashicorp.com/vault/tutorials/encryption-as-a-service/tokenization) - Hashicrop Vault 的 Open Source 版本也沒有這個功能，只有 Enterprise 版本有，看文件感覺滿完整的，不知道為什麼我們公司沒直接用這個，而是自己寫。
- [Acra](https://github.com/cossacklabs/acra) - 這是唯一一個我有找到的 Open Source 的解決方案。缺點是文件不是很完整，網路上也缺少介紹的資源，我自己花了點時間才試成功。可以參考[我的 docker 設定、Node.js 程式碼](https://github.com/pycxxx/experiments/tree/main/vault)。
