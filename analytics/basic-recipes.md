---
layout: section
category: analytics
analytics_category: overview
title: Basic recipes
weight: 5
---


<a name="top"><h1>Bread and butter web analytics queries</h1></a>


The following queries return basic web analytics data that someone could expect from any standard web analytics package. These are *not* the queries that SnowPlow was designed to perform: we built SnowPlow to enable analysts to run queries on web analytics data that are **not** possible with other web analytics programs. These queries return the results that **all** web analytics queries return. However, running them can be useful for an analyst to validate SnowPlow has been setup correctly (by comparing the output against e.g. Google Analytics), and help her get familiar with writing queries in SnowPlow.

The following queries will work with both Hive and Infobright.

1. [Number of unique visitors](#counting-unique-visitors)
2. [Number visits](#counting-visits)
3. [Number of pageviews](#counting-pageviews)
4. [Number of events](#counting-events)
5. [Pages per visit](#pages-per-visit)
6. [Bounce rate](#bounce-rate)
7. [% New visits](#new-visits)
8. [Average visitor duration](#duration)
9. [Repeating queries: a note about efficiency](#efficiency)
10. [Demographics: language](#language)
11. [Demographics: location](#location)
12. [Behaviour: new vs returning](#new-vs-returning)
13. [Behaviour: frequency](#frequency)
14. [Behaviour: recency](#recency)
15. [Behaviour: engagement](#engagement)
16. [Technology: browser](#browser)
17. [Technology: operating system](#os)
18. [Technology: mobile](#mobile)

 <a name="counting-unique-visitors"><h2>1. Number of unique visitors </h2></a>

The number of unique visitors can be calculated by summing the number of distinct `domain_userid`s in a specified time period e.g. day. (Because each user is assigned a unique domain_userid, based on a lack of SnowPlow tracking cookies on their browser):

{% highlight mysql %}
SELECT 
collector_dt AS date,
COUNT(DISTINCT(domain_userid)) AS uniques
FROM `events_008`
GROUP BY collector_dt
ORDER BY collector_dt;
{% endhighlight %}

Or by week:

{% highlight mysql %}
SELECT 
YEAR(collector_dt) AS `year`,
WEEKOFYEAR(collector_dt) AS `week`,
COUNT(DISTINCT(domain_userid)) AS uniques
FROM `events_008`
GROUP BY `year`, `week`
ORDER BY `year`, `week`
{% endhighlight %}

Or by month:

{% highlight mysql %}
SELECT 
YEAR(collector_dt) AS `year`,
MONTH(collector_dt) AS `month`,
COUNT(DISTINCT(domain_userid)) AS uniques
FROM `events_008`
GROUP BY `year`, `month`
ORDER BY `year`, `month`
{% endhighlight %}

In ChartIO:

![uniques-by-day][uniques-by-day]

[Back to top](#top)

 <a name="counting-visits"><h2>2. Number of visits</h2></a>

Because each user might visit a site more than once, summing the number of `domain_userid`s returns the number if *visitors*, NOT the number of *visits*. Every time a user visits the site, however, SnowPlow assigns that session with a `domain_sessionidx` (e.g. `1` for their first visit, `2` for their second.) Hence, to count the number of visits in a time period, we concatenate the unique `domain_userid` with the `domain_sessionidx` and then count the number of distinct concatenated entry in the events table:

{% highlight mysql %}
SELECT
collector_dt AS `date`,
COUNT( DISTINCT( CONCAT( domain_userid,"-",domain_sessionidx ))) AS `visits`
FROM `events_008`
GROUP BY collector_dt 
ORDER BY collector_dt;
{% endhighlight %}

In ChartIO:

![visits-by-day][visits-by-day]

[Back to top](#top)

 <a name="counting-pageviews"><h2>3. Number of page views</h2></a>

Page views are one type of event that are stored in the SnowPlow events table. Their defining feature is that the `page_title` contain values (are not `NULL`). In the case of an *event* that is not a page view (e.g. an _add to basket_) these fields would all be `NULL`, and the event fields (`ev_category`, `ev_action`, `ev_label` etc.) would contain values. For details, see the [Introduction to the SnowPlow events table](https://github.com/snowplow/snowplow/blog/master/docs/07_snowplow_hive_tables_introduction.md).

To count the number of page views by day, then we simply execute the following query:

{% highlight mysql %}
SELECT
collector_dt,
COUNT( DISTINCT( event_id )) AS page_views
FROM `events_008`
WHERE `event` = 'page_view'
GROUP BY collector_dt 
ORDER BY collector_dt;
{% endhighlight %}

In ChartIO:

![pageviews-by-day][pageviews-by-day]

[Back to top](#top)

 <a name="counting-events"><h2>4. Number of events</h2></a>

Although the number of page views is a standard metric in web analytics, this reflects the web's history as a set of hyperlinked documents rather than the modern reality of web applications that are comprise lots of AJAX events (that need not necessarily result in a page load.)

As a result, counting the total number of events (including page views but also other AJAX events) is actually a more meaningful thing to do than to count the number of page views, as we have done above. We recommend setting up SnowPlow so that *all* events / actions that a user takes are tracked. Hence, running the below queries should return a total sum of events on the site by time period:

{% highlight mysql %}
SELECT
collector_dt AS `date`,
COUNT(DISTINCT(event_id)) AS `events`
FROM `events_008`
WHERE collector_dt>'2012-11-25'
GROUP BY collector_dt 
ORDER BY collector_dt;
{% endhighlight %}

In ChartIO:

![events-by-day][events-by-day]

As well as looking at page views by time period, we can also look by user e.g. by grouping on `domain_userid`. This gives a good impression of the engagement level of each of our users: how does this vary across our user population, how it varies for a particular user over time, for example.

For example, to examine the engagement by user by month, we execute the following query:

{% highlight mysql %}
SELECT
YEAR(collector_dt) AS `year`,
MONTH(collector_dt) AS `month`,
domain_userid AS `user`,
COUNT(event_id) AS `events`
FROM `events_008`
GROUP BY `year`, `month`, `user`;
{% endhighlight %}

There is scope to taking a progressively more nuanced approach to measuring user engagement levels. For more details see the section on [measuring user engagement with SnowPlow][measure-user-engagement].

[Back to top](#top)

 <a name="pages-per-visit"><h2>5. Pages per visit</h2></a>

The number of pages per visit can be calculated by visit very straightforwardly:

{% highlight mysql %}
SELECT
CONCAT(domain_userid,"-",domain_sessionidx) AS `session`,
count(distinct(event_id)) AS page_views
FROM `events_008_cf`
WHERE `event` = 'page_view'
GROUP BY `session`;
{% endhighlight %}

To calculate the average page views per week we group the results of the above query by week and then average over the results:

{% highlight mysql %}
SELECT
DATE_FORMAT(date,  '%Y-%v') AS `week`,
AVG(page_views) AS `average_pageviews`
FROM (
	SELECT
	CONCAT(domain_userid,"-",domain_sessionidx) AS `session`,
	MIN(collector_dt) AS `date`,
	count(distinct(event_id)) AS page_views
	FROM `events_008`
	WHERE `event` = 'page_view'
	GROUP BY `session`) pvs_by_visit
GROUP BY `week`;
{% endhighlight %}

In ChartIO:

![avg-pvs-per-visit-per-week-chartio][avg-pvs-per-visit-per-week-chartio]

[Back to top](#top)

 <a name="bounce-rate"><h2>6. Bounce rate</h2></a>

First we need to look at all the website visits, and flag which of those visits are *bounces*: these are visits where there is only one page view i.e. `COUNT( DISTINCT ( event_id )) = 1`:

{% highlight mysql %}
SELECT
MIN(collector_dt) AS `date`,
CONCAT(domain_userid, "-", domain_sessionidx) AS `session`,
IF(COUNT(DISTINCT(event_id)) = 1, 1,0)  AS bounce
FROM `events_008`
GROUP BY `session`
) ;
{% endhighlight %}

Then we need to calculate the fraction of visits by time period that are *bounces* e.g. by day:

{% highlight mysql %}
SELECT
date,
sum(bounce)/count(session) as fraction_of_visits_that_bounce
FROM (
	SELECT
	MIN(collector_dt) AS `date`,
	CONCAT(domain_userid, "-", domain_sessionidx) AS `session`,
	IF(COUNT(DISTINCT(event_id)) = 1, 1,0)  AS bounce
	FROM `events_008`
	GROUP BY `session`) v
WHERE `date`>'2012-11-26'
GROUP BY `date`
ORDER BY `date`;
{% endhighlight %}

In ChartIO:

![fraction-of-visits-per-day-that-bounce][fraction-of-visits-per-day-that-bounce]

[Back to top](#top)

 <a name="new-visits"><h2>7. % New visits</h2></a>

A new visit is easily identified as a visit where the domain_sessionidx = 1. Hence, to calculate the % of new visits, we need to sum all the visits where `domain_sessionidx` = 1 and divide by the total number of visits, in the time period.

First, we create a table with every visit stored, and identify which visits were "new":

{% highlight mysql %}
SELECT
MIN(collector_dt) AS `date`,
CONCAT(domain_userid, "-", domain_sessionidx) AS `session`,
IF(domain_sessionidx = 1, 1, 0)  AS new_visit
FROM `events_008`
GROUP BY `session`
{% endhighlight %}

Then we aggregate the visits over our desired time period, and calculate the fraction of them that are new:

{% highlight mysql %}
SELECT
date,
sum(new_visit)/count(session) as fraction_of_visits_that_are_new
FROM (
	SELECT
	MIN(collector_dt) AS `date`,
	CONCAT(domain_userid, "-", domain_sessionidx) AS `session`,
	IF(domain_sessionidx = 1, 1, 0)  AS new_visit
	FROM `events_008`
	GROUP BY `session`) v
GROUP BY `date`
ORDER BY `date`;
{% endhighlight %}

In ChartIO:

![fraction-of-visits-per-day-where-the-visitor-is-new][fraction-of-visits-per-day-where-the-visitor-is-new]

[Back to top](#top)

 <a name="duration"><h2>8. Average visitor duration</h2></a>

To calculate this, 1st we need to calculate the duration of every visit:

{% highlight mysql %}
CREATE TABLE visits (
domain_userid STRING,
domain_sessionidx STRING,
collector_dt STRING,
start_time STRING,
end_time STRING,
duration DOUBLE
) ;

INSERT OVERWRITE TABLE visits
SELECT
domain_userid,
domain_sessionidx,
MIN(collector_dt),
MIN(CONCAT(collector_dt," ",collector_tm)),
MAX(CONCAT(collector_dt," ",collector_tm)),
UNIX_TIMESTAMP(MAX(CONCAT(collector_dt," ",collector_tm)))-UNIX_TIMESTAMP(MIN(CONCAT(collector_dt," ",collector_tm)))
FROM events
GROUP BY domain_userid, domain_sessionidx ;
{% endhighlight %}

Then we simply average visit durations over the time period we're interested e.g. by day:

{% highlight mysql %}
SELECT
collector_dt,
AVG(duration)
FROM visits
GROUP BY collector_dt ;
{% endhighlight %}

Or by week:

{% highlight mysql %}
SELECT 
YEAR(collector_dt),
WEEKOFYEAR(collector_dt),
AVG(duration)
FROM visits
GROUP BY YEAR(collector_dt), WEEKOFYEAR(collector_dt) ;
{% endhighlight %}

Or by month:

{% highlight mysql %}
SELECT 
YEAR(collector_dt),
WEEKOFYEAR(collector_dt),
AVG(duration)
FROM visits
GROUP BY YEAR(collector_dt), MONTH(collector_dt) ;
{% endhighlight %}

[Back to top](#top)

 <a name="efficiency"><h2>9. A note about efficiency</h2></a>

Hive and Hadoop more generally are very powerful tools to process large volumes of data. However, data processing is an expensive task, in the sense that every time you execute the query, you have to pay EMR fees to crunch through your data. As a result, where possible, it is advisable not to repeat the same analysis multiple times: for repeated analyses you should save the results of the analysis, and only perform subsequent analysis on new data.

To take the example of logging the number of unique visitors by day: we could run a query to fetch calculate this data up to and included yesterday:

{% highlight mysql %}
SELECT 
collector_dt,
COUNT(DISTINCT (domain_userid))
FROM events
WHERE collector_dt < CURDATE()
GROUP BY collector_dt ;
{% endhighlight %}

We would then save this data in a suitable database / Excel spreadsheet, and add to it by querying just *new* data e.g.

{% highlight mysql %}
SELECT 
collector_dt,
COUNT(DISTINCT (domain_userid))
FROM events
WHERE collector_dt > '{{NEW DATES}}'
GROUP BY collector_dt ;
{% endhighlight %}

At the moment, the analyst has to manually append the new data to the old. Going forwards, we will build out the SnowPlow functionality so that it is straightforward to build ETL processes to migrate useful cuts of data into analytics databases for further analysis, where Hadoop / Hive is not required for that additional analysis.

[Back to top](#top)

 <a name="language"><h2>10. Demographics: language</h2></a>

For each event the browser language is stored in the `br_language` field. As a result, counting the number of visits in a time period by language is trivial:

{% highlight mysql %}
SELECT 
br_language,
COUNT(DISTINCT (CONCAT(domain_userid, domain_sessionidx))) AS visits
FROM events
WHERE [[ENTER-DESIRED-TIME-PERIOD]]
GROUP BY br_language 
ORDER BY COUNT(DISTINCT (CONCAT(domain_userid,'-', domain_sessionidx))) DESC ;
{% endhighlight %}

[Back to top](#top)

 <a name="location"><h2>11. Demographics: location</h2></a>

THIS NEEDS TO BE DONE IN CONJUNCTION WITH MAXIMIND DATABASE OR OTHER GEOIP DATABASE, BASED ON IP - TO WRITE

[Back to top](#top)

 <a name="new-vs-returning"><h2>2. Behaviour: new vs returning</h2></a>

Within a given time period, we can compare the number of new visitors (for whom `domain_sessionidx` = 1) with returning visitors (for whom `domain_sessionidx` > 1). First we create a visits table, and differentiate new visits from returning visits

{% highlight mysql %}
CREATE TABLE visits_with_new_vs_returning_info (
domain_userid STRING,
domain_sessionidx STRING,
new TINYINT,
returning TINYINT
) ;

INSERT OVERWRITE TABLE visits_with_new_vs_returning_info
SELECT
domain_userid,
domain_sessionidx,
IF((MAX(domain_sessionidx)=1),1,0),
IF((MAX(domain_sessionidx)>1),1,0)
FROM events
WHERE [[INSERT-TIME-PERIOD-RESTRICTIONS]]
GROUP BY domain_userid, domain_sessionidx ;
{% endhighlight %}

Now we can sum over the table to calculate the number of new visits vs returning visits

{% highlight mysql %}
SELECT
COUNT(domain_sessionidx) AS total_visits,
SUM(new) AS new_visitors,
SUM(returning) AS returning_visitors,
SUM(new)/COUNT(domain_sessionidx) AS fraction_new,
SUM(returning)/COUNT(domain_sessionidx) AS fraction_returning
FROM visits_with_new_vs_returning_info ;
{% endhighlight %}

[Back to top](#top)

 <a name="frequency"><h2>13. Behaviour: frequency</h2></a>

We can look at the distribution of users by number of visits they have performed in a given time period. First, we count the number of visits each user has performed in the specific time period:

{% highlight mysql %}
CREATE TABLE users_by_frequency (
domain_userid STRING,
visit_count INT
) ;

INSERT OVERWRITE TABLE users_by_frequency 
SELECT
domain_userid,
COUNT(DISTINCT (domain_sessionidx))
FROM events
WHERE [[INSERT-CONDITIONS-FOR-TIME-PERIOD-YOU-WANT-TO-EXAMINE]]
GROUP BY domain_userid ;
{% endhighlight %}

Now we need to categorise each user by the number of visits performed in the time period, and sum the number of users in each category:

{% highlight mysql %}
SELECT
visit_count,
COUNT(domain_userid)
FROM users_by_frequency
GROUP BY visit_count ;	
{% endhighlight %}

[Back to top](#top)

 <a name="recency"><h2>14. Behaviour: recency</h2></a>

We can look in a specific time period at each user who has visited, and see how many days it has been since they last visited. First, we identify all the users who have visited in our time frame, and grab the timestamp for their last event for each:

{% highlight mysql %}
CREATE TABLE users_by_recency (
domain_userid STRING,
last_action_timestamp STRING,
days_from_today BIGINT
) ;

INSERT OVERWRITE TABLE users_by_recency
SELECT
domain_userid,
MAX(CONCAT(collector_dt, " ", collector_tm)) AS last_action_timestamp,
CEILING((UNIX_TIMESTAMP() - UNIX_TIMESTAMP(MAX(CONCAT(collector_dt, " ", collector_tm))))/(60*60*24)) AS days_from_today
FROM events
WHERE collector_dt>'{{ENTER-START-DATE}}'
GROUP BY domain_userid ;
{% endhighlight %}

Now we categorise the users by the number of days since they last visited, and sum the number in each category:

{% highlight mysql %}
SELECT 
days_from_today,
COUNT( domain_userid )
FROM users_by_recency
GROUP BY days_from_today ;
{% endhighlight %}

[Back to top](#top)

 <a name="engagement"><h2>15. Behaviour: engagement</h2></a>

Google Analytics provides two sets of metrics to indicate *engagement*. We think that both are weak (the duration of each visit and the number of page views per visit). Nonetheless, they are both easy to measure using SnowPlow. To start with the duration per visit, we simply execute the following query:

{% highlight mysql %}
SELECT
domain_userid,
domain_sessionidx,
UNIX_TIMESTAMP(MAX(CONCAT(collector_dt," ",collector_tm)))-UNIX_TIMESTAMP(MIN(CONCAT(collector_dt," ",collector_tm))) AS duration
FROM events
WHERE {{ANY-TIME-PERIOD-LIMITATIONS}}
GROUP BY domain_userid, domain_sessionidx ;
{% endhighlight %}

In the same way, we can look at the number of page views per visit:

{% highlight mysql %}
SELECT
domain_userid,
domain_sessionidx,
COUNT(event_id)
FROM events
WHERE page_title IS NOT NULL
GROUP BY domain_userid, domain_sessionidx ;
{% endhighlight %}

[Back to top](#top)

 <a name="browser"><h2>16. Technology: browser</h2></a>

Browser details are stored in the events table in the `br_name`, `br_family`, `br_version`, `br_type`, `br_renderingengine`, `br_features` and `br_cookies` fields.

Looking at the distribution of visits by browser is straightforward:

{% highlight mysql %}
SELECT 
br_name,
COUNT( DISTINCT (CONCAT(domain_userid, domain_sessionidx)))
FROM events
WHERE [[ANY DATE CONDITIONS]]
GROUP BY br_name ;
{% endhighlight %}

If you didn't want to distinguish between different versions of the same browser in the results, replace `br_name` in the query with `br_family`.

[Back to top](#top)

 <a name="os"><h2>17. Technology: operating system</h2></a>

Operating system details are stored in the events table in the `os_name`, `os_family` and `os_manufacturer` fields.

Looking at the distribution of visits by operating system is straightforward:

{% highlight mysql %}
	SELECT
	os_name,
	COUNT( DISTINCT (CONCAT(domain_userid, '-', domain_sessionidx)))
	FROM events
	WHERE [[ANY DATE CONDITIONS]]
	GROUP BY os_name ;
{% endhighlight %}

[Back to top](#top)

 <a name="mobile"><h2>18. Technology: mobile</h2></a>

Mobile technology details are stored in the 4 device/hardware fields: `dvce_type`, `dvce_ismobile`, `dvce_screenwidth`, `dvce_screenheight`.

To work out how the number of visits in a given time period splits between visitors on mobile and those not, simply execute the following query:

{% highlight mysql %}
SELECT
dvce_ismobile,
COUNT( DISTINCT (CONCAT(domain_userid, '-', domain_sessionidx)))
FROM events
WHERE [[ANY DATE CONDITIONS]]
GROUP BY dvce_ismobile ;
{% endhighlight %}

To break down the number of visits from mobile users by device type execute the following query:

{% highlight mysql %}
SELECT
dvce_type,
COUNT( DISTINCT (CONCAT(domain_userid, domain_sessionidx)))
FROM events
WHERE [[ANY DATE CONDITIONS]] AND dvce_ismobile = TRUE
GROUP BY dvce_type ;
{% endhighlight %}

[Back to top](#top)


[page-ping]: /blog/2012/12/26/snowplow-0.6.5-released/
[measure-user-engagement]: /analytics/customer-analytics/user-engagement.html
[uniques-by-day]: /static/img/analytics/basic-recipes/uniques-by-day-chartio.png
[visits-by-day]: /static/img/analytics/basic-recipes/visits-by-day-chartio.png
[pageviews-by-day]: /static/img/analytics/basic-recipes/pageviews-by-day-chartio.png
[events-by-day]: /static/img/analytics/basic-recipes/events-by-day-chartio.png
[avg-pvs-per-visit-per-week-chartio]: /static/img/analytics/basic-recipes/avg-pvs-per-visit-per-week.png
[fraction-of-visits-per-day-that-bounce]: /static/img/analytics/basic-recipes/fraction-of-visits-per-day-that-bounce-chartio.png
[fraction-of-visits-per-day-where-the-visitor-is-new]: /static/img/analytics/basic-recipes/fraction-of-visits-per-day-where-the-visitor-is-new-chartio.png