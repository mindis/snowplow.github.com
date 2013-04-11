---
layout: blog-post
shortenedlink: Online catalog analytics
title: Using Snowplow to perform online catalog analytics
tags: snowplow ecommerce retail catalog catalogue analytics
author: Yali
category: Analytics
---

We built Snowplow to enable businesses to execute the widest range of analytics on their web event data. One area of analysis we are particularly excited about is catalog analytics for retailers. Today, we've published the [first recipes] [recipes] in the [catalog analytics] [catalog-analytics] section of the [Snowplow Analytics Cookbook] [cookbook]. These cover [how to measure and compare the performance of different product pages on an ecommerce site] [recipes], using plots like the one below:

![Example-catalog-analytics] [example-scatter-plot]

In this blog post, we will briefly outline:

* [What is catalog analytics?](#what)
* [What recipes have been published today?](/blog/2013/04/12/measuring-conversion-rates-by-product-and-product-page/#today)
* [What catalog analytics recipes can we expect published in the next few weeks and months?](/blog/2013/04/12/measuring-conversion-rates-by-product-and-product-page/#tomorrow)

<!--more-->

<a name="what"><h3>What is catalog analytics?</h3></a>

For very many websites, a "catalog" is a central part of the user-proposition. For a retailer, for example, a catalog is the collection of products they are selling. For a media site, a catalog is the collection of content items (be they articles or videos) offered. For an affiliate site, a catalog is the collection of links or offers available. For a vertical search site, a catalog is the list of indexed entries presented to the user.

Understanding how well different items in that catalog "perform" is key to enabling these businesses to:

1. Source better catalog items - e.g. by buying more effectively if they are a retailer, or designing new products if they are a manufacturer, or producing better content if they are a media company
2. Present catalog items more effectively - e.g. by surfacing more popular items, using search and recommendation to enable users to dive more deeply into the catalog, or personalise the items shown based on user or item data
3. Optimize the existing catalog item - e.g. by tweaking product prices, adjusting content copy and so on

<a name="today"><h3>What recipes have been published today?</h3></a>

Today, we published a [set of recipes to enable businesses to compare the performance of product pages] [recipes]. The published analysis is particularly relevant to online retailers - it makes it easy for them to identify:

1. Which products are good candidates for increased marketing spend, because they are highly converting pages but with low traffic levels
2. Which product pages are underperforming: maybe because the products on them are not competitively priced, or because the content or images are weak
3. Which products are star performers: attracting large volumes of traffic and converting those users effectively
4. Which products are dogs: they do not attract traffic, nor do they convert

You can check out the recipes [here] [recipes].

<a name="tomorrow"><h3>What catalog analytics recipes can we expect published in the next few weeks and months?</h3></a> 

This is the just the start in what we hope will develop into a long series of catalog analytics recipes. Some of the other recipes that we plan to add include:

1. Analysing how well different content pieces drive engagement
2. Analysing how much different catalog items contribute to driving traffic to a site
3. Analysing how much different catalog items contribute to basket growth through up-sell and increased time-on-site
4. Personalising the items displayed to users based on user data and item data

If there are other examples of catalog analyses you would like us to include - drop us a line! We're always interested to explore new and innovative ways of using Snowplow data to drive business value...

[example-scatter-plot]: /static/img/analytics/catalog-analytics/product-page-performance/scatter-plot.jpg
[catalog-analytics]: /analytics/catalog-analytics/overview.html
[cookbook]: /analytics/index.html
[recipes]: /analytics/catalog-analytics/measuring-and-comparing-product-page-performance.html