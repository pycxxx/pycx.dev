+++
date = '2025-03-22T17:19:12+08:00'
draft = true
title = 'Mediapipe LLM Inference on the Web'
tags = ['dev']
+++

Mediapipe LLM Inference is developed by Google and allows us to use small LLM models on the client side.  
I'm curious about its performance on the web and whether I can integrate it into my personal projects.

Here are some key aspects I want to evaluate:

1. The size of models that can be used with Mediapipe
2. The time required to load a model
3. The response time for answering questions uestions

## How large are the models that can be used with Mediapipe?

Google recommends the Gemma2-2b model, which is approximately 2.45GB. This is quite large for web applications, but if the model can be stored on the client side, it should be acceptable.

For storing large files, we can use the [Origin Private File System](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system). Here’s an example of how to do it:

```js
const modelUrl = "<model url>";
const opfsRoot = await navigator.storage.getDirectory();
const handle = await opfsRoot.getFileHandle("gemma2-2b", { create: true });
const writable = await handle.createWritable();
const res = await fetch(modelUrl);
await res.body.pipeTo(writable);
```

## How long does it take to load a model?

Let's assume the model has already been downloaded. Loading the Gemma2-2b model takes about 4 seconds, which is faster than I expected. However, loading a model may block the UI, so it's better to run Mediapipe in a web worker.

If you follow Google's example, you might find that the Mediapipe library cannot be loaded in a web worker.

Here’s a workaround:

```js
// copy genai_bundle.cjs from @mediapipe/tasks-genai to the public folder and rename it to genai_bundle.js.
self.exports = {};
importScripts("/mediapipe/genai_bundle.js");
const { FilesetResolver, LlmInference } = self.exports;
```

## How long does it take to respond to my questions?

The response time is quite fast. For simple questions, it only takes about 1 second to generate a response.

## The recorded experiment on my M2 MacBook Air

{{< video-js src="./video.mp4" >}}

## Conclusion

The performance is acceptable in certain scenarios, especially when used in browser extensions or Electron apps.
Maybe I'll use it to create an idle game in the near future.
