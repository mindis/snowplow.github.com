---
layout: section
category: analytics
analytics_category: tools-and-techniques
title: Get started with R
weight: 3
---

<a name="top"><h1>Getting started analyzing Snowplow data with R</h1></a>

This guide is geared towards data analysts who have limited or no experience with R. It aims to teach R through concrete examples with Snowplow data - so you can start using R to answer business questions and draw out interesting insights from your Snowplow data fast, whilst growing familiarity with the underlying tool and approach.

1. [Why use R?](#why)
2. [Getting started: plotting the number of uniques per day](#start)
3. [Having a look at the data: an introduction to data frames in R](#intro-to-data-frames)
4. [Creating our first plot](#1st-plot)
5. [A more complicated example: comparing visit characteristics by a range of dimensions](#more-complex-example)

<a name="why"><h2>1. Why use R?</h2></a>

R is a fantastic analytics tool. To date, however, only a minority of web analysts use it. To list just some of what makes it so excellent, especially when compared with traditional general purpose tools like Excel, and BI tools like Tableau:

* It is great for producing a wide variety of visualizations - including a much wider than those supported by BI tools
* It has fantastic tools for extending existing visualizations and creating new visualizations all together
* It is easy to document analytics performed with R and retrace your steps. (Simply by copying and pasting your steps into the R console.) This makes R a much *safer* and *more robust* environment to interrogate data than e.g. Excel or Tableau, where if you realize you made an error eight steps back, retracing your steps can be difficult and time consuming.
* It is blindingly fast to both perform complicated analytics and generate beautiful visualizations. The syntax is incredibly concise - what you can achieve in one line of R can take hours of working through menus and options on other systems.
* It helps you think through what you do with your data in a more rigorous way. R forces you to define your data types much more specifically than either Excel or BI tools like Tableau. That rigour is helpful - it means you do things faster, and you're less liable to make mistakes.
* It is great at statistics. Traditional BI tools and Excel *suck* at statistics. Sure you can calculate means, medians, quartiles etc. But actually pulling these together into meaningful distribution plots, or plotting how they change over time, is a pain in these tools, which are much better at counting and summing data. R is simply much better at statistics
* It has an **enormous** library of packages available for performing just about any type of analytics imaginable
* It is free
* It works on all platforms

In spite of all the benefits listed above, people often find struggle with R to start off with. The command line is a difficult place to start, and R has some idiosyncracies that need to be understood. 

In this guide, we cover them by working through practical examples with Snowplow data, paying special attention to covering some of those key concepts and idiosyncracies.

Back to [top](#top).

<a name="start"><h2>2. Getting started: plotting the number of unique visitors by day</h2></a>

This guide assumes you have installed R, and installed the `RPostgreSQL` package required to get R to talk to PostgreSQL databases including Amazon Redshift. If you have not, installed this, you can do so by executing the following at the R prompt:

{% highlight r %}
> install.package("RPostgreSQL")
{% endhighlight %}

R will ask you to select a mirror to download the package from. Select a local mirror and the package should install automatically.

Now we need to tell R to use the package:
{% highlight r %}
> library("RPostgreSQL")
{% endhighlight %}

The library lets us execute a SQL query against our data in Redshift, and pulls the result of the query into R as a data frame. (We'll explain a bit about data frames shortly.) The query we want to execute, to find out how many unique visitors we've received to our site by day, is:

{% highlight sql %}
SELECT 
to_char(collector_tstamp, 'YYYY-MM-DD') AS "date",
count(distinct(domain_userid)) AS uniques
FROM "public"."events"
GROUP BY "date"
ORDER BY "date";
{% endhighlight %}

To execute the query in R, first we have to setup a connection to our Redshift database, by executing the following commands:

{% highlight r %}
drv <- dbDriver("PostgreSQL")
con <- dbConnect(drv, host="<<ENTER HOST DETAILS HERE>>", port="<<ENTER PORT DETAILS HERE>>",dbname="<<ENTER DB NAME HERE>>", user="<<ENTER USERNAME HERE>>", password="<<ENTER PASSWORD HERE>>")
{% endhighlight %}

(For detials about where to find your host, port, dbname and username see the [setup guide] [install-r].)

Now we can execute the query, and assign it to a variable called `uniquesByDay`, by executing the following:

{% highlight r %}
uniquesByDay <- dbGetQuery(con, "
	SELECT 
	to_char(collector_tstamp, 'YYYY-MM-DD') AS \"date\",
	count(distinct(domain_userid)) AS uniques
	FROM \"public\".\"events\"
	WHERE collector_tstamp > '2013-02-22'
	GROUP BY \"date\"
	ORDER BY \"date\"
")
{% endhighlight %}

Note how double inverted commas have to be escaped with a backslash.

Back to [top](#top).

<a name="intro-to-data-frames"><h2>3. Having a look at the data: an introduction to data frames in R</h2></a>

We can have a look at the `uniquesByDay` variable by simply entering it at the command line:

{% highlight r %}
uniquesByDay
{% endhighlight %}

R responds by dumping the contents of the variable to the screen. We see that the data is in the form of a table with three columns. The first column is the row number, the second column is the `date` column, and the third is the `uniques` column. We can view just the top 5 lines of data by entering `head(uniquesByDay)` at the prompt. We've pasted the contents of the screen, including what R returns, in our case:

{% highlight r %}
> head(uniquesByDay)
        date uniques
1 2013-02-22      78
2 2013-02-23      70
3 2013-02-24      76
4 2013-02-25     125
5 2013-02-26     130
6 2013-02-27      88
> 
{% endhighlight %}

We can find out more about our uniquesByDay object, by typing `summary(uniquesByDay)` at the prompt:

{% highlight r %}
> summary(uniquesByDay)
     date              uniques      
 Length:124         Min.   : 16.00  
 Class :character   1st Qu.: 75.75  
 Mode  :character   Median :116.00  
                    Mean   :114.73  
                    3rd Qu.:150.25  
                    Max.   :274.00  
>
{% endhighlight %}

R tells us that our data contains two columns: `date` and `uniques`. It tells us what type each column is: `date` is of type `character`, and `uniques` is a numeric field, for which it gives us some basic statistical information, so we can get a sense of the range of values.

Our `date` column really corresponds to `date`. We can update the data type for this column:

{% highlight r %}
> uniquesByDay$date <- as.Date(uniquesByDay$date)
{% endhighlight %}

When we now look at the summary for our data frame, the type of data in the `date` column has changed:

{% highlight r %}
> summary(uniquesByDay)
      date               uniques      
 Min.   :2013-02-22   Min.   : 16.00  
 1st Qu.:2013-03-24   1st Qu.: 75.75  
 Median :2013-04-24   Median :116.00  
 Mean   :2013-04-24   Mean   :114.73  
 3rd Qu.:2013-05-25   3rd Qu.:150.25  
 Max.   :2013-06-25   Max.   :274.00  
> 
{% endhighlight %}

We can get further information on the structure of the data frame by executing the `str()` function on it:

{% highlight r %}
> str(uniquesByDay)
'data.frame':	124 obs. of  2 variables:
 $ date   : Date, format: "2013-02-22" "2013-02-23" ...
 $ uniques: num  78 70 76 125 130 88 84 69 35 75 ...
{% endhighlight %}

This confirms that the type of the first column has been set to a date format.

Back to [top](#top).

<a name="1st-plot"><h2>4. Creating our first plot</h2></a>

There are a number of built in and additional libraries for plotting data visualizations in R. We recommend starting out with the absolutely excellent `ggplot2`.

First, install the `ggplot2` package, if you have not done so previously:

{% highlight r %}
> install.packages("ggplot2")
{% endhighlight %}

Now that it's installed, you can load the library:

{% highlight r %}
> library("ggplot2")
{% endhighlight %}

Now we can plot the number of uniques over time, using the `qplot` (quickplot) command:

{% highlight r %}
> qplot(date, uniques, data=uniquesByDay, geom="line")
{% endhighlight %}

The plot appears in a new window:

![uniques-by-day] [graph-1]

Back to [top](#top).

<a name="more-complex-example">5. A more complicated example: comparing visit characteristics by a range of dimensions</a>

The previous example was simple start. It didn't enable us to do anything that could not easily be achieved using any other visualization tool.

In our second example, we'll pull a more complicated data set from Snowplow, and try out some visualizations in GGPlot (boxplot and jittered scattergrams) that I think are awesome at conveying distribution information, and are not well supported by other tools.

For this example, we're going to look at visit data by a number of different dimensions, and produce different plots to see how different visit characteristics vary with those different dimensions. This is classically something that is well supported by a BI / OLAP tool like Tableau. The example shows that R has those same capabilities, and in addition, a broader set of visualizations to enable us to unpick relationships between metrics and dimensions.

First, we need to design a SQL query to pull the cut of data we want. In this case, we want visit level data. We want to capture the following metrics for each visit:

* Number of distinct pages viewed (i.e. breadth of content engaged with)
* Total number of events (as a measure of engagement)

With the following dimensions:

* Whether or not the user visited our "services" page. (A goal of ours is to drive visitors to buy our services.)
* The landing page the visitor arrived on
* The referer that drove them to our website
* The timestamp the visit started. (So we can analyse e.g. how behaviour varies by day of the week.)
* Which country the visitor is located in
* The browser type
* How many times the visitor had visited our website previously

The SQL query to return our required measures by visit and some of the dimensions is straightforward:

{% highlight sql %}
SELECT
domain_userid,
domain_sessionidx,
geo_country,
br_type,
min(collector_tstamp) AS "time_of_first_touch",
count(distinct(page_urlpath)) AS "distinct_pages_visited",
count(*) as "number_of_events"
FROM "public"."events"
WHERE collector_tstamp > '2013-02-22'
GROUP BY "domain_userid, domain_sessionidx, geo_country, br_type
{% endhighlight %}

We need to add a line about whether or not one of our services pages was visited as part of the customer journey. We can identify all the visits where the visitor did pop by one of our services pages by executing the following query:

{% highlight sql %}
SELECT
domain_userid,
domain_sessionidx,
1 AS 'visited_services_pages'
FROM "public"."events"
WHERE page_urlpath LIKE '/services/%'
GROUP BY domain_userid, domain_sessionidx, visited_services_pages
{% endhighlight %}

And then join the results of the above query to our first query to generate the additional dimension:

{% highlight sql %}
SELECT
e.domain_userid, 
e.domain_sessionidx,
geo_country,
br_type,
visited_services_pages,
min(collector_tstamp) AS "time_of_first_touch",
count(distinct(page_urlpath)) AS "distinct_pages_visited",
count(*) as "number_of_events"
FROM "public"."events" e
LEFT JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	'1' AS "visited_services_pages"
	FROM "public"."events"
	WHERE page_urlpath LIKE '/services/%'
	GROUP BY domain_userid, domain_sessionidx, visited_services_pages
) s
ON e.domain_userid = s.domain_userid
AND e.domain_sessionidx = s.domain_sessionidx
WHERE collector_tstamp > '2013-02-23'
GROUP BY e.domain_userid, e.domain_sessionidx, geo_country, br_type, visited_services_pages
{% endhighlight %}

Lastly we add the data about who are referer is, and what the URL of the landing page is. Both of these data points can be read from the first line of data for the visit, so we add them by doing an additional join with the output of the previous query, this time on `domain_userid`, `domain_sessionidx` **and** `min(collector_tstamp)`:

{% highlight sql %}
SELECT
t.domain_userid,
t.domain_sessionidx,
t.geo_country,
t.br_type,
r.page_urlpath AS landing_page,
r.refr_medium,
r.refr_source,
r.refr_term,
r.refr_urlhost,
t.visited_services_pages,
t.time_of_first_touch,
t.distinct_pages_visited,
t.number_of_events
FROM (
	SELECT
	e.domain_userid,
	e.domain_sessionidx,
	geo_country,
	br_type,
	visited_services_pages,
	min(collector_tstamp) AS "time_of_first_touch",
	count(distinct(page_urlpath)) AS "distinct_pages_visited",
	count(*) as "number_of_events"
	FROM "public"."events" AS e
	LEFT JOIN (
		SELECT
		domain_userid,
		domain_sessionidx,
		'1' AS "visited_services_pages"
		FROM "public"."events"
		WHERE page_urlpath LIKE '/services/%'
		GROUP BY domain_userid, domain_sessionidx, visited_services_pages
	) AS s
	ON e.domain_userid = s.domain_userid
	AND e.domain_sessionidx = s.domain_sessionidx
	WHERE collector_tstamp > '2013-02-22'
	GROUP BY e.domain_userid, e.domain_sessionidx, geo_country, br_type, visited_services_pages
) AS t
JOIN "public"."events" AS r
ON t.domain_userid = r.domain_userid
AND t.domain_sessionidx = r.domain_sessionidx
AND t.time_of_first_touch = r.collector_tstamp
{% endhighlight %} 

Now that we have our query, we can pull the data into R:

{% highlight r %}
> visits <- dbGetQuery(con, "
	SELECT
	t.domain_userid,
	t.domain_sessionidx,
	t.geo_country,
	t.br_type,
	r.page_urlpath AS landing_page,
	r.refr_medium,
	r.refr_source,
	r.refr_term,
	r.refr_urlhost,
	t.visited_services_pages,
	t.time_of_first_touch,
	t.distinct_pages_visited,
	t.number_of_events
	FROM (
		SELECT
		e.domain_userid,
		e.domain_sessionidx,
		geo_country,
		br_type,
		visited_services_pages,
		min(collector_tstamp) AS \"time_of_first_touch\",
		count(distinct(page_urlpath)) AS \"distinct_pages_visited\",
		count(*) as \"number_of_events\"
		FROM \"public\".\"events\" AS e
		LEFT JOIN (
			SELECT
			domain_userid,
			domain_sessionidx,
			'1' AS \"visited_services_pages\"
			FROM \"public\".\"events\"
			WHERE page_urlpath LIKE '/services/%'
			GROUP BY domain_userid, domain_sessionidx, visited_services_pages
		) AS s
		ON e.domain_userid = s.domain_userid
		AND e.domain_sessionidx = s.domain_sessionidx
		WHERE collector_tstamp > '2013-02-22'
		GROUP BY e.domain_userid, e.domain_sessionidx, geo_country, br_type, visited_services_pages
	) AS t
	JOIN \"public\".\"events\" AS r
	ON t.domain_userid = r.domain_userid
	AND t.domain_sessionidx = r.domain_sessionidx
	AND t.time_of_first_touch = r.collector_tstamp
")
{% endhighlight %}

[install-r]: https://github.com/snowplow/snowplow/wiki/Setting-up-R-to-perform-more-sophisticated-analysis-on-your-data
[graph-1]: /static/img/analytics/tools/r/uniques-by-day.png


