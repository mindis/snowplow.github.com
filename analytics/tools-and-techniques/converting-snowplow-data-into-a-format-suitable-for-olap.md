---
layout: section
category: analytics
analytics_category: tools-and-techniques
title: Converting SnowPlow data into a format suitable for OLAP
weight: 2
---

# Converting SnowPlow data into a format suitable for OLAP

SnowPlow data is stored effectively in a log file format, where each line of data represents one "event" on a particular user journey. This data structure is unsuitable for traditional BI / analysis tools like Tableau or Pentaho. In this section of the cookbook, we describe how to restructure SnowPlow event data into a format suitable for OLAP analysis, so that it can be visualised using tools like Tableau and Pentaho.

Although this guide is written specifically for SnowPlow data, the basic approach to converting log format data into a structure suitable for OLAP data should work for other data sets as well.

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

1. Make it easy to slice data along different dimensions, exploring different relationships over time
2. They do not require much technical knowledge to use. (E.g. no need to know SQL or Python).
3. They are well suited to "train of thought analysis" i.e. moving quickly between one view of the data and another, as insights derived from the first immediately lead to questions that are answered by the second.

OLAP tools are especially well suited for SnowPlow web analytics data:

1. There are a wide range of dimensions we might want to slice and dice web analytics data by, including time, user, visit, geography, device, browser, type of web page, web page, content and/or product, acquisition channel...
2. There are a wide variety of metrics we might want to compare between dimension combinations e.g. unique users, visits, page views, events, purchases, conversion rates, revenue

<a name="what"><h3>2. What is OLAP exactly?</h3> </a>

#### 2.1 OLAP overview

OLAP is an approach for analysing multi-dimensional data. OLAP stands for "online analytics processing", but it in fact relates to something much more tightly defined in data analytics: the treating of multidimensional data as a cube.

An OLAP cube is a multi-dimensional array of data. Data points are made up of one or more metrics. (In our cases, uniques, visits, page views, transactions, revenue, number of content items consumed etc.) Data can be viewed by a range of different dimensions. (In our case, time of day, day in the week, time of the year, year, customer cohort, type of device, type of browser etc.) An OLAP reporting tool makes it easy for analysts to view the metrics they want, sliced by the particular dimensions they're interested in. So, for example, if an analyst wanted to see if conversion rates had been improving over time, they might slice the conversion rates metric by the time dimension (e.g. by month), to view if there had been an improvement. If there had been an improvement, they might then drill down to see if that improvement had been across the board: was it true of all customer segments, across all device types etc.?

When we say OLAP cube, then, we visualise a "cube" of data points (i.e. metrics) at the intersection of multiple dimensions. (Three in the case of a cube, but more often there are more dimensions. Technically we should talk in terms of a "hyper-cube", but it doens't really matter.)

#### 2.2 OLAP operations

##### 2.2.1 Slicing data

We "slice" data when we pick two dimensions to view a particular metric by. The analogy is to take a "slice" through an OLAP cube to produce a 2D data set.

##### 2.2.2. Dice data

Rather than slice data into two dimensions, we might want to create a subcube with more than 2 dimensions. This operation is called "dice".

#### 2.2.3. Drill up and drill down

OLAP dimensions are often organised in a hierarchy. To gives some examples:

	Year -> Quarter -> Month -> Day -> Hour -> Minute -> Second

	Organic referrers -> Google -> specific keywords

	Browser -> browser version

	Category -> Subcategory -> Product

TO COMPLETE

...

<a name="structure"><h3>3. What structure does the data need to be in to support an OLAP cube?</h3></a>

TO WRITE

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