---
layout: blog-post
shortenedlink: Snowplow event validation
title: Towards high-fidelity web analytics: introducing Snowplow's innovative new event validation capabilities
tags: snowplow event validation
author: Alex
category: Releases
---

A key goal of the Snowplow project is enabling **high-fidelity** product and marketing analytics for our community of users. What do we mean by high-fidelity analytics? Simply put, high-fidelity web analytics entails Snowplow faithfully recording _all_ customer-generated events in a rich, granular, non-lossy and unopinionated way; warehousing this high-fidelity data gives Snowplow users a hugely valuable asset which they can analyse and explore to understand their customers' behaviour and come to the right business (and ultimately operational) decisions.

Why is Snowplow so unusual in aiming for high-fidelity analytics? Most often, analytics vendors sacrifice the goal of high-fidelity data at the altar of these three compromises:

1. **Premature aggregation** - when the data store gets too large, or the reports take too long to generate, it's tempting to perform the  aggregation/roll-up of the raw event data into reports and summaries earlier, sometimes even at the point of collection. Of course this offers a huge potential performance boost to the tool, but at the cost of a huge degree of customer data fidelity
2. **Ignoring bad news** - the nature of behavioural analytics means that often incomplete, corrupted or plain wrong data is sent in to the package by the event trackers. Handling bad event data is complicated (let's go shopping!) - but instead of dealing with the complexity, most analytics packages just throw the bad data away silently; this is why tag audit companies like [ObservePoint] [observepoint] exist
3. **Having opinions** - another property of customer analytics is that it's full of difficult, not-very-sexy questions that need answering before you can analyse the data: do I track users by their first-party cookie, third-party cookie, business ID and/or IP address? Do I use the server clock, or the user's clock to log the event time? When does a user session start and end? If a CPC campaign link goes viral on Facebook, is the traffic source Facebook, the original CPC campaign or both? Actually, these questions are so hard to answer that most analytics tools don't even ask them: instead they take an opinionated view and silently enforce that view through their event collection, storage and analysis

To deliver on the goal of high-fidelity analytics, then, we're trying to steer Snowplow around these three common pitfalls as best we can.

We have talked in detail on our website and wiki about how we avoid #1, premature aggregation, and no doubt we will blog more about our ideas to combat #3, having opinions, in the future. For the rest of this blog post, though, we will look at our solution to pitfall #2, **Ignoring bad news**.

Read on below the fold to find out more!

<!--more-->

[observepoint]: http://www.observepoint.com/