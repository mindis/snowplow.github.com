---
layout: blog-post
shortenedlink: Scala Forex library released
title: Scala Forex library by wintern Jiawen Zhou released
tags: scala forex currency exchange rate
author: Yali
category: Releases
---

We are proud to announce the release of our new [Scala Forex] [scala-forex] library, developed by [Snowplow wintern Jiawen Zhou] [jiawen-intro]. Jiawen joined us in the Snowplow offices in London this winter and was tasked with taking Scala Forex from a README file to an enterprise-strength Scala library for foreign exchange operations. One month later and we are hugely excited to be sharing her work with the community!

Scala Forex is a high-performance Scala library for performing exchange rate lookups and currency conversions, leveraging the excellent [Open Exchange Rates web service] [ore-signup]. We are excited to be working with Open Exchange Rates, Snowplow's second external data provider after [MaxMind] [maxmind].

In Jiawen's own words:

_Scala Forex is a library which allows users to lookup and convert currencies. The thing about the library that I am most proud of is that it uses LRU caches storing data obtained from each HTTP request; this improves the efficiency and performance of this library. The most challenging part was setting up an environment variable for the secret API key so that Travis CI could run the test suite. The idea of writing spy tests for the caches with Mockito to monitor their behaviours was interesting too. I would recommend people to experience a wintership since it does not take too long and one can learn a lot from it - at least I learnt a lot!_

In this post we will cover:

1. [Why we wrote this library](/blog/2014/01/08/snowplow-0.8.13-released-with-looker-support/#rationale)
2. [How the library is architected](/blog/2014/01/08/snowplow-0.8.13-released-with-looker-support/#architecture)
3. [How to use the library](/blog/2014/01/08/snowplow-0.8.13-released-with-looker-support/#usage)

<!--more-->

<h2><a name="rationale">Why we wrote this library</a></h2>

Last year a Snowplow customer asked us if we could add currency conversions into their custom Snowplow implementation. This seemed like a great idea to explore, and we started to sketch out an approach:

1. Add a new currency field into our ecommerce transaction tracking, to indicate the currency of the transaction (JavaScript Tracker ticket)
2. In our Enrichment process, convert all transactions to the Snowplow user's "base currency"
3. In our Storage targets, log both the original transaction value and the value converted to the user's base currency, for easy analysis

The big missing piece in the above was a Scala library to handle currency conversions. We had some very specific requirements for this library:

1. It had to support close to all of the world's national currencies
2. It had to support historical ("end of day") currency conversions. This is because a Snowplow Enrichment process can be run over many days or months of historical event data
3. It had to minimize the number of external web service calls. Running in an environment like Hadoop or Kinesis, we cannot afford to call a web service for each of millions of events

A custom-built Scala library calling out to the [Open Exchange Rates web service] [ore-signup] seemed the right way to meet these requirements, and so Scala Forex was born!

<h2><a name="architecture">How the library is architected</a></h2>

Scala Forex makes heavy use of the Joda-Money and Joda-Time libraries in its public API. These are enterprise-grade Java libraries for working with currency, money and time, and we were keen not to re-invent the wheel!

Under the covers, the library makes heavy use of two LRU (least recently used) caches, one to hold historic exchange rates and one to hold recent rates. It is the use of these LRU caches which minimizes calls out to the Open Exchange Rates web service, which is critical for performance (and cost) reasons.

The library is thoroughly tested using Specs2 (including Specs2 tables), and Mockito to verify cache behaviour. The library is integrated into Travis CI for continuous testing.

<h2><a name="architecture">How to use the library</a></h2>

Using the library is straightforward: you initialiaze Scala Forex with general and OER-specific configuration, and then you can use a simple Scala DSL to lookup exchange rates, or to perform currency conversions.

For detailed guidance on configuring the library, please see the Configuration section of the Scala Forex README.

Once initialized, an exchange rate lookup is as simple as:

{% highlight scala %}
val usd2jpy = fx.rate.to("JPY").now
{% endhighlight %}

Here's a slightly more complex example:

```sc

```

For detailed guidance on configuring the library, please see the Configuration section of the Scala Forex README.



 This release makes it easy for Snowplow users to get started analyzing their Snowplow data with [Looker] [looker], by providing an initial Snowplow data model for Looker so that a whole host of standard dimensions, metrics, entities and events are recognized in the Looker query interface.





The final word




 [scala-forex]: 