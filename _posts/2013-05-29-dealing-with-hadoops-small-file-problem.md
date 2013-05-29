---
layout: blog-post
shortenedlink: Rob Slifka's Elasticity
title: Dealing with Hadoop's small file problem
tags: hadoop small-file hdfs
author: Alex
category: Inside the Plow
---

Hadoop has a serious Small Files Problem. It's widely known that Hadoop struggles to run MapReduce jobs that involve thousands of small files; Hadoop much prefers to crunch through 10s or 100s of files sized at or around the magic size of 128 megabytes. The technical reasons for this are well explained in this [Cloudera blog post] [cloudera-small-files] - what is less well understood is how badly small files can slow down your Hadoop job, and what to do about it.

<< COOL IMAGE >>

In this blog post we will discuss the small files problem in terms of our experiences with it at Snowplow. **And we will argue that dealing with the small files problem - if you have it - is the single most important optimisation you can perform on your MapReduce process.**

<!--more-->

## Background

To give some necessary background on our architecture: Snowplow event trackers send user events to a pixel hosted on CloudFront, which logs those raw events to Amazon S3. Amazon's CloudFront logging generates many small log files in S3: a relatively low-traffic e-commerce site using Snowplow generated 26,372 CloudFront log files over a six month period, containing 83,110 events - that's just 3.2 events per log file.

Once the events have been collected in S3, Snowplow's Hadoop job (written in [Scalding] [scalding]) processes them, validating them and then enriching them with referer, geo-location and similar data; these enriched events are then written back to S3.

So you can see that our Enrichment process ran pretty directly into Hadoop's small files problem. But quantifying the impact of small files on our job's performance was impossible until we had a solution in place...

## Quantifying the small file problem

This week we implemented a solution to aggregate our tiny CloudFront logs into more sensibly sized input files - we will be releasing this as part of [Snowplow 0.8.6] [milestone-086] shortly.

In testing this code and running before- and after- performance tests, we realised just how badly the small file problem was slowing down our Enrichment process. This screenshot shows you what we found:

<< IMAGE >>

That's right - aggregating with the small files first reduced total processing time from 2 hours 57 minutes to just 9 minutes - of which 3 minutes was the aggregation, and 4 minutes was running our actual Enrichment process. That's a speedup of **1,867%**.

To make the comparison as helpful as possible, here is the exact specification of the before- and after- test:

<< TODO >>

This is an astonishing speed-up.

We are not saying that implementing a speedup will always increase in a XX speedup - certainly 

[cloudera-small-files]: http://blog.cloudera.com/blog/2009/02/the-small-files-problem/
[scalding]: https://github.com/twitter/scalding/wiki