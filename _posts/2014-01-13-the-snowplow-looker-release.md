---
layout: blog-post
shortenedlink: Snowplow 0.8.13 released
title: Snowplow 0.8.13 released - The Looker release
tags: snowplow analysis
author: Yali
category: Releases
---

We are very pleased to announce the release of Snowplow 0.8.13. This release makes it easy for Snowplow users to start analyzing their Snowplow data with [Looker] [looker], a next-generation BI tool that we are particularly excited about.

## What's so special about analyzing Snowplow data with Looker?

Snowplow makes it possible to analyze your granular, event-level data with any BI tool. So what's so special about Looker?

In a nutshell, Looker makes it fast and simple for people with no SQL knowledge to explore Snowplow data via a convenient web UI. We've gone into detail about why Looker is so well suited to analyzing Snowplow data in the following two blog posts:

1. [Introducing Looker - a fresh approach to Business intelligence that works beautifully with Snowplow] [blog-post-1]
2. [Five things that make anazlying Snowplow data in Looker an absolute pleasure] [blog-post-2]

<!--more-->

## What does the Looker metadata model deliver?

By loading the metadata model into Looker, you immediately have:

#### 1. The ability to slice / dice Snowplow data across a wide range of dimensions and metrics via the Looker query interface

The model includes a large number of metrics and dimensions - the screenshot below illustrates just *some* of the metrics available:

![list-of-metrics] [img-1] 


#### 2. The ability to zoom up to visitor-level, country-level, channel level analysis or down to transaction-level, event-level data seamlessly

The model makes it easy to zoom up to view country-level, channel level data e.g.:

![zoom-up] [img-2] 

And to drill down to individual event-level data, e.g. so that we can view the event stream for a particular visitor over time:

![drill-down] [img-3]

#### 3. Quick-start dashboards

The model includes a general-purpose dashboard for reporting on the last 7 days:

[7-days-dashboard-quickstart] [img-4]

And a general purpose dashboard for reporting on the last 6 months:

[6-months-dashboard-quickstart] [img-5]

#### 4. A solid basis to extend the model to encompass your own business-specific and product-specific events, dimensions and metrics

The purpose of the model is to get you started using Looker on top of Snowplow. One of the best things about Looker is that the metadata model is easy to extend: we hope that you extend it to incorporate:

1. Events that are specific to your website / business
2. Dimensions that are specific to  your website / business (e.g. audience segments or stages in funnels)
3. Metrics that are specific to your website / business

## Using the model

If you have a Looker trial setup for you by either the Looker or Snowplow teams, they should be able to install the model for you.

If you are setting up Looker for yourself (or you already have Looker setup and want to incorporate the model), instructions on doing so can be found [on our setup guide / wiki] [looker-setup-guide].

Over time we plan to add Looker-specific recipes to our [Analytics Cookbook] [cookbook]. Stay tuned!

[looker]: http://looker.com/
[blog-post-1]: /blog/2013/12/10/introducing-looker-a-fresh-approach-to-bi-on-snowplow-data/
[blog-post-2]: /blog/2014/01/13/five-things-that-make-analyzing-snowplow-data-with-looker-an-absolute-pleasure/

[img-1]: /static/img/blog/2014/01/looker/list-of-metrics.JPG
[img-2]: /static/img/blog/2014/01/looker/zoom-up.JPG
[img-3]: /static/img/blog/2014/01/looker/drill-down.JPG
[img-4]: /static/img/blog/2014/01/looker/7-days-dashboard-quickstart.JPG
[img-5]: /static/img/blog/2014/01/looker/6-months-dashboard-quickstart.JPG
[looker-setup-guide]: https://github.com/snowplow/snowplow/wiki/Getting-started-with-Looker
[cookbook]: /analytics/index.html