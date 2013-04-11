---
layout: blog-post
shortenedlink: Analysing product page performance
title: Using Snowplow to perform catalogue analytics
tags: snowplow event validation
author: Yali
category: Analytics
---

We built Snowplow to enable businesses to execute the widest range of analytics on their web event data. One area of analysis we are particularly excited about is catalogue analytics. Today, we've published the [first recipes] [recipes] in the [catalogue analytics] [catalogue-analytics] section of the [Snowplow Analytics Cookbook] [cookbook]. These cover [how to measure and compare the performance of different product pages on a retailer site] [recipes], using plots like the one below:

![Example-catalogue-analytics] [example-scatter-plot]

In this blog post, we'll outline

* [What is catalogue analytics?] (#what)
* [What recipes have been published today?] (/blog/2013/04/12/measuring-conversion-rates-by-product-and-product-page/#today)
* [What catalogue analytics recipes can we expect published in the next few weeks and months?] (/blog/2013/04/12/measuring-conversion-rates-by-product-and-product-page/#tomorrow)

<!--more-->

<a name="what"><h3>What is catalogue analytics?</h3></a>

For very many websites, a "catalogue" is a central part of the user-proposition. For a retailer, for example, a catalogue is the collection of products they are selling. For a media site, a catalogue is the collection of content items (be they articles or videos) offered. For an affiliate site, a catalogue is the collection of links or offers available. For a vertical search site, a catalogue is the list of indexed entries presented to the user.

Understanding how well different items in that catalogue "perform" is key to enabling businesses to:

1. Source better "items" (e.g. by buying more effectively if they are a retailer, designing new products if they are a manufacturer, or producing better content if they are a media company)
2. Presenting "items" more effectively (e.g. by surfacing more popular items, using search and recommendation to enable users to dive more deeply into a product catalogue, or personalise the items shown based on user or item data)
3. Improving the "items" themselves (e.g. by tweaking product prices, content copy etc.)

<a name="today"><h3>What recipes have been published today?</h3></a>

Today, we published a [set of recipes to enable businesses to compare the performance of product pages] [recipes]. The analysis described is especially relevant to online retailers - it makes it easy to identify:

1. Which products are good candidates for increased marketing spend, because they are highly converting pages but with low traffic levels
2. Which product pages are underperforming: maybe because the products on them are not competitively priced, or because the content or images are weak
3. Which products are star performers: attracting large volumes of traffic and converting those users effectively
4. Which products are dogs: they do not attract traffic, nor do they convert

You can check out the recipes [here] [recipes].

<a name="tomorrow"><h3>What catalogue analytics recipes can we expect published in the next few weeks and months?</h3></a> 

This is the just the start in what we hope will develop into a long series of catalogue analytics recipes. Some of the other recipes that we plan to add include:

1. Analysing how well different content pieces drive engagement
2. Analysing how much different catalogue items contribute to driving traffic to a site
3. Analysing how much different catalogue items contribute to basket growth through up-sell and increased time-on-site
4. Personalising the items displayed to users based on user data and item data

If there are other examples of catalogue analyses you would like us to include - drop us a line! We're always interested to explore new and innovative ways of using Snowplow data to drive business value...

[example-scatter-plot]: /static/img/analytics/catalogue-analytics/product-page-performance/scatter-plot.jpg
[catalogue-analytics]: /analytics/catalogue-analytics/overview.html
[cookbook]: /analytics/index.html
[recipes]: /analytics/catalogue-analytics/measuring-and-comparing-product-page-performance.html