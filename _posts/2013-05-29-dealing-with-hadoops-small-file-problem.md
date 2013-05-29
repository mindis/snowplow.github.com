---
layout: blog-post
shortenedlink: Rob Slifka's Elasticity
title: Dealing with Hadoop's small file problem
tags: hadoop small-file hdfs
author: Alex
category: Inside the Plow
---

Hadoop has a serious Small Files Problem. It's widely known that Hadoop struggles to run MapReduce jobs that involve thousands of small files; Hadoop much prefers to crunch through 10s or 100s of files sized at or around the magic size of 128 megabytes. The technical reasons for this are well explained in this [Cloudera blog post] [cloudera-small-files] - what is less well understood is exactly how badly small files can slow down your Hadoop job, and what to do about it.

<< COOL IMAGE >>

In this blog post we will explore both of these questions, using our experience dealing with the small files problem at Snowplow. **And we will argue that dealing with the small files problem is the single most important optimisation you can perform on your MapReduce process.**

<!--more-->

## Background

First, by way of background: as you may know, Snowplow trackers send user events to a pixel hosted on CloudFront, from where they are automatically logged to Amazon S3. The nature of Amazon's CloudFront logging is such that many small log files are generated in the CloudFront distribution's logging bucket in S3. By way of example: a relatively low traffic e-commerce site we work with generated 26,372 CloudFront log files over a 6 month period, containing 83,110 events. That's just 3.2 events per file.

Following the collection step, we then have a Hadoop job (written in [Scalding] [scalding]) which reads the raw log files in S3, validates their contents and enriches them with referer, geo-location and similar information; the enriched events are then written back to S3.

## Quantifying the small file problem

At Snowplow we knew the small files problem was something we needed to tackle, but until we implemented a solution and ran before- and after- performance tests, we had no idea exactly how badly the small file problem was slowing down our Enrichment process. This screenshot shows you what we found:

<< IMAGE >>

That's right - processing time dropped from 2 hours 57 minutes to just 9 minutes - of which 3 minutes was dealing with ("crushing") the small files, and 4 minutes was running our actual Enrichment process. That's a speedup of **1,867%**.

To make the comparison as detailed as possible, here is the exact specification of the before- and after- test:

<< TODO >>

We are not saying that implementing a speedup will always increase in a XX speedup - certainly 

[cloudera-small-files]: http://blog.cloudera.com/blog/2009/02/the-small-files-problem/
[scalding]: https://github.com/twitter/scalding/wiki