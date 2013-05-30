---
layout: blog-post
shortenedlink: Rob Slifka's Elasticity
title: Dealing with Hadoop's small file problem
tags: hadoop small-file hdfs
author: Alex
category: Inside the Plow
---

Hadoop has a serious Small Files Problem. It's widely known that Hadoop struggles to run MapReduce jobs that involve thousands of small files: Hadoop much prefers to crunch through tens or hundreds of files sized at or around the magic 128 megabytes. The technical reasons for this are well explained in this [Cloudera blog post] [cloudera-small-files] - what is less well understood is how badly small files can slow down your Hadoop job, and what to do about it.

<img src="/static/img/blog/2013/05/plowing-small-files.jpg" />

In this blog post we will discuss the small files problem in terms of our experiences with it at Snowplow. **And we will argue that dealing with the small files problem - if you have it - is the single most important optimisation you can perform on your MapReduce process.**

<!--more-->

## Background

To give some necessary background on our architecture: Snowplow event trackers send user events to a pixel hosted on CloudFront, which logs those raw events to Amazon S3. Amazon's CloudFront logging generates many small log files in S3: a relatively low-traffic e-commerce site using Snowplow generated 26,372 CloudFront log files over a six month period, containing 83,110 events - that's just 3.2 events per log file.

Once the events have been collected in S3, Snowplow's Hadoop job (written in [Scalding] [scalding]) processes them, validating them and then enriching them with referer, geo-location and similar data; these enriched events are then written back to S3.

So you can see how our Enrichment process ran pretty directly into Hadoop's small files problem. But quantifying the impact of small files on our job's performance was impossible until we had a solution in place...

## Quantifying the small file problem

This week we implemented a solution to aggregate our tiny CloudFront logs into more sensibly sized input files - this enhancement will be released as part of [Snowplow 0.8.6] [milestone-086] shortly.

In testing this code and running before- and after- performance tests, we realised just how badly the small file problem was slowing down our Enrichment process. This screenshot shows you what we found:

<img src="/static/img/blog/2013/05/small-files-before-after.png" />

That's right - aggregating with the small files first reduced total processing time from 2 hours 57 minutes to just 9 minutes - of which 3 minutes was the aggregation, and 4 minutes was running our actual Enrichment process. That's a speedup of **1,867%**.

To make the comparison as helpful as possible, here is the exact specification of the before- and after- test:

| Metric                   | Before (with small files)    | After (with small files aggregated) |
|:-------------------------|:-----------------------------|:------------------------------------|
| **Source log files**     | 26,372                       | 26,372                              |
| **Files read by job**    | Source log files             | Aggregated log files                |
| **Location of files**    | Amazon S3                    | HDFS on CORE instances              |
| **Compression on files** | gzip                         | LZO                                 |
| **part- files out**      | 23,618                       | 141                                 |
| **Events out**           | 83,110                       | 83,110                              |
| **Cluster**              | 1 x m1.large, 18 x m1.medium | 1 x m1.large, 18 x m1.medium        |
| **Execution time**       | **177 minutes**              | **9 minutes**                       |

**Health warning:** this is one benchmark, measuring the performance of the Snowplow Hadoop job using a single data set. We encourage you to run your own benchmarks.

This is an astonishing speed-up, which shows how badly the small files problem was impacting our Hadoop job. And aggregating the small files had another beneficial effect: the much smaller number of `part-` output files meant much faster loading of events into Redshift.

So how did we fix the small files problem for Snowplow? In the next section we will discuss possible solutions for you to consider, and in the last section we will go into some more detail on the solution we chose.

## Options for dealing with small files on Hadoop

As we did our background research into solutions to the small files problem, three main schools of thought emerged:

1. Change your "feeder" software so it doesn't produce small files (or perhaps files at all). In other words, if small files are the problem, change your upstream code to stop generating them
2. Run an offline aggregation process which aggregates your small files and re-uploads the aggregated files ready for processing
3. Add an additional step to the start of your Hadoop jobflow which aggregates the files

For us, option 1 was out of the question, as we have no control over how CloudFront writes its log files.

Option 2 was interesting - and we have had Snowplow users such as 99designs successfully adopt this approach; if you are interested in exploring this further, Lars from 99designs has shared a [CloudFront log aggregation script in Python] [lars-script] as a gist. However, overall option 2 seemed to us to introduce more complexity - as there would now be an additional long-running process to run, and potentially added fragility - as there would now be a manifest file to maintain. We had super-interesting discussions with the community about all this in [this Google Groups thread] [agg-thread] and [this GitHub issue] [agg-issue].

In the end, though, we opted for option 3. Given that we are always starting a Hadoop cluster anyway, adding an initial step to aggregate the small files first seemed like a low-friction approach.

We were surprised how little discussion there was on the inte

[cloudera-small-files]: http://blog.cloudera.com/blog/2009/02/the-small-files-problem/
[scalding]: https://github.com/twitter/scalding/wiki
[milestone-086]: https://github.com/snowplow/snowplow/issues?milestone=22&page=1&state=open
[lars-script]: https://gist.github.com/larsyencken/4076413
[agg-thread]: https://groups.google.com/forum/#!topic/snowplow-user/xdhegsztJlA
[agg-issue]: https://github.com/snowplow/snowplow/issues/82