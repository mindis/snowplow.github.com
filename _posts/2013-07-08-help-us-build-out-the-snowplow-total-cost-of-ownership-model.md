---
layout: blog-post
shortenedlink: Help us build out the snowplow Total Cost of Ownership Model
title: Help us build out the Snowplow Total Cost of Ownership Model
tags: total cost of ownership cloud services
author: Yali
category: Other
---


Back in March, [Robert Kingston suggested] [tco-google-group] that we develop a Total Cost of Ownership model for Snowplow: something that would enable a user or prospective user to accurately estimate their Amazon monthly charges going forwards, and see how those costs vary with different traffic levels. We thought that was an excellent idea.

Since Rob's suggestion, we've made a number of important changes to the Snowplow platform that have changed the way Snowplow costs scale with the number of events served:

1. We replaced the Hive-based ETL with the [Scalding-based enrichment process] [scalding-etl]
2. We dealt with the [small files problem] [small-files-problem], dramatically reducing EMR costs
3. We enabled support for [task and spot instances] [spot-instances]

As a result of the updates, we held off building the model. Now that they have been delivered, we have started putting together the model in earnest. In this post we'll cover:

1. [How the model will work: what drives AWS costs for Snowplow users] (/blog/2013/07/08/help-us-build-out-the-snowplow-total-cost-of-ownership-model#details)
2. [How you can help] (/blog/2013/07/08/help-us-build-out-the-snowplow-total-cost-of-ownership-model#help)

We think walking through the [mechanics of the model] (#details) should be useful both to help Snowplow users understand the drivers of their AWS fees, and also an interesting exercise in mathematical modelling. (We will open source the model that we build, and use it to power a calculator on our website, so that anyone can use it to estimate their Snowplow AWS costs.)

![your-country-needs-you-image] [your-country-needs-you]

We hope Snowplow users will help us build the model by sharing with us some sample data points (related to the number size of files processed by the Snowplow data pipeline), so that we can build a bottom-up model that is as accurate at low volumes as at estimating the costs associated with processing billions of lines of rows per day. (And can easily be updated as Amazon reduce their AWS pricing, as is becoming increasingly frequent.)

<!--more-->

<h2><a name="details">1. How the model will work: what drives AWS costs for Snowplow users</a></h2>

It is worth distinguishing the different AWS services, and looking at how each scales with volume of events per day, and over time. If we take a *typical* Snowplow user (i.e. one running the [Cloudfront collector] [cloudfront-collector] rather than the [Clojure collector] [clojure-collector]), and storing their data on both S3 and Redshift for analysis, rather than analyse the data using EMR) then we need to account for:

1 [Cloudfront costs] (#cloudfront)  
2 [S3 costs] (#s3)  
3 [EMR costs] (#emr)  
4 [Redshift costs] (#redshift)  

<h3><a name="cloudfront">1.1 Cloudfront costs</a></h3>

Snowplow uses Cloudfront to serve both `sp.js`, the Snowplow Javascript, and the Snowplow pixel `i`. Broadly, Cloudfront costs scale linearly with the volume of data served out of Cloudfront, with a couple of provisos:

* The cost per MB served goes down, as volumes rise. (Amazon tier the pricing.)
* The exact cost varies by AWS account region, and the region the browser that loads the content served by Cloudfront is in. (So the exact cost depends on the distribution of your visitors geographically.)

Modelling the costs is therefore reasonably straightforward. The `i` pixel is served with every event tracked: so we can calculate the cost of serving `i` based on the size of `i` (it is 37 bytes), the number of events, and the geographic split of visitors by Amazon region.

Modelling the cost of serving `sp.js` is a little trickier. As discussed in our blog post on [browser caching] [browser-caching], it is possible to set `sp.js` so that it is only served once per unique visitor, rather than once per event. Because `sp.js` is 37KB (so a lot larger than `i`), this has a significant impact on your Cloudfront costs. From a modelling perspective, however, it makes it easy to estimate costs, based on the number of unique visitors per month, and their geographic distribution by Amazon regions.

<h3><a name="s3">1.2 S3 costs</a></h3>

Snowplow uses S3 to store event data. Amazon charges for S3 based on:

* The volume of data stored in S3
* The number of requests for that data. (In the form of `GET` / `PUT` / `COPY` requests.)

Modelling how the volume of data grows with increasing numbers of events, and over time (as the amount of data stored in S3 grows, because Snowplow users generally never throw data away) is straightforward: we calculate how long a 'typical' row of Snowplow data is in the raw collector logs, and then in the enriched Snowplow table. We then assume one row of each type for every event that has been tracked, sum to find the total required storage space, and multiply by Amazon S3's cost per GB. 

What is more tricky is modelling the number of requests to S3 for the files. To understand why, we need to examine the Snowplow data pipeline, and in particular, the part of the pipeline that takes the raw data generated by the Snowplow collector, cleans that data, enriches it, and uploads the enriched data into Amazon Redshift for analysis.

The first part of the data pipeline is orchestrated by [EmrEtlRunner][emr-etl-runner]. This performs the bulk of data processing work:

![emr-etl-runner] [emr-etl-runner-diagram]

This encapsulates the bulk of the data processing:

* Raw collector log files that need to be processed are identified in the in-bucket, and moved to the processing bucket
* EmrEtlRunner then triggers the Enrichment process to run. This spins up an EMR cluster, loads the data in the processing bucket into HDFS, loads Scalding Enrichment process (as a JAR) and uses that JAR to process the raw logs uploaded into HDFS. 
* The output of that Scalding Enrichment is then written to the out-bucket. The EMR cluster is then shut down
* Once the job has completed, the raw logs are moved from the processing bucket to the archive bucket

For modelling AWS costs (and S3 costs in particular), we need to note that two `COPY` requests are executed for each collector log file written to S3: one to move that data from the in-bucket to the processing-bucket, and then anotehr one to move the same file from the processing-bucket to the archive bucket. 

In addition, one `GET` request is executed per raw collector log file, when the data is read from S3 for the purposes of writing into HDFS.

The second part of the data pipeline is orchestrated by the [StorageLoader] [storage-loader]:

![storage-loader] [storage-loader-diagram]

This is a much simpler stage of the data processing pipeline:

* Data from enriched event files generated by the Scalding process on EMR is read and written to Amazon Redshift
* The enriched event files are then moved from the in-bucket (which *was* the archive bucket for EmrEtlRunner) to the archive bucket (for the StorageLoader)

Again, for modelling purposes, we note that a single `GET` request is executed for each enriched event file (when the file is read for the purposes of copying the data into Redshift). and then a `COPY` request is executed for that file to move it from the in to the out bucket.

This means that we can accurately forecast costs based on the number of raw collector log files generated and the number of enriched event files generated. Unfortunately, modelling how this number scales with visitors / page views and events is *not* straightforward: it is one of the things [we hope the community can help us with](#help), by providing us with data points to help us unpick the relevant relationships.

To articulate our challenge: we need to understand 

1. How the number of raw collector log files (for the Cloudfront collector) scale with number of events
2. How the number of enriched snowplow event files scale with the number of events

We have working hypotheses for what determines both numbers. We need to ideally validate these with the Snowplow community, and quantify the relationships mathematically, based on data points shared with members of our community:

We believe that Amazon Cloudfront generates one log file per server per edge location every hour. That means that Snowplow users who do not track large volumes of traffic, will generate a surprisingly large number of log files, each with very low volumes of data. (E.g. 1-5 rows.) As traffic levels climb, the number of log files will increase (more requests to more edge locations is bound to hit more Cloudfront servers), but that this tails off reasonably rapidly once there are enough visitors that most servers are hit at most edge locations every hour. We'd therefore expect a graph like the one below, if we plotted numbers of log files vs events:

![line-graph][line-graph] 

In the case of forecasting the number of Snowplow Event files: this should be more straightforward. We believe that the Scalding Enrichment Process generates one output file for every input file that it receives. The Scalding Enrichment process does *not* operate on the raw collector logs: to speed up data processing (and reduce costs), these are aggregated using S3DistCopy prior to being fed into the Enrichment Process. This *should* aggregate the input log files so they are as close to 128MB each as possible. If one output file is produced for each input file, then they will have the same number of rows: it is likely that there is reasonably constant relationship between the size of the two, that mean they are similar, but not identical. (Because they have roughly the same data, but in different formats. with different levels of row-level enrichments.) If that is right, then the number of event files should scale almost linearly with the number of events recorded: almost because given the large maximum file size (roughly 128MBs) the graph would look more like a series of step functions, where a new step change occurs each time an additional 128MBs of events are recorded:

![step-function][step-function]



<h3><a name="emr">1.3 EMR costs</a></h3>



<h3><a name="redshift">1.4 Redshift costs</a></h3>


<h2><a name="help">How <i>you</i> can help</a></h2>




[tco-google-group]: https://groups.google.com/forum/#!searchin/snowplow-user/cloudfront$20cost/snowplow-user/b_HPkt3nwzo/Ms-J54e8bUYJ
[scalding-etl]: /blog/2013/04/03/snowplow-0.8.0-released-with-all-new-scalding-based-data-enrichment/
[small-files-problem]: /blog/2013/05/30/dealing-with-hadoops-small-files-problem/
[spot-instances]: /blog/2013/06/03/snowplow-0.8.6-released-with-performance-improvements/#task-instances
[your-country-needs-you]: /static/img/blog/2013/07/your-country-needs-you.jpg
[cloudfront-collector]: https://github.com/snowplow/snowplow/tree/master/2-collectors/cloudfront-collector
[clojure-collector]: https://github.com/snowplow/snowplow/tree/master/2-collectors/clojure-collector 
[browser-caching]: /blog/2013/07/02/reduce-your-cloudfront-bills-with-cache-control/
[emr-etl-runner-diagram]: /static/img/blog/2013/07/emr-etl-runner-steps.png
[storage-loader-diagram]: /static/img/blog/2013/07/storage-loader-steps.png
[storage-loader]: https://github.com/snowplow/snowplow/wiki/1-Installing-the-StorageLoader
[emr-etl-runner]: https://github.com/snowplow/snowplow/wiki/setting-up-EmrEtlRunner 
[line-graph]: /static/img/blog/2013/07/line-graph.png
[step-function]: /static/img/blog/2013/07/step-function.png