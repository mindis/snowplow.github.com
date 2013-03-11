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
9. [Demographics: language](#language)
10. [Demographics: location](#location)
11. [Behaviour: new vs returning](#new-vs-returning)
12. [Behaviour: frequency](#frequency)
13. [Behaviour: recency](#recency)
14. [Behaviour: engagement](#engagement)
15. [Technology: browser](#browser)
16. [Technology: operating system](#os)
17. [Technology: mobile](#mobile)

 <a name="counting-unique-visitors"><h2>1. Number of unique visitors </h2></a>

The number of unique visitors can be calculated by summing the number of distinct `domain_userid`s in a specified time period e.g. day. (Because each user is assigned a unique domain_userid, based on a lack of SnowPlow tracking cookies on their browser):

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT 
collector_dt AS date,
COUNT(DISTINCT(domain_userid)) AS uniques
FROM `events_008`
GROUP BY collector_dt
ORDER BY collector_dt;
{% endhighlight %}

Or by week:

{% highlight mysql %}
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
SELECT
CONCAT(domain_userid,"-",domain_sessionidx) AS `session`,
count(distinct(event_id)) AS page_views
FROM `events_008`
WHERE `event` = 'page_view'
GROUP BY `session`;
{% endhighlight %}

To calculate the average page views per week we group the results of the above query by week and then average over the results:

{% highlight mysql %}
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
SELECT
MIN(collector_dt) AS `date`,
CONCAT(domain_userid, "-", domain_sessionidx) AS `session`,
IF(domain_sessionidx = 1, 1, 0)  AS new_visit
FROM `events_008`
GROUP BY `session`
{% endhighlight %}

Then we aggregate the visits over our desired time period, and calculate the fraction of them that are new:

{% highlight mysql %}
/* HiveQL / MySQL */
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
/* HiveQL / MySQL */
SELECT
MIN(collector_dt) AS `date`,
CONCAT(domain_userid, "-", domain_sessionidx) AS `session`,
MIN(CONCAT(collector_dt, " ", collector_tm))  AS start_time,
MAX(CONCAT(collector_dt, " ", collector_tm)) AS finish_time,
UNIX_TIMESTAMP(MAX(CONCAT(collector_dt, " ", collector_tm))) - UNIX_TIMESTAMP(MIN(CONCAT(collector_dt, " ", collector_tm))) AS duration
FROM `events_008`
GROUP BY `session`;
{% endhighlight %}

Then we simply average visit durations over the time period we're interested e.g. by day:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
`date`,
AVG(`duration`) AS average_visit_duration
FROM (
	SELECT
	MIN(collector_dt) AS `date`,
	CONCAT(domain_userid, "-", domain_sessionidx) AS `session`,
	MIN(CONCAT(collector_dt, " ", collector_tm))  AS start_time,
	MAX(CONCAT(collector_dt, " ", collector_tm)) AS finish_time,
	UNIX_TIMESTAMP(MAX(CONCAT(collector_dt, " ", collector_tm))) - UNIX_TIMESTAMP(MIN(CONCAT(collector_dt, " ", collector_tm))) AS duration
	FROM `events_008`
	GROUP BY `session` )v
GROUP BY `date`
ORDER BY `date`;
{% endhighlight %}

In ChartIO:

![average-duration-by-month][average-duration-by-month]

[Back to top](#top)

<a name="language"><h2>9. Demographics: language</h2></a>

For each event the browser language is stored in the `br_language` field. As a result, counting the number of visitors in a time period by language is trivial:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
br_lang,
COUNT(DISTINCT(domain_userid)) AS visits
FROM `events_008_cf`
WHERE collector_dt>'2012-12-31'
GROUP BY br_lang
ORDER By visits DESC
{% endhighlight %}

Note that rather than dividing the visits by language, it may make more sense to divide 

In ChartIO:

![visitors-by-language-chartio][visitors-by-language-chartio]

[Back to top](#top)

<a name="location"><h2>10. Demographics: location</h2></a>

THIS NEEDS TO BE DONE IN CONJUNCTION WITH MAXIMIND DATABASE OR OTHER GEOIP DATABASE, BASED ON IP - TO WRITE

[Back to top](#top)

 <a name="new-vs-returning"><h2>11. Behaviour: new vs returning</h2></a>

Within a given time period, we can compare the number of new visitors (for whom `domain_sessionidx` = 1) with returning visitors (for whom `domain_sessionidx` > 1): 

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
MIN(collector_dt) AS `date`,
CONCAT(domain_userid, "-", domain_sessionidx) AS `session`,
IF(domain_sessionidx = 1, 1, 0)  AS new_visitor,
IF(domain_sessionidx >1, 1,0) AS returning_visitor
FROM `events_008_cf`
GROUP BY `session`
{% endhighlight %}

Then we can aggregate them by time period, to get the total new vs returning e.g. by day:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
`date`,
SUM(new_visitor) AS new_visits,
SUM(returning_visitor) AS returning_visits
FROM (
	SELECT
	MIN(collector_dt) AS `date`,
	CONCAT(domain_userid, "-", domain_sessionidx) AS `session`,
	IF(domain_sessionidx = 1, 1, 0)  AS new_visitor,
	IF(domain_sessionidx >1, 1,0) AS returning_visitor
	FROM `events_008_cf`
	GROUP BY `session` ) v
GROUP BY `date`
ORDER BY `date`
{% endhighlight %}

In ChartIO we would plot this by creating two layers: one for "new visits" and the other for "returning visits". The combined graph would then look like:

![new-vs-returning-visits-by-day][new-vs-returning-visits-by-day]

[Back to top](#top)

 <a name="frequency"><h2>12. Behaviour: frequency</h2></a>

We can look at the distribution of users by number of visits they have performed in a given time period. First, we count the number of visits each user has performed in the specific time period:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
domain_userid,
count(distinct(domain_sessionidx)) AS visits
FROM `events_008_cf`
WHERE collector_dt>'2012-12-31'
GROUP BY domain_userid;
{% endhighlight %}

Now we aggregate that data set by the number of visits in the time period:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
`visits`,
COUNT(DISTINCT(domain_userid))
FROM (
	SELECT
	domain_userid,
	count(distinct(domain_sessionidx)) AS visits
	FROM `events_008_cf`
	WHERE collector_dt>'2012-12-31'
	GROUP BY domain_userid ) v
GROUP BY `visits`
ORDER BY `visits`; 
{% endhighlight %}

In ChartIO:

![distribution-of-visitors-by-number-of-visits][distribution-of-visitors-by-number-of-visits]

[Back to top](#top)

 <a name="recency"><h2>13. Behaviour: recency</h2></a>

We can look in a specific time period at each user who has visited, and see how many days it has been since they last visited. First, we identify all the users who have visited in our time frame:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
domain_userid,
domain_sessionidx AS current_visit,
IF(domain_sessionidx >1, domain_sessionidx - 1, NULL) AS previous_visit
FROM `events_008_cf`
WHERE collector_dt>'2012-12-31'
GROUP BY domain_userid, domain_sessionidx
{% endhighlight %}

We can then look up the date of each session by joining the above results with the results of a query that identifies the date by session:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
domain_userid,
domain_sessionidx,
MIN(collector_dt)
FROM `events_008_cf`
GROUP BY domain_userid, domain_sessionidx
{% endhighlight %}

The combined query then looks like this:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
v.domain_userid, 
v.current_visit,
current.`date` AS `current_date`,
previous.`date` AS `previous_date`,
DATEDIFF(current.`date`, previous.`date`) AS difference
FROM (
	SELECT
	domain_userid,
	domain_sessionidx AS current_visit,
	IF(domain_sessionidx >1, domain_sessionidx - 1, NULL) AS previous_visit
	FROM `events_008_cf`
	WHERE collector_dt>'2012-12-31'
	GROUP BY domain_userid, domain_sessionidx
	HAVING previous_visit IS NOT NULL) v
JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	MIN(collector_dt) AS `date`
	FROM `events_008_cf`
	GROUP BY domain_userid, domain_sessionidx
) current
ON v.domain_userid = current.domain_userid
AND v.current_visit = current.domain_sessionidx
JOIN (
	SELECT
	domain_userid,
	domain_sessionidx,
	MIN(collector_dt) AS `date`
	FROM `events_008_cf`
	GROUP BY domain_userid, domain_sessionidx
) previous
ON v.domain_userid = previous.domain_userid
AND v.previous_visit = previous.domain_sessionidx
{% endhighlight %}

We can then aggregate the results by the number of days difference, to produce a frequency table:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
difference,
count(*) as frequency
FROM (
	SELECT
	v.domain_userid, 
	v.current_visit,
	current.`date` AS `current_date`,
	previous.`date` AS `previous_date`,
	DATEDIFF(current.`date`, previous.`date`) AS difference
	FROM (
		SELECT
		domain_userid,
		domain_sessionidx AS current_visit,
		IF(domain_sessionidx >1, domain_sessionidx - 1, NULL) AS previous_visit
		FROM `events_008_cf`
		WHERE collector_dt>'2012-12-31'
		GROUP BY domain_userid, domain_sessionidx
		HAVING previous_visit IS NOT NULL) v
	JOIN (
		SELECT
		domain_userid,
		domain_sessionidx,
		MIN(collector_dt) AS `date`
		FROM `events_008_cf`
		GROUP BY domain_userid, domain_sessionidx
	) current
	ON v.domain_userid = current.domain_userid
	AND v.current_visit = current.domain_sessionidx
	JOIN (
		SELECT
		domain_userid,
		domain_sessionidx,
		MIN(collector_dt) AS `date`
		FROM `events_008_cf`
		GROUP BY domain_userid, domain_sessionidx
	) previous
	ON v.domain_userid = previous.domain_userid
	AND v.previous_visit = previous.domain_sessionidx
) r
GROUP BY difference
ORDER BY difference
{% endhighlight %}

And plot the results in ChartIO:

![days-since-last-visit-in-chartio][days-since-last-visit-in-chartio]

[Back to top](#top)

 <a name="engagement"><h2>14. Behaviour: engagement</h2></a>

Google Analytics provides two sets of metrics to indicate *engagement*:

1. Visit duration
2. Page depth (i.e. number of pages visited per session)

Both of these are flakey and unsophisticated measures of engagement. Nevertheless, they are easy to report on in SnowPlow. To plot visit duration, we execute the following query: 

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
domain_userid,
domain_sessionidx,
UNIX_TIMESTAMP(MAX(CONCAT(collector_dt," ",collector_tm)))-UNIX_TIMESTAMP(MIN(CONCAT(collector_dt," ",collector_tm))) AS duration
FROM events_008_cf
WHERE collector_dt > '2012-12-31'
GROUP BY domain_userid, domain_sessionidx ;
{% endhighlight %}

We then need to classify each visit into a finite set of buckets based on their duration:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT 
v.domain_userid,
v.domain_sessionidx,
CASE 
	WHEN duration > 1800 THEN 'g. 1801+ seconds'
	WHEN duration > 600 THEN 'f. 601-1800 seconds'
	WHEN duration > 180 THEN 'e. 181-600 seconds'
	WHEN duration > 60 THEN 'd. 61 - 180 seconds'
	WHEN duration > 30 THEN 'c. 31-60 seconds'
	WHEN duration > 10 THEN 'b. 11-30 seconds'
	ELSE 'a. 0-10 seconds'
	END AS duration
FROM (
	SELECT
	domain_userid,
	domain_sessionidx,
	UNIX_TIMESTAMP(MAX(CONCAT(collector_dt," ",collector_tm)))-UNIX_TIMESTAMP(MIN(CONCAT(collector_dt," ",collector_tm))) AS duration
	FROM events_008_cf
	WHERE collector_dt > '2012-12-31'
	GROUP BY domain_userid, domain_sessionidx ) v;
{% endhighlight %}

Then aggregate the results for each bucket, so we have frequency by bucket:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
duration,
COUNT(*) as frequency
FROM (
	SELECT 
	v.domain_userid,
	v.domain_sessionidx,
	CASE 
		WHEN duration > 1800 THEN 'g. 1801+ seconds'
		WHEN duration > 600 THEN 'f. 601-1800 seconds'
		WHEN duration > 180 THEN 'e. 181-600 seconds'
		WHEN duration > 60 THEN 'd. 61 - 180 seconds'
		WHEN duration > 30 THEN 'c. 31-60 seconds'
		WHEN duration > 10 THEN 'b. 11-30 seconds'
		ELSE 'a. 0-10 seconds'
		END AS duration
	FROM (
		SELECT
		domain_userid,
		domain_sessionidx,
		UNIX_TIMESTAMP(MAX(CONCAT(collector_dt," ",collector_tm)))-UNIX_TIMESTAMP(MIN(CONCAT(collector_dt," ",collector_tm))) AS duration
		FROM events_008_cf
		WHERE collector_dt > '2012-12-31'
		GROUP BY domain_userid, domain_sessionidx ) v ) r
GROUP BY duration
ORDER BY duration;
{% endhighlight %}

We can then plot the results in ChartIO:

![visits-by-duration-chartio][visits-by-duration-chartio]

We can also look at the number of page views per visit

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
domain_userid,
domain_sessionidx,
COUNT(event_id) AS page_depth
FROM events_008_cf
WHERE event = 'page_view'
AND collector_dt > CURDATE() - 31
GROUP BY domain_userid, domain_sessionidx ;
{% endhighlight %}

Then aggregate sessions by page depth into a frequency table:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT
page_depth,
COUNT(*) AS frequency
FROM (
	SELECT
	domain_userid,
	domain_sessionidx,
	COUNT(event_id)  AS page_depth
	FROM events_008_cf
	WHERE event = 'page_view'
	AND collector_dt > CURDATE() - 31
	GROUP BY domain_userid, domain_sessionidx ) v
GROUP BY page_depth
ORDER BY page_depth;
{% endhighlight %}

And plot the results in ChartIO:

![visits-in-the-last-month-by-page-depth][visits-in-the-last-month-by-page-depth]


[Back to top](#top)

 <a name="browser"><h2>15. Technology: browser</h2></a>

Browser details are stored in the events table in the `br_name`, `br_family`, `br_version`, `br_type`, `br_renderingengine`, `br_features` and `br_cookies` fields.

Looking at the distribution of visits by browser is straightforward:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT 
br_name,
COUNT(DISTINCT(CONCAT(domain_userid,'-',domain_sessionidx))) AS frequency
FROM `events_008_cf`
WHERE collector_dt>CURDATE() - 31
GROUP BY br_name
ORDER BY frequency DESC
{% endhighlight %}

Plotting the results in ChartIO:

![visits-by-browser-type][visits-by-browser-type]


[Back to top](#top)

 <a name="os"><h2>16. Technology: operating system</h2></a>

Operating system details are stored in the events table in the `os_name`, `os_family` and `os_manufacturer` fields.

Looking at the distribution of visits by operating system is straightforward:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT 
os_name,
COUNT(DISTINCT(CONCAT(domain_userid,'-',domain_sessionidx))) AS frequency
FROM `events_008_cf`
WHERE collector_dt>CURDATE() - 31
GROUP BY os_name
ORDER BY frequency DESC
{% endhighlight %}

Again, we can plot the results in ChartIO:

![visits-by-operating-system][visits-by-operating-system]

[Back to top](#top)

 <a name="mobile"><h2>17. Technology: mobile</h2></a>

To work out how the number of visits in a given time period splits between visitors on mobile and those not, simply execute the following query:

{% highlight mysql %}
/* HiveQL / MySQL */
SELECT 
IF(dvce_ismobile=1, 'mobile', 'desktop') AS device_type,
COUNT(DISTINCT(CONCAT(domain_userid, "-", domain_sessionidx))) as frequency
FROM `events_008_cf`
GROUP BY dvce_ismobile;
{% endhighlight %}

Plotting the results in ChartIO:

![split-in-visits-by-mobile-vs-desktop][split-in-visits-by-mobile-vs-desktop]

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
[average-duration-by-month]: /static/img/analytics/basic-recipes/average-visit-duration-by-month-chartio.png
[visitors-by-language-chartio]: /static/img/analytics/basic-recipes/visitors-by-language-chartio.png
[new-vs-returning-visits-by-day]: /static/img/analytics/basic-recipes/new-vs-returning-visits-by-day.png
[distribution-of-visitors-by-number-of-visits]: /static/img/analytics/basic-recipes/distribution-of-visitors-by-number-of-visits-chartio.png
[days-since-last-visit-in-chartio]: /static/img/analytics/basic-recipes/days-since-last-visit-in-2013-chartio.png
[visits-by-duration-chartio]: /static/img/analytics/basic-recipes/visits-by-duration-chartio.png
[visits-in-the-last-month-by-page-depth]: /static/img/analytics/basic-recipes/visits-in-the-last-month-by-page-depth-chartio.png
[visits-by-browser-type]: /static/img/analytics/basic-recipes/visits-by-browser-type-chartio.png
[visits-by-operating-system]: /static/img/analytics/basic-recipes/visits-by-operating-system.png
[split-in-visits-by-mobile-vs-desktop]: /static/img/analytics/basic-recipes/split-in-visits-by-mobile-vs-desktop.png