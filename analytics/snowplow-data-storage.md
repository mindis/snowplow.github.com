---
layout: section
category: analytics
analytics_category: overview
title: Data storage
weight: 3
---

# Understanding how your Snowplow data is stored

Currently, Snowplow supports storing your data in two locations: [Amazon S3] (#s3) and [Redshift] (#redshift) and [Infobright] (#infobright) columnar database. We are working to support [a growing range of data storage options] (#other) - this is because where your data lives has important implications for the type of analysis tools you can use to process that data. The more storage locations we make it easy for you to pipe your Snowplow data, the more analysis tools you will be able to plug into that data. Many Snowplow uses already store data on _both_ S3 _and_ Infobright, to exploit tools that work well with both storage solutions. (More on this [further down the page](#more).)

Understanding how your Snowplow data is stored and formatted will better position you to analyse that data using a broad range of tools.

<h2><a name="s3">Storage in Amazon S3</a></h2>

![s3-logo] [s3-logo]

Storing your Snowplow data in Amazon S3 has a number of benefits:

* It is incredibly scalable: S3 can store as much data as you can throw at it
* You can process data stored in S3 directly using Amazon Elastic Mapreduce: making it easy to use tools like [Hive] [hive], [Pig] [pig], [Mahout] [mahout] and [HBase] [hbase] to process your data. 

Data is currently stored in S3 in flat-file, `ctrl-a` delimited format, which makes it easy to query using any of the above tools. A table definition can be found [here] [hive-table-def]. Remember: each event is represented by a single line of data.

Going forwards, our intention is to change the format of data stored in S3 to use [Avro] [avro]. This will better enable us to grow out the range of event-specific and platform-specific fields.

For a guide to getting started using Hive to query your data in S3, see the [getting started] [getting-started-with-hive] section on the [setup guide] [setup-guide].

<h2><a name="redshift">Storage in Redshift</a></h2>

![redshift-logo] [redshift-logo]

Storing your Snowplow data in Amazon Redshift has a number of benefits:

* Amazon Redshift is a fully-managed service (unlike Infobright Community edition)
* Amazon Redshift scales up to handle Petabytes of data
* Redshift clusters can be scaled up over time: Amazon makes it easy to add nodes
* A wide range of analytics tools can be plugged directly into Redshift via well-supported PostgreSQL JDBC and ODBC drivers. (E.g. it already works with [ChartIO] [chartio]. A dedicated connector is being built for [Tableau] [tableau].)
* Redshift supports a broad set of SQL functionality
* Redshift is highly cost effective: costing as little as $1000 per TB per year

Data is stored in Redshfit as a single 'fat table'. The structure mirrors the flat file structur of the data stored in Amazon S3, with some minor differences related to data formats that Hive supports and Redshift does not.

<h2><a name="infobright">Storage in Infobright</a></h2>

![infobright logo] [infobright-logo]

Storing your Snowplow data in Infobright has a number of advantages:

* Rapid querying. Infobright's columnar oriented database is optimized for fast querying across very large data sets (scaling up to terabytes)
* Fixed costs. Whereas Amazon S3 and EMR costs scale with data and query volumes, once you've paid for your Infobright instance, the costs are fixed, however much you use that instance. 
* Easily plug in a wide-range of analysis tool via the MySQL JDBC interface: any analysis tool that works with MySQL should be able to work with Infobright, which is nearly all of them, including all the major business intelligence and OLAP solutions.

Data is stored in Infobright as a single 'fat table'. The structure mirrors the flat file structure of the data stored in Amazon S3, with some minor differences related to data formats that Hive supports and Infobright does not (e.g. arrays). For more details see the [data structure] [table-structure] page.

<a name="more"><p>As should hopefully be clear, there are benefits to storing your Snowplow data in **both** S3 and Infobright: Infobright to support OLAP analysis, and S3 to support machine learning (via Mahout).</p></a>

<h2><a name="other">Other storage options on the roadmap</a></h2>

We plan to incorporate [SkyDB] [skydb] to enable specialist analysis of behavioral / event data.


[Learn more][table-structure] about how data is structured.


[apachehive]: #apachehive
[infobright]: #infobright
[infobright-website]: http://www.infobright.org/
[wiki]: http://github.com/snowplow/snowplow/wiki
[github-repo]: http://github.com/snowplow/snowplow
[s3]: http://aws.amazon.com/s3/
[serde]: https://github.com/snowplow/snowplow/tree/master/3-etl/hive/snowplow-log-deserializers
[table-structure]: snowplow-table-structure.html
[hive]: http://hive.apache.org/
[emr]: http://aws.amazon.com/elasticmapreduce/
[emr-cli]: http://aws.amazon.com/developertools/2264
[tableau]: http://www.tableausoftware.com/
[microstrategy]: http://www.microstrategy.co.uk/
[r]: http://www.r-project.org/
[table-structure]: snowplow-table-structure.html
[hosted-serde]: https://github.com/snowplow/snowplow/wiki/Hosted-assets
[emr-etl-runner]: https://github.com/snowplow/snowplow/wiki/hive-etl-setup
[hive]: http://hive.apache.org/
[pig]: http://pig.apache.org/
[mahout]: http://mahout.apache.org/
[hbase]: http://hbase.apache.org/
[hive-table-def]: https://github.com/snowplow/snowplow/blob/master/4-storage/hive-storage/hive-format-table-def.q
[getting-started-with-hive]: https://github.com/snowplow/snowplow/wiki/Running-Hive-using-the-command-line-tools
[setup-guide]: https://github.com/snowplow/snowplow/wiki/Setting-up-Snowplow
[s3-logo]: /static/img/amazon_s3_logo.jpg
[redshift]: http://aws.amazon.com/redshift/
[skydb]: http://skydb.io/
[infobright-logo]: /static/img/infobright_logo.JPG
[avro]: http://avro.apache.org/
[redshift-logo]: /static/img/amazon-redshift.png
[chartio]: http://chartio.com/
[tableau]: http://www.tableausoftware.com/