---
layout: blog-post
shortenedlink: Three eras of data processing
title: The three eras of business data processing
tags: eventstream events unified log analytics data warehouse
author: Alex
category: Releases
---

Every so often, a work emerges that captures and disseminates the bleeding edge so effectively as to define a new norm. For those of us working in eventstream analytics, that moment came late in 2013 with the publication of Jay Kreps' monograph [The Log: What every software engineer should know about real-time data's unifying abstraction] [kreps-the-log]. Anyone involved in the operation or analysis of a digital business ought to read Jay's piece in its entirety. His central point, convincingly argued, is that every digital business should be (re-)structured around a centralized event firehose which:

1. aggregates events from disparate source systems,
2. stores them in what Jay calls a "unified log", and
3. enables data processing applications to operate on this stream

Sounds familiar? At Snowplow we believe passionately in putting a continuous stream of immutable events at the heart of your digital business, and we want Snowplow to power this "digital nervous system" for companies large and small. Jay's monograph validated our approach-to-date (e.g. on the importance of [building an event grammar] [event-grammar]), but also moved our thinking forwards in a number of ways.

In the rest of this blog post, rather than simply re-hashing Jay's thoughtpiece, I want to create a new baseline by mapping out the historical and ongoing evolution of business data processing, extending up to the unified log espoused by Jay. I have split this evolution into two distinct eras which I have lived through and experienced firsthand, plus a third era which is soon approaching:

1. [The Classic Era  - the pre-big data, pre-SaaS era of operational systems and batch-loaded data warehouses](/blog/2014/01/20/the-three-eras-of-business-data-processing/#classic-era)
2. [The Hybrid Era - today's hotchpotch of different systems and approaches](/blog/2014/01/20/the-three-eras-of-business-data-processing/#hybrid-era)
3. [The Unified Era - a future enabled by continuous data processing on a unified log](/blog/2014/01/20/the-three-eras-of-business-data-processing/#unified-era)

After the jump, let's explore each of these eras in turn:

<!--more-->

<h2><a name="classic-era">The Classic Era</a></h2>

When I started work at Deloitte Consulting 12 years ago, even forward-thinking businesses still primarily operated a disparate set of on-premise transactional systems. Each of these systems would feature: an internal "local loop" for data processing; its own data silo; and, when unavoidable, point-to-point connections to peer systems. To give the Management team a much-needed view _across_ these systems, very often a textbook "Ralph Kimball" data warehouse was added, typically fed from the transactional systems overnight by a set of batch ETL processes.

The whole system looked something like this - using the case of an retailer for our example:

![classic-era-img] [classic-era-img]

And that was pretty much it. In truth, most businesses still run on a close descendant of this approach, albeit with more SaaS services mixed in. However, some businesses, particularly those in fast-moving sectors like retail and media, have made the leap to what we might call the Hybrid Era:

<h2><a name="hybrid-era">The Hybrid Era</a></h2>

The Hybrid Era is characterized by companies operating a real hotchpotch of different transactional and analytics systems - some on-premise packages, some from SaaS vendors, plus some home-grown systems.

It is hard to generalize what these architectures look like - again we see strong local loops and data silos, but we also see attempts at "log everything" approaches with Hadoop and/or systems monitoring. There tends to be a mix of near-real-time processing for narrow analytics use cases like product recommendations, plus separate batch processing efforts into Hadoop or a classic data warehouse. We see attempts to bulk export data from external SaaS vendors for warehousing, and efforts to feed these external systems with the data they require for their own local loops.

Keeping our multi-channel retailer in mind, here is what her architecture looks like now:

![hybrid-era-img] [hybrid-era-img]

This looks complicated, but is really something of a simplification - most businesses will have a much more complex systems landscape. But even with this simplification, we can see some real limitations of this approach:

1. **There is no single version of the truth** - there are now multiple different warehouses implemented, split depending on the data volumes and the analytics latency required
2. **Decisioning has become fragmented** - the number of local systems loops, each operating on siloed data, has grown since the Classic Era. These loops represent a highly fragmented approach to making near-real-time decisions from data
3. **Point-to-point connections have proliferated** - as the number of systems has grown, the number of point-to-point connections has exploded. Many of these connections are fragile or incomplete. Getting sufficiently-granular and timely data out of external SaaS systems is particularly challenging
4. **Analytics can have low latency or wide data coverage, but not both** - where stream processing is selected for low latency, it becomes effectively another local loop. The warehouses aim for much wider data coverage, but at the cost of high latency

<h2><a name="unified-era">The Unified Era</a></h2>

This history brings us up to the present day, and what we are calling the Unified Era of data processing for businesses.

[kreps-the-log]: http://engineering.linkedin.com/distributed-systems/log-what-every-software-engineer-should-know-about-real-time-datas-unifying
[event-grammar]: http://snowplowanalytics.com/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar/
