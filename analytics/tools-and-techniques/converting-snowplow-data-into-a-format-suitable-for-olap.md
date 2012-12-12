---
layout: section
category: analytics
analytics_category: tools-and-techniques
title: Converting SnowPlow data into a format suitable for OLAP
weight: 2
---

<h1><a name="top">Converting SnowPlow data into a format suitable for OLAP</a></h1>

SnowPlow data is stored effectively in a log file format, where each line of data represents one "event" on a particular user journey. This data structure is unsuitable for traditional BI / analysis tools like Tableau or Pentaho, which require that the data be structured in a format suitable for OLAP analysis. (Sometimes also called _pivot tables_.) In this section of the cookbook, we describe how to restructure SnowPlow event data into a format suitable for OLAP analysis, so that it can be visualised using tools like Tableau and Pentaho.

Although this guide is written specifically for SnowPlow data, the basic approach to converting log format data into a structure suitable for OLAP data should work for other log or event data sets as well.

### Contents


1. [Why use OLAP?] (#why)
2. [What is OLAP exactly?](#what)
3. [What structure does the data need to be in to support an OLAP cube?](#structure)
4. [Some practical considerations related to databases and tables](#practical)
5. [Converting SnowPlow event log data into dimensional OLAP structure: step by step guide](#conversion)
6. [Testing the results with Tableau](#tableau-test)
7. [Testing the results with Qlikview](#qlikview-test)
8. [Limitations in OLAP analysis](#limitations)

<a name="why" ><h3>1. Why use OLAP?</h3> </a>

OLAP tools like Tableau, Pentaho and Microstrategy are very popular amongst data analysts because they 

1. Make it easy to slice data along different dimensions, exploring different relationships over time, and answering a wealth of different business questions
2. They do not require much technical knowledge to use. (E.g. no need to know SQL or Python).
3. They are well suited to "train of thought analysis" i.e. moving quickly between one view of the data and another, as insights derived from the first immediately lead to questions that are answered by the second.

OLAP tools are especially well suited for SnowPlow web analytics data:

1. There are a wide range of dimensions we might want to slice and dice web analytics data by, including time, user, visit, geography, device, browser, type of web page, web page, content and/or product, acquisition channel...
2. There are a wide variety of metrics we might want to compare between dimension combinations e.g. unique users, visits, page views, events, purchases, conversion rates, revenue.
3. Web analysts are generally very familiar with OLAP analysis / pivot tables: Google Analytics [cusotm reports] [ga-custom-reports] enables analysts to select metrics and dimensions like a primitive (and incredibly slow) OLAP cube, for example.

Back to [top] (#top).

<a name="what"><h3>2. What is OLAP exactly?</h3> </a>

#### 2.1 OLAP overview

OLAP is an approach for analysing multi-dimensional data. OLAP stands for "online analytics processing", but it in fact relates to something much more tightly defined in data analytics: the treating of multidimensional data as a cube.

An OLAP cube is a multi-dimensional array of data. Data points are made up of one or more metrics. (In our cases, uniques, visits, page views, transactions, revenue, number of content items consumed etc.) Data can be viewed by a range of different dimensions. (In our case, time of day, day in the week, time of the year, year, customer cohort, type of device, type of browser etc.) An OLAP reporting tool makes it easy for analysts to view the metrics they want, sliced by the particular dimensions they're interested in. So, for example, if an analyst wanted to see if conversion rates had been improving over time, they might slice the conversion rates metric by the time dimension (e.g. by month), to view if there had been an improvement. If there had been an improvement, they might then drill down to see if that improvement had been across the board: was it true of all customer segments, across all device types etc.?

When we say OLAP cube, then, we visualise a "cube" of data points (i.e. metrics) at the intersection of multiple dimensions. (Three in the case of a cube, but more often there are more dimensions. Technically we should talk in terms of a "hyper-cube", but it doens't really matter.)

Back to [top] (#top).

#### 2.2 OLAP operations

#### 2.2.1 Slicing data

We "slice" data when we pick two dimensions to view a particular metric by. The analogy is to take a "slice" through an OLAP cube to produce a 2D data set.

#### 2.2.2. Dice data

Rather than slice data into two dimensions, we might want to create a subcube with more than 2 dimensions. This operation is called "dice".

#### 2.2.3. Drill up and drill down

OLAP dimensions are often organised in a hierarchy. To gives some examples:

	Year -> Quarter -> Month -> Day -> Hour -> Minute -> Second

	Organic referrers -> Google -> specific keywords

	Browser -> browser version

	Category -> Subcategory -> Product

Drilling down refers to moving down the dimension hierarchy - e.g. from viewing sales by month to by week, and then by day. In each case, the level the metrics are being aggregated drops,  so the actual numbers reported fall.

In contrast, drilling up means moving up the dimension hierarchy - e.g. form viewing sales by month to by year. In this case, you're aggregating bigger data sets (a whole year's worth of data), so the the actual numbers get larger.

#### 2.2.4 Pivot

Pivoting means swaping one dimension for another. Typically this is used in two situations:

1. With an initial data set, to spot if there are interesting relationships between particular dimensions (e.g. product mix by city or conversion rate by time of day).
2. To better understand a relationship once one has been spotted. (Does product mix _only_ vary by city? Or is it actually that user segments vary by city, and it is user segment that is predictive of product mix?)

Back to [top] (#top).

<a name="structure"><h3>3. What structure does the data need to be in to support an OLAP cube?</h3></a>

In traditional OLAP parlance, at the heart of OLAP data is a "fact table". In SnowPlow paralance, that fact table is really an "events" table. There are two key requirements to fulfil to ensure that events data is structured in a format suitable for processing by an OLAP tool like Tableau:

1. The granularity of the data is sufficient to support the sufficient "drill down". So, for example, if you want to be able to drill down to an individual user level, for example, your data set has to have separate entries for each user, each differentiated by the `user_id` field. Any aggregation of users (e.g. cohorts) must happen in the OLAP tool e.g. Tableau, **not** in the raw data fed into Tableau
2. All the dimensional information associated with each event (or "fact") that you want to slice / dice on must be present in the line of event data. 

Of the two requirements outlined above, meeting the first using SnowPlow data is easy, because SnowPlow data is already stored at the most granular level. (I.e. at least one line of data per "event".) Meeting the second is a bit more nuanced. We discuss both below:

#### 3.1 Getting the granularity of data right

The more granular our data, the more reporting flexibility we have. One of the most frequently cited complaints about Google Analytics, for example, is that the data Google provides isn't sufficiently granular, so you cannot, for example, drill down to explore the way an individual user has engaged with your site.

With OLAP analysis, increased granularity doesn't just support better drill down facilities. It also enables more pivotting possibilities - as you can slice and dice more combinations of metrics against one another.

So granularity is good. The good news is that SnowPlow data is very granular: at least one line of data per event. If we wanted (and it's perfectly legitimate to), we could feed SnowPlow data into our OLAP reporting tool without aggregating it at all. However, there is a cost associated with this level of granularity: it means that the data volumes are greater, and so it is likely that the reporting tool will work more slowly. This used to be a much more important consideration (when RAM wasn't so cheap, and before columnar databases like Infobright and SSD drives). However, it is still a reasonable consideration today.

One example of an approach to aggregating SnowPlow data: we could aggregate it at the level of the user, session and event. (Be it a particular page load, product add to basket etc.) In this case, if we had a user who had visited a particular page 3x in one session, we would only have one line of data representing those three page views. (As opposed to having three in our original SnowPlow events data set.) This would reduce our volume of data somewhat (likely by a factor of 0.1 - 0.25), but still give us a lot of reporting flexibility. (We'd be able to drill down to the user and action level.) We would not, however, be able to perform any path analysis. (I.e. look at the sequence of events in a particular user session.) In any case, this type of analysis isn't well supported by OLAP tools like Tableau.

<a name="practical"><h3>4. Some practical considerations related to databases and tables</h3></a>

TO WRITE

<a name="conversion"><h3>5. Converting SnowPlow event log data into dimensional OLAP structure: step by step guide</h3></a>

TO WRITE

<a name="tableau-test"><h3>6. Testing the results with Tableau</h3></a>

TO WRITE

<a name="qlikview-test"><h3>7. Testing the results with Qlikview</h3></a>

TO WRITE

<a name="limitations"><h3>8. Limitations in OLAP analysis</h3></a>

TO WRITE


[ga-custom-reports]: http://www.google.com/analytics/features/custom-reports.html