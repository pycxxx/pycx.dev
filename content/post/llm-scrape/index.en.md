+++
date = '2024-12-08T16:21:30+08:00'
title = 'A Small Experiment with Web Scraping Using LLMs'
tags = ['dev', 'ai', 'llm']
+++

Before leaving my previous job, we began discussing how to apply LLMs to our product.
We wanted to add a chatbot to our foodies' social media app, allowing users to ask for restaurant recommendations.
Basically, it's a simple RAG (Retrieval-Augmented Generation) application.

Unfortunately, I didn’t get the chance to participate in the project as I left the job shortly after.
This led me to consider conducting some small experiments with LLMs.
I wanted the experiment to strike a balance: not overly common, like applying RAG to local documentation, but also not so complex that it would be too time-consuming.
After a few days of thinking, I came up with an idea: applying LLMs to web scraping.

I searched the topic on the internet and found that many people have similar thoughts about it:

- Web page structures change frequently, making LLMs a good approach for web scraping.
- However, if we use LLMs every time we scrape web content, the process will be slow, and the cost will be high. It's better to use LLMs to generate scraping programs and then use the generated programs to scrape web content.

In this experiment, I only completed the first part. I plan to find time to work on the second part later.

## Related Projects Worth Exploring

Before I started my experiment, I found some projects related to this topic. Some of them are not stable yet and have a few bugs, but they are still worth keeping an eye on.

### [ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai)

This is an online service as well as an open-source project. What they are trying to achieve is exactly what I want to accomplish.
However, the open-source version has some issues with Ollama, and the results are not quite satisfactory. For example, when scraping an article list from Hacker News, it misses a few articles in the output.

### [Crawl4AI](https://github.com/unclecode/crawl4ai)

This project aims to convert web content into an easy-to-use format for LLMs, such as Markdown. It can also use LLMs to extract information directly, but the output is not very satisfactory.

### [LlamaIndex](https://www.llamaindex.ai/)

When implementing RAG or other types of LLM applications, we need to handle many tedious tasks, such as chunking and embedding.
LlamaIndex provides abstract interfaces and implementations to simplify these tasks, allowing us to focus on application development.

## Implementation note

At the start of the experiment, I needed to choose a programming language. Naturally, I opted for Python.
There are more LLM libraries in the Python ecosystem.
I get markdown format of web pages through Crawl4AI, pass the content to LlamaIndex, and use LlamaIndex to extract structured information.

My goal is to extract an article list from [Hacker News](https://news.ycombinator.com/). Extracting a list of URLs is a common requirement for web scraping, so I chose this as my goal.

The main tasks to handle are:

Retrieving web content in a format that is easy for LLMs to process (thanks to Crawl4AI).

- Dividing the web content into chunks.
- Attempting to extract article lists from each chunk.
- Merging the results returned from each chunk.
- Ensuring that the returned data meets the required format (if the format is inconsistent, it will be difficult to use the data in subsequent applications).

Source Code: [GitHub](https://github.com/pycxxx/experiments/tree/main/llmscrape)

### Chunking

LlamaIndex’s default behavior automatically divides large content into smaller chunks, so there’s no need to explicitly use a Splitter. For more precise chunking, you can use the `MarkdownNodeParser`, which ignores code blocks and splits based on headers. (However, for the Hacker News webpage, the `MarkdownNodeParser` is not helpful because of its simple structure.)

### Extract article lists

LlamaIndex examples often showcase `VectorStoreIndex`, but that’s not what we need since we’re not building a RAG application. A more suitable choice is `SummaryIndex`, which sends each chunk along with the prompt and query to the LLM, then merges the results.

When creating a query engine, there is a parameter called `response_synthesizer` that can be specified. If it’s not set, the default `Synthesizer` is generated based on the `response_mode`.

I created a custom `Synthesizer` for these reasons:

- To modify the prompt more flexibly (although prompts can also be updated via the query engine’s `update_prompts`, it’s less versatile).
- To check and correct the format of the extracted data after processing each chunk.
- To use custom logic to merge the extracted article lists before returning the final result.

Source Code: [structured_accumulate.py](https://github.com/pycxxx/experiments/blob/main/llmscrape/scrapper/structured_accumulate.py)

### Structured output

Since our goal is to extract data, the temperature must be set to `0.0` to ensure the LLM doesn’t generate any unnecessary content. The article titles and links should exactly match the information from the original webpage.

The tricky part is ensuring that the returned JSON format matches the expected format.
LlamaIndex provides some simple and convenient methods for this, but perhaps due to the model I’m using (`llama3.2:3b`), there are always issues during execution, and it almost always throws an error.

To address this, I referred to one of the workflow examples in LlamaIndex ([Reflection Workflow for Structured Outputs](https://docs.llamaindex.ai/en/stable/examples/workflow/reflection/)).
After extracting the content, I use this workflow to validate the JSON format. If any issues are detected, the validation errors and the previous output are fed back into the LLM, prompting it to correct the mistakes. This process continues iteratively until the output meets the required format or the maximum number of retries is reached.

Source Code: [reflection_workflow.py](https://github.com/pycxxx/experiments/blob/main/llmscrape/scrapper/reflection_workflow.py)

### Future Plans

1. The output is generally satisfactory, but there’s some uncertainty about whether the segmentation might cause article titles or links to be truncated. A solution needs to be devised to address this issue.
2. Once the correct result is obtained, we need to figure out how to generate a BeautifulSoup4 extraction script to avoid calling the LLM every time it is executed.
