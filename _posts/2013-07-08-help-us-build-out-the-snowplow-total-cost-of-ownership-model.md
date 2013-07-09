---
layout: blog-post
shortenedlink: Help us build out the snowplow Total Cost of Ownership Model
title: Help us build out the Snowplow Total Cost of Ownership Model
tags: total cost of ownership cloud services
author: Yali
category: Other
---

Back in March, [Robert Kingston suggested] [tco-google-group] that we develop a Total Cost of Ownership model for Snowplow: something that would enable a user or prospective user to accurately estimate their Amazon Web Services monthly charges going forwards, and see how those costs vary with different traffic levels. We thought this was an excellent idea.

Since Rob's suggestion, we've made a number of important changes to the Snowplow platform that have changed the way Snowplow costs scale with the number of events served:

1. We replaced the Hive-based ETL with the [Scalding-based enrichment process] [scalding-etl]
2. We dealt with the [small files problem] [small-files-problem], dramatically reducing EMR costs
3. We enabled support for [task and spot instances] [spot-instances]

As a result of the pending updates, we held off building the model. But now that they have been delivered, we have started putting together the model. In this post we'll cover:

1. [How the model will work: what drives AWS costs for Snowplow users](/blog/2013/07/08/help-us-build-out-the-snowplow-total-cost-of-ownership-model#details)
2. [How you can help](/blog/2013/07/08/help-us-build-out-the-snowplow-total-cost-of-ownership-model#help)

We think walking through the [mechanics of the model](#details) should be useful both to help Snowplow users understand the drivers of their AWS fees, and also an interesting exercise in mathematical modelling: we will open source the model that we build, and use it to power a calculator on our website, so that anyone can use it to estimate their Snowplow AWS costs.

![your-country-needs-you-image] [your-country-needs-you]

We hope Snowplow users will help us build the model by sharing with us some sample data points (related to the number size of files processed by the Snowplow data pipeline), so that we can build a bottom-up model that is as accurate at low volumes as it is at estimating the costs associated with processing billions of lines of rows per day. And we intend that the model can easily be updated as Amazon reduce their AWS pricing, as is becoming increasingly frequent.

As an extra incentive, we're offering every Snowplow user who shares some of the data requested below a **free Snowplow T-shirt** :-).

<!--more-->

<h2><a name="details">1. How the model will work: what drives AWS costs for Snowplow users</a></h2>

It is worth distinguishing the different AWS services, and examining how each scales with volume of events per day, and over time. If we take a *typical* Snowplow user (i.e. one running the [Cloudfront collector] [cloudfront-collector] rather than the [Clojure collector] [clojure-collector]), and storing their data on Redshift for analysis, rather than analyzing their data in S3 using EMR) then we need to account for:

1. [Cloudfront costs](#cloudfront),  
2. [S3 costs](#s3),  
3. [EMR costs](#emr) and
4. [Redshift costs](#redshift)

<h3><a name="cloudfront">1.1 Cloudfront costs</a></h3>

Snowplow uses Cloudfront to serve both `sp.js`, the Snowplow Javascript, and the Snowplow pixel `i`. Broadly, Cloudfront costs scale linearly with the volume of data served out of Cloudfront, with a couple of provisos:

* The cost per MB served goes down, as volumes rise (because Amazon tier their pricing)
* The exact cost varies by AWS account region, and the region the browser that loads the content served by Cloudfront is in (so the exact cost depends on the distribution of your visitors geographically)

Modelling the costs is therefore reasonably straightforward. The `i` pixel is served with every event tracked: so we can calculate the cost of serving `i` based on the size of `i` (it is 37 bytes), the number of events, and the geographic split of visitors by Amazon region. The costs scale almost linearly with the number of events tracked per day.

Modelling the cost of serving `sp.js` is a little trickier. As discussed in our blog post on [browser caching] [browser-caching], it is possible to set `sp.js` so that it is only served once per unique visitor, rather than once per event. Because `sp.js` is 37KB (so a lot larger than `i`), this has a significant impact on your Cloudfront costs. From a modelling perspective, then, we should estimate costs, based on the number of unique visitors per month, and their geographic distribution by Amazon regions. The costs scale almost linearly with the number of unique visitors to the site / network.

<h3><a name="s3">1.2 S3 costs</a></h3>

Snowplow uses S3 to store event data. Amazon charges for S3 based on:

* The volume of data stored in S3
* The number of requests for that data (in the form of `GET` / `PUT` / `COPY` requests)

Modelling how the volume of data grows with increasing numbers of events, and over time (as the amount of data stored in S3 grows, because Snowplow users generally never throw data away) is straightforward: we calculate how large a 'typical' row of Snowplow data is in the raw collector logs, and then in the enriched Snowplow event files. We then assume one row of each type for every event that has been tracked, sum to find the total required storage space, and then multiply by Amazon S3's cost per GB. 

What is more tricky is modelling the number of requests to S3 for the files. To understand why, we need to examine the Snowplow data pipeline, and in particular, the part of the pipeline that takes the raw data generated by the Snowplow collector, cleans that data, enriches it, and uploads the enriched data into Amazon Redshift for analysis.

The first part of the data pipeline is orchestrated by [EmrEtlRunner][emr-etl-runner]. This performs the bulk of data processing work:

![emr-etl-runner] [emr-etl-runner-diagram]

This encapsulates the bulk of the data processing:

* Raw collector log files that need to be processed are identified in the in-bucket, and moved to the processing bucket
* EmrEtlRunner then triggers the Enrichment process to run. This spins up an EMR cluster, loads the data in the processing bucket into HDFS, loads Scalding Enrichment process (as a JAR) and uses that JAR to process the raw logs uploaded into HDFS. The output of that processing is written back, into HDFS
* The output of that Scalding Enrichment is then copied from HDFS into the out-bucket in S3. The EMR cluster is then shut down.
* Once the job has completed, the raw logs are moved from the processing bucket to the archive bucket.

For modelling AWS costs (and S3 costs in particular), we need to note that two `COPY` requests are executed for each collector log file written to S3: one to move that data from the in-bucket to the processing-bucket, and then another one to move the same file from the processing-bucket to the archive bucket. 

In addition, one `GET` request is executed per raw collector log file, when the data is read from S3 for the purposes of writing into HDFS.

The second part of the data pipeline is orchestrated by the [StorageLoader] [storage-loader]:

![storage-loader] [storage-loader-diagram]

This is a much simpler stage of the data processing pipeline:

* Data from enriched event files generated by the Scalding process on EMR is read and written to Amazon Redshift
* The enriched event files are then moved from the in-bucket (which *was* the archive bucket for EmrEtlRunner) to the archive bucket (for the StorageLoader)

Again, for modelling purposes, we note that a single `GET` request is executed for each enriched event file (when the file is read for the purposes of copying the data into Redshift). and then a `COPY` request is executed for that file to move it from the in to the out bucket.

This means that we can accurately forecast costs based on the number of raw collector log files generated and the number of enriched event files generated. Unfortunately, modelling how this number scales with visitors / page views and events is *not* straightforward because it is not clear how the number of collector log files and Snowplow event files scales with numbers of events tracked. This is one of the things [we hope the community can help us with](#help), by providing us with data points to help us unpick the relevant relationships.

To articulate our challenge: we need to understand 

1. How the number of raw collector log files (for the Cloudfront collector) scales with number of events
2. How the number of enriched Snowplow event files scale with the number of events

We have working hypotheses for what determines both numbers. We need to validate these with the Snowplow community, and quantify the relationships mathematically, based on data points shared by members of our community:

We believe that Amazon Cloudfront generates one log file per server per edge location every hour. That means that Snowplow users who do not track large volumes of traffic, will generate a surprisingly large number of log files, each with very low volumes of data. (E.g. 1-5 rows.) As traffic levels climb, the number of log files will increase (more requests to more edge locations is bound to hit more Cloudfront servers), but that this tails off reasonably rapidly once there are enough visitors that most servers are hit at most edge locations every hour. (We guess that Amazon has *lots* of servers at each edge location, so this tailing off might only happen at very large volumes.) We'd therefore expect a graph like the one below, if we plotted numbers of log files vs events:

![line-graph][line-graph] 

In the case of forecasting the number of Snowplow Event files: this should be more straightforward. We believe that the Scalding Enrichment Process generates one output file for every input file that it receives. The Scalding Enrichment process does *not* operate on the raw collector logs: to speed up data processing (and reduce costs), these are aggregated using S3DistCopy prior to being fed into the Enrichment Process. This *should* aggregate the input log files so they are as close to 128MB each as possible. If one output file is produced for each input file, then they will have the same number of rows: it is likely that there is reasonably constant relationship between the size of the two, that mean they are of similar, but not identical, size. (Because they have roughly the same data, but in different formats. with different levels of row-level enrichments.) If that is right, then the number of event files should scale almost linearly with the number of events recorded: almost because given the large maximum file size (roughly 128MBs) the graph would look more like a series of step functions, where a new step change occurs each time an additional 128MBs of events are recorded:

![step-function][step-function]

As we [explain below](#help), we hope to plot the above graphs with data points volunteered by Snowplow users, to see if we are correct, and then use to drive the model.

<h3><a name="emr">1.3 EMR costs</a></h3>

Snowplow uses EMR to run the Enrichment process on the raw logs created by the collector. Because the process is powered by Hadoop, it should scale linearly: double the number of lines of data to be processed, the time to process should double. Double the number of machines in the cluster, the processing time should be halved.

Amazon charges for EMR based on the number of boxes in the cluster, the size of those boxes and the time the cluster is live for. Amazon rounds up the nearest hour: as a result, we would expect the cost of the daily job to be a step function. 

![emr-costs][emr-costs]

We need to work out how many lines of data we can expect each Amazon box to process in one hour. Getting a handle on these figures will also mean we can advise Snowplow users what size of cluster to spin up based on the number of events processed per run.

<h3><a name="redshift">1.4 Redshift costs</a></h3>

The majority of Snowplow users store their events table in Amazon Redshift, and then plug analytics tools into Redshift to crunch that data. As a result, they run a Redshift cluster constantly.

Amazon charges per Redshift node, where each node provides a 2TB of storage (for standard XL nodes) or 16TB of storage (for 8XL nodes). As a result, we can model Redshift costs simply as a function of the volume of data stored (itself just a function of the number of events tracked per day, and the number of days Snowplow has been running). As for EMR, we expect a step function (with a big increase in cost each time an additional 2TB node is required):

![redshift-costs][redshift-costs]

<h2><a name="help">How <i>you</i> can help</a></h2>

As should hopefully be clear from reading the above, we need Snowplow users to share with us the following data, to help us accurately model the above relationships:

1. [The number of events tracked per day](#events-per-day)
2. [The number of times the enrichment process is run per day](#runs-per-day)
3. [The number of Cloudfront log files generated per day, adn the volume of data](#log-files-per-day)
4. [The amount of time taken to enrich the data in EMR (and the size of cluster used to perform the enrichment)](#emr-details)
5. [The number of files outputted back to S3, and the size of those files](#output-back-to-s3)
6. [The total number of lines of data in Redshift, and the amount of Redshift capacity used](#redshift-data-points)

We will then share this data back, in an anonymized form, with the community, as part of the model.

We recognise that that is a fair few data points! To thank Snowplow users for their trouble in providing them (as well as building a model for you). we will *also* send each person that provides data a **free Snowplow T-shirt** in their size.

To get those data points, please work through the following steps:

<h3><a name="events-per-day">2.1 Calculating the number of events tracked per day</a></h3>

Simply execute the following SQL statement in Redshift

{% highlight sql %}
SELECT
to_char(collector_tstamp, 'YYYY-MM-DD') AS "Day",
count(*) AS "Number of events"
FROM events
WHERE collector_tstamp > {$START-DATE}
AND collector_tstamp< {$START-DATE}
GROUP BY "Day"
{% endhighlight %}

<h3><a name="runs-per-day">2.2 Calculating the number of times the enrichment process is run per day</a></h3>

Most Snowplow users run the enrichment process once per day.

You can confirm how many times you run Snowplow by logging into the AWS S3 console and navigating to the bucket where you archive your Snowplow event files. (This is specified in the [StorageLoader config file][storage-loader-config-file].) Within the bucket you'll see a single folder generated for each enrichment 'run', labelled with the timestamp of the run. You'll be able to tell directly how many times the enrichment process is run - in the below case - it is once per day:

![aws-s3-screenshot][number-of-runs-per-day]

<h3><a name="log-files-per-day">2.3 Measuring The number of Cloudfront log files generated per day, adn the volume of data</a></h3>

This is most easily done using an S3 front end, as the AWS S3 console is a bit limited. We use [Cloudberry][cloudberry]. On Cloudberry, you can read the number of files generated per day, and their size, directly, by simply right clicking on the folder with the day's worth of log file archives and selecting properties:

![number-of-collector-logs-and-size][number-of-collector-logs-and-size]

In the above case we see there were 370 files generated on 2013-07-08, which occupied a total of 366.5KB.

<h3><a name="emr-details">2.4 The amount of time taken to enrich the data in EMR (and the size of cluster used to perform the enrichment)</a></h3>

You can use the EMR command line tools to generate a JSON with details of each EMR job. In the below example, we pull a JSON for a specific job:

{% highlight bash %}
$ ./elastic-mapreduce --describe --jobflow j-Y9QNJI44PA0X
{
  "JobFlows": [
    {
      "Instances": {
        "TerminationProtected": false,
        "MasterInstanceId": "i-944414d9",
        "HadoopVersion": "1.0.3",
        "NormalizedInstanceHours": 2,
        "MasterPublicDnsName": "ec2-54-228-105-10.eu-west-1.compute.amazonaws.com",
        "SlaveInstanceType": "m1.small",
        "MasterInstanceType": "m1.small",
        "InstanceGroups": [
          {
            "ReadyDateTime": 1372215923.0,
            "InstanceGroupId": "ig-2TGA68QGUOCUV",
            "State": "ENDED",
            "LastStateChangeReason": "Job flow terminated",
            "InstanceType": "m1.small",
            "InstanceRequestCount": 1,
            "InstanceRunningCount": 0,
            "StartDateTime": 1372215848.0,
            "Name": null,
            "BidPrice": null,
            "Market": "ON_DEMAND",
            "CreationDateTime": 1372215689.0,
            "InstanceRole": "MASTER",
            "EndDateTime": 1372216249.0
          },
          {
            "ReadyDateTime": 1372215929.0,
            "InstanceGroupId": "ig-2M2UW6B8LFWOG",
            "State": "ENDED",
            "LastStateChangeReason": "Job flow terminated",
            "InstanceType": "m1.small",
            "InstanceRequestCount": 1,
            "InstanceRunningCount": 0,
            "StartDateTime": 1372215929.0,
            "Name": null,
            "BidPrice": null,
            "Market": "ON_DEMAND",
            "CreationDateTime": 1372215689.0,
            "InstanceRole": "CORE",
            "EndDateTime": 1372216249.0
          }
        ],
        "InstanceCount": 2,
        "KeepJobFlowAliveWhenNoSteps": false,
        "Placement": {
          "AvailabilityZone": "eu-west-1a"
        },
        "Ec2SubnetId": null,
        "Ec2KeyName": "etl-nasqueron"
      },
      "JobFlowId": "j-Y9QNJI44PA0X",
      "BootstrapActions": [],
      "JobFlowRole": null,
      "AmiVersion": "2.3.6",
      "LogUri": "s3n:\/\/snowplow-emr-logs\/pbz\/",
      "Steps": [
        {
          "ExecutionStatusDetail": {
            "State": "COMPLETED",
            "LastStateChangeReason": null,
            "StartDateTime": 1372215928.0,
            "CreationDateTime": 1372215689.0,
            "EndDateTime": 1372216010.0
          },
          "StepConfig": {
            "HadoopJarStep": {
              "MainClass": null,
              "Args": [
                "--src",
                "s3n:\/\/snowplow-emr-processing\/pbz\/",
                "--dest",
                "hdfs:\/\/\/local\/snowplow-logs",
                "--groupBy",
                ".*\\.([0-9]+-[0-9]+-[0-9]+)-[0-9]+\\..*",
                "--targetSize",
                "128",
                "--outputCodec",
                "lzo",
                "--s3Endpoint",
                "s3-eu-west-1.amazonaws.com"
              ],
              "Properties": [],
              "Jar": "\/home\/hadoop\/lib\/emr-s3distcp-1.0.jar"
            },
            "Name": "Elasticity Custom Jar Step",
            "ActionOnFailure": "TERMINATE_JOB_FLOW"
          }
        },
        {
          "ExecutionStatusDetail": {
            "State": "COMPLETED",
            "LastStateChangeReason": null,
            "StartDateTime": 1372216010.0,
            "CreationDateTime": 1372215689.0,
            "EndDateTime": 1372216196.0
          },
          "StepConfig": {
            "HadoopJarStep": {
              "MainClass": null,
              "Args": [
                "com.snowplowanalytics.snowplow.enrich.hadoop.EtlJob",
                "--hdfs",
                "--input_folder",
                "hdfs:\/\/\/local\/snowplow-logs",
                "--input_format",
                "cloudfront",
                "--maxmind_file",
                "http:\/\/snowplow-hosted-assets.s3.amazonaws.com\/third-party\/maxmind\/GeoLiteCity.dat",
                "--output_folder",
                "s3n:\/\/snowplow-events-pbz\/events\/2013-06-26-04-00-03\/",
                "--bad_rows_folder",
                "2013-06-26-04-00-03\/"
              ],
              "Properties": [],
              "Jar": "s3:\/\/snowplow-hosted-assets\/3-enrich\/hadoop-etl\/snowplow-hadoop-etl-0.3.2.jar"
            },
            "Name": "Elasticity Custom Jar Step",
            "ActionOnFailure": "TERMINATE_JOB_FLOW"
          }
        }
      ],
      "Name": "Snowplow Enrichment for pbz",
      "ExecutionStatusDetail": {
        "ReadyDateTime": 1372215929.0,
        "State": "COMPLETED",
        "LastStateChangeReason": "Steps completed",
        "StartDateTime": 1372215929.0,
        "CreationDateTime": 1372215689.0,
        "EndDateTime": 1372216249.0
      },
      "SupportedProducts": [],
      "VisibleToAllUsers": false
    }
  ]
}
╭─alex@nasqueron  ~/Apps/emr-cli  
╰─$ 
{% endhighlight %}

Rather than parse the JSON yourself, we're very happy for community members to simply save the JSON and email it to us, with the other data points. We can then extract the relevant data points from the JSON directly. (We'll use R and the RJSON package, and blog about how we do it.) You can either generate a JSON for a specific job (you will need to enter the job ID:

{% highlight bash %}
$ ./elastic-mapreduce --describe --jobflow {$jobflow-id} > emr-job-data.json
{% endhighlight %}

Or you can fetch the data for every job run in the last two days:

{% highlight bash %}
$ ./elastic-mapreduce --describe > emr-job-data.json
{% endhighlight %}

Or all the data for every job in the last fortnight:

{% highlight bash %}
$ ./elastic-mapreduce --describe all > emr-job-data.json
{% endhighlight %}

<h3><a name="output-back-to-s3">2.5 Measuring the number of files written back to S3, and their size</a></h3>

We can use Cloudberry again. Simply identify a folder in the archive bucket specified in the [StorageLoader config][storage-loader-config-file], right click on it and select properties:

![number-of-snowplow-event-files-and-size][number-of-snowplow-event-files-and-size]

In the above example, 3 files were generated for a single run, with a total size of 981.4KB.

<h3><a name="redshift-data-points">2.6 The total number of lines of data in Redshift, and the amount of Redshift capacity used</a></h3>

Measuring the amount of space occupied by your events in Redshift is very easy.

First, measure the number of events by executing the following query:

{% highlight sql %}
select count(*) from events;
{% endhighlight %}

Then to find out how much disk space that occupies in your Redshift cluster execute the following query:

{% highlight sql %}
select owner as node, diskno, used, capacity 
from stv_partitions 
order by 1, 2, 3, 4;
{% endhighlight %}

The amount of used capacity (in MB) is given in the "used" column: it is 1941MB in the below example. The total capacity is given at 1906184 i.e. 1.8TB: that is because we are running a single (2TB) node.

![redshift-example][redshift-disk-space]

For our purposes, we only need one of the lines of data to calculate the relationship between disk space on Redshift and number of events stored on Redshift, and use that to model Redshift costs.

## Help us build an accurate, robust model, that we all can use to forecast Snowplow AWS costs

We realise that you, our users, are busy people who have plenty to do aside from spending 20-30 minutes fetching data points related to your Snowplow installation, and sending them to us. We really hope, however, that many of you do, because:

1. A Total Cost of Ownership Model will be really useful for all of us!
2. We'll send you a Snowplow T-shirt, by way of thanks.

So please help us help you, and keep plowing!



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
[emr-costs]: /static/img/blog/2013/07/emr-costs.png
[redshift-costs]: /static/img/blog/2013/07/redshift-costs.png
[emr-etl-runner-config-file]: https://github.com/snowplow/snowplow/wiki/EmrEtlRunner-setup#wiki-configuration
[number-of-runs-per-day]: /static/img/blog/2013/07/number-of-runs-per-day.png
[storage-loader-config-file]: https://github.com/snowplow/snowplow/wiki/1-installing-the-storageloader#wiki-configuration
[number-of-collector-logs-generated-per-day]: /static/img/blog/2013/07/number-of-collector-logs-generated-per-day.png
[bucket-explorer]: http://www.bucketexplorer.com/
[cloudberry]: http://www.cloudberrylab.com/
[number-of-collector-logs-and-size]: /static/img/blog/2013/07/number-of-collector-logs-and-size.JPG
[redshift-disk-space]: /static/img/blog/2013/07/redshift-disk-space.JPG 
[number-of-snowplow-event-files-and-size]: /static/img/blog/2013/07/number-of-snowplow-event-files-and-size.JPG