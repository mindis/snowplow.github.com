---
layout: section
category: analytics
analytics_category: overview
title: Basic recipes
weight: 5
---


<a name="top"><h1>Bread and butter web analytics queries</h1></a>


The following queries return basic web analytics data that someone could expect from any standard web analytics package. These are *not* the queries that Snowplow was designed to perform: we built Snowplow to enable analysts to run queries on web analytics data that are **not** possible with other web analytics programs. These queries return the results that **all** web analytics queries return. However, running them can be useful for an analyst to validate Snowplow has been setup correctly (by comparing the output against e.g. Google Analytics), and help her get familiar with writing queries in Snowplow.

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
11. [Behavior: new vs returning](#new-vs-returning)
12. [Behavior: frequency](#frequency)
13. [Behavior: recency](#recency)
14. [Behavior: engagement](#engagement)
15. [Technology: browser](#browser)
16. [Technology: operating system](#os)
17. [Technology: mobile](#mobile)

 <a name="counting-unique-visitors"><h2>1. Number of unique visitors </h2></a>

The number of unique visitors can be calculated by summing the number of distinct `domain_userid`s in a specified time period. (Because each user is assigned a unique domain_userid, based on a lack of Snowplow tracking cookies on their browser):

{% highlight sql %}
/* Redshift / PostgreSQL */
select
to_char(collector_tstamp, 'YYYY-MM-DD') as "Date",
count(distinct(domain_userid)) as "Uniques"
from events
where collector_tstamp > current_date - integer '31'
group by Date
order by Date;
{% endhighlight %}

In ChartIO:

![uniques-by-day][uniques-by-day]

[Back to top](#top)

 <a name="counting-visits"><h2>2. Number of visits</h2></a>

Because each user might visit a site more than once, summing the number of `domain_userid`s returns the number if *visitors*, NOT the number of *visits*. Every time a user visits the site, however, Snowplow assigns that session with a `domain_sessionidx` (e.g. `1` for their first visit, `2` for their second.) Hence, to count the number of visits in a time period, we concatenate the unique `domain_userid` with the `domain_sessionidx` and then count the number of distinct concatenated entry in the events table:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
to_char(collector_tstamp, 'YYYY-MM-DD') as "Date",
count( distinct( domain_userid || '-' || domain_sessionidx )) AS "visits"
from events
where collector_tstamp > current_date - integer '31'
group by "Date" 
order by "Date";
{% endhighlight %}

In ChartIO:

![visits-by-day][visits-by-day]

[Back to top](#top)

 <a name="counting-pageviews"><h2>3. Number of page views</h2></a>

Page views are one type of event that are stored in the Snowplow events table. They can easily be identified using the `event` field, which is set to 'page_view'.

To count the number of page views by day, then we simply execute the following query:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
to_char(collector_tstamp, 'YYYY-MM-DD') as "Date",
count(*) AS "page_views"
from events
where collector_tstamp > current_date - integer '31'
and event = 'page_view'
group by "Date" 
order by "Date";
{% endhighlight %}

In ChartIO:

![pageviews-by-day][pageviews-by-day]

[Back to top](#top)

 <a name="counting-events"><h2>4. Number of events</h2></a>

Although the number of page views is a standard metric in web analytics, this reflects the web's history as a set of hyperlinked documents rather than the modern reality of web applications that are comprise lots of AJAX events (that need not necessarily result in a page load.)

As a result, counting the total number of events (including page views but also other AJAX events) is actually a more meaningful thing to do than to count the number of page views, as we have done above. We recommend setting up Snowplow so that *all* events / actions that a user takes are tracked. Hence, running the below queries should return a total sum of events on the site by time period:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
to_char(collector_tstamp, 'YYYY-MM-DD') as "Date",
count(*) AS "events"
from events
where collector_tstamp > current_date - integer '31'
group by "Date" 
order by "Date";
{% endhighlight %}

In ChartIO:

![events-by-day][events-by-day]

[Back to top](#top)

 <a name="pages-per-visit"><h2>5. Pages per visit</h2></a>

The number of pages per visit can be calculated by visit very straightforwardly:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
domain_userid || '-' || domain_sessionidx AS "session",
count(*) as "pages_visited"
from events
where event = 'page_view'
and collector_tstamp > current_date - integer '31'
group by session;
{% endhighlight %}

We can then aggregate our data by number of pages per visit, to produce a frequency table:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
pages_visited,
count(*) as "frequency"
from (
	select
	domain_userid || '-' || domain_sessionidx AS "session",
	count(*) as "pages_visited"
	from events
	where event = 'page_view'
	group by session
) as page_view_per_visit
group by pages_visited
order by pages_visited;
{% endhighlight %}

In ChartIO:

![page-views-per-visit-frequency-table-chartio][page-views-per-visit-frequency-table-chartio]

[Back to top](#top)

 <a name="bounce-rate"><h2>6. Bounce rate</h2></a>

First we need to identify all the sessions that were 'bounces'. These are visits where there is only a single event captured: the initial page view:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
domain_userid,
domain_sessionidx,
min(collector_tstamp) as "time_first_touch",
count(*) as "number_of_events",
case when count(*) = 1 then 1 else 0 end as bounces
from events
where collector_tstamp > current_date - integer '31'
group by domain_userid, domain_sessionidx
{% endhighlight %}

This query returns a line of data for every session. For each, it logs a timestamp, the number of events, and a flag that is set to 1 if the visitor bounced.

To calculate bounce rate by day, we take the above table, aggregate the results by day, sum the number of bounces and divide it by the total number of sessions:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
to_char(time_first_touch, 'YYYY-MM-DD') AS "Date",
sum(bounces)::real/count(*) as "Bounce rate"
from (
	select
	domain_userid,
	domain_sessionidx,
	min(collector_tstamp) as "time_first_touch",
	count(*) as "number_of_events",
	case when count(*) = 1 then 1 else 0 end as bounces
	from events
	where collector_tstamp > current_date - integer '31'
	group by domain_userid, domain_sessionidx
) v
group by Date
order by Date;
{% endhighlight %}

Note that we have to cast sum(bounces) as a 'real' number, to force Redshift / PostgreSQL to output a real number rather than an integer for the bounce rate.

In ChartIO:

![fraction-of-visits-per-day-that-bounce][fraction-of-visits-per-day-that-bounce]

[Back to top](#top)

 <a name="new-visits"><h2>7. % New visits</h2></a>

A new visit is easily identified as a visit where the domain_sessionidx = 1. Hence, to calculate the % of new visits, we need to sum all the visits where `domain_sessionidx` = 1 and divide by the total number of visits, in the time period.

First, we create a table with every visit stored, and identify which visits were "new":

{% highlight mysql %}
/* Redshift / PostgreSQL */
select
min(collector_tstamp) AS "time_first_touch",
domain_userid, 
domain_sessionidx,
case when domain_sessionidx = 1 then 1 else 0 end as "first_visit"
from events
where collector_tstamp > current_date - integer '31'
group by domain_userid, domain_sessionidx
{% endhighlight %}

Then we aggregate the visits over our desired time period, and calculate the fraction of them that are new:

{% highlight mysql %}
/* Redshift / PostgreSQL */
select
to_char(time_first_touch, 'YYYY-MM-DD') as "Date",
sum(first_visit)::real/count(*) as "fraction_of_visits_that_are_new"
from (
	select
	min(collector_tstamp) AS "time_first_touch",
	domain_userid, 
	domain_sessionidx,
	case when domain_sessionidx = 1 then 1 else 0 end as "first_visit"
	from events
	where collector_tstamp > current_date - integer '31'
	group by domain_userid, domain_sessionidx) v
group by "date"
ORDER BY "date";
{% endhighlight %}

In ChartIO:

![fraction-of-visits-per-day-where-the-visitor-is-new][fraction-of-visits-per-day-where-the-visitor-is-new]

[Back to top](#top)

<a name="duration"><h2>8. Average visitor duration</h2></a>

To calculate this, 1st we need to calculate the duration of every visit:

{% highlight mysql %}
/* Redshift / PostgreSQL */
select
domain_userid,
domain_sessionidx,
min(collector_tstamp) as "start_time",
max(collector_tstamp) as "finish_time",
max(collector_tstamp) - min(collector_tstamp) as "duration"
from events
where collector_tstamp > current_date - integer '31'
group by domain_userid, domain_sessionidx;
{% endhighlight %}

Then we simply average visit durations over the time period we're interested e.g. by day:

{% highlight mysql %}
/* Redshift / PostgreSQL */
select
to_char(start_time, 'YYYY-MM-DD') AS "Date",
avg(duration)/1000000 as "average_visit_duration_seconds"
from (
	select
	domain_userid,
	domain_sessionidx,
	min(collector_tstamp) as "start_time",
	max(collector_tstamp) as "finish_time",
	max(collector_tstamp) - min(collector_tstamp) as "duration"
	from events
	where collector_tstamp > current_date - integer '31'
	group by domain_userid, domain_sessionidx
) v
group by "Date"
order by "Date";
{% endhighlight %}

[Back to top](#top)

<a name="language"><h2>9. Demographics: language</h2></a>

For each event the browser language is stored in the `br_language` field. As a result, counting the number of visitors in a time period by language is trivial:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
br_lang,
count(distinct(domain_userid)) as "visitors"
from events
where collector_tstamp > current_date - integer '31'
group by br_lang
order by "visitors" desc;
{% endhighlight %}

In ChartIO:

![visitors-by-language-chartio][visitors-by-language-chartio]

[Back to top](#top)

<a name="location"><h2>10. Demographics: location</h2></a>

We can identify the geographic location of users using the `geo_country`, `geo_region`, `geo_city`, `geo_zipcode`, `geo_latitude` and `geo_longitude` fields.

To calculate the number of visitors in the last month by country, simply execute:

{% highlight mysql %}
/* Redshift / PostgreSQL */
SELECT
geo_country,
count(distinct(domain_userid)) as "visitors"
from events
where collector_tstamp > current_date - integer '31'
group by geo_country
order by "visitors" desc;
{% endhighlight %}

In ChartIO:

![visitors-by-country][visitors-by-country-chartio]

To create a geographical plot, you'll need to use another tool like [R] [r] or [Tableau] [tableau].

[Back to top](#top)

 <a name="new-vs-returning"><h2>11. Behavior: new vs returning</h2></a>

Within a given time period, we can compare the number of new visitors (for whom `domain_sessionidx` = 1) with returning visitors (for whom `domain_sessionidx` > 1): 

{% highlight sql %}
/* Redshift / PostgreSQL */
select
domain_userid,
domain_sessionidx,
min(collector_tstamp) as time_first_touch,
case when domain_sessionidx = 1 then 'new' else 'returning' end as "new_vs_returning"
from events
where collector_tstamp > current_date - integer '31'
group by domain_userid, domain_sessionidx
{% endhighlight %}

Then we can aggregate them by time period, to get the total new vs returning e.g. by day:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
to_char(time_first_touch, 'YYYY-MM-DD') AS "Date",
"new_vs_returning" As "New vs returning",
count(*) AS "Number of visits"
from (
	select
	domain_userid,
	domain_sessionidx,
	min(collector_tstamp) AS time_first_touch,
	case when domain_sessionidx = 1 then 'new' else 'returning' end as "new_vs_returning"
	from events
	where collector_tstamp > current_date - integer '31'
	group by domain_userid, domain_sessionidx
) v
group by "Date", "New vs returning"
order by "Date", "New vs returning"
{% endhighlight %}

In ChartIO:

![new-vs-returning-visits-by-day][new-vs-returning-visits-by-day]

[Back to top](#top)

 <a name="frequency"><h2>12. Behavior: frequency</h2></a>

We can plot the distribution of visits in a time period by the number of visits each visitor has performed:

{% highlight sql %}
select
domain_sessionidx as "Number of visits",
count(distinct(domain_userid)) as "Frequency"
from events
where collector_tstamp > current_date - integer '31'
group by "Number of visits"
order by "Number of visits"
{% endhighlight %}

In ChartIO:

![distribution-of-visitors-by-number-of-visits][distribution-of-visitors-by-number-of-visits]

[Back to top](#top)

 <a name="recency"><h2>13. Behavior: recency</h2></a>

We can plot the distribution of visits by the number of days since the previous visit. To do this, we first identify all the visits in our time period:

{% highlight mysql %}
/* Redshift / PostgreSQL */
select
domain_userid,
domain_sessionidx,
domain_sessionidx - 1 as "previous_domain_sessionidx",
min(collector_tstamp) as "time_first_touch"
from events
where collector_tstamp > current_date - integer '31'
group by domain_userid, domain_sessionidx
{% endhighlight %}

We can join the above table with a similar table, but join each visit to data for the previous visit, so we can calculate the number of days between visits:

{% highlight mysql %}
/* Redshift / PostgreSQL */
select
n.domain_userid,
n.domain_sessionidx,
extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 as "days_between_visits",
case 
	when n.domain_sessionidx = 1 then '0'
	when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 1 then '1'
	when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 2 then '2'
	when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 3 then '3'
	when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 4 then '4'
	when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 5 then '5'
	when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 10 then '6-10'
	when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 25 then '11-25'
	else '25+' end as "Days between visits"
from (
	select
	domain_userid,
	domain_sessionidx,
	domain_sessionidx - 1 as "previous_domain_sessionidx",
	min(collector_tstamp) as "time_first_touch"
	from events
	where collector_tstamp > current_date - integer '31'
	group by domain_userid, domain_sessionidx
) n
left join (
	select
	domain_userid,
	domain_sessionidx,
	min(collector_tstamp) as "time_first_touch"
	from events
	group by domain_userid, domain_sessionidx
) p on n.previous_domain_sessionidx = p.domain_sessionidx
and n.domain_userid = p.domain_userid
{% endhighlight %}

Finally, we group the results by the number of days between visits, to plot a frequency table:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
"Days between visits",
count(*) as "Number of visits"
from (
	select
	n.domain_userid,
	n.domain_sessionidx,
	extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 as "days_between_visits",
	case 
		when n.domain_sessionidx = 1 then '0'
		when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 1 then '1'
		when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 2 then '2'
		when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 3 then '3'
		when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 4 then '4'
		when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 5 then '5'
		when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 10 then '6-10'
		when extract(epoch from (n.time_first_touch - p.time_first_touch))/3600/24 < 25 then '11-25'
		else '25+' end as "Days between visits"
	from (
		select
		domain_userid,
		domain_sessionidx,
		domain_sessionidx - 1 as "previous_domain_sessionidx",
		min(collector_tstamp) as "time_first_touch"
		from events
		where collector_tstamp > current_date - integer '31'
		group by domain_userid, domain_sessionidx
	) n
	left join (
		select
		domain_userid,
		domain_sessionidx,
		min(collector_tstamp) as "time_first_touch"
		from events
		group by domain_userid, domain_sessionidx
	) p on n.previous_domain_sessionidx = p.domain_sessionidx
	and n.domain_userid = p.domain_userid
) t
group by "Days between visits"
order by "Days between visits"
{% endhighlight %}

In ChartIO:

![days-since-last-visit-in-chartio][days-since-last-visit-in-chartio]

[Back to top](#top)

 <a name="engagement"><h2>14. Behavior: engagement</h2></a>

Google Analytics provides two sets of metrics to indicate *engagement*:

1. Visit duration
2. Page depth (i.e. number of pages visited per session)

Both of these are flakey and unsophisticated measures of engagement. Nevertheless, they are easy to report on in Snowplow. To plot visit duration, we execute the following query: 

{% highlight sql %}
/* Redshift / PostgreSQL */
select
domain_userid,
domain_sessionidx,
case 
	when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 1800 then 'g. 1801+ seconds' 
	when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 600 then 'f. 601-1800 seconds' 
	when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 180 then 'e. 181-600 seconds' 
	when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 60 then 'd. 61 - 180 seconds' 
	when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 30 then 'c. 31-60 seconds' 
	when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 10 then 'b. 11-30 seconds' 
	else 'a. 0-10 seconds' end as "Visit duration"
from events
where collector_tstamp > current_date - integer '31'
group by domain_userid, domain_sessionidx;
{% endhighlight %}

Then we aggregate the results for each bucket, so we have frequency by bucket:

{% highlight mysql %}
/* Redshift / PostgreSQL */
select
"Visit duration",
count(*) as "Number of visits"
from (
	select
	domain_userid,
	domain_sessionidx,
	case 
		when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 1800 then 'g. 1801+ seconds' 
		when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 600 then 'f. 601-1800 seconds' 
		when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 180 then 'e. 181-600 seconds' 
		when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 60 then 'd. 61 - 180 seconds' 
		when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 30 then 'c. 31-60 seconds' 
		when extract(epoch from (max(dvce_tstamp)-min(dvce_tstamp))) > 10 then 'b. 11-30 seconds' 
		else 'a. 0-10 seconds' end as "Visit duration"
	from events
	where collector_tstamp > current_date - integer '31'
	group by domain_userid, domain_sessionidx
) t
group by "Visit duration"
order by "Visit duration"
{% endhighlight %}

We can then plot the results in ChartIO:

![visits-by-duration-chartio][visits-by-duration-chartio]

We can also look at the number of page views per visit:

{% highlight sql %}
/* Redshift / PostgreSLQ */ 
select
domain_userid,
domain_sessionidx,
count(*) as "Page views per visit"
from events
where collector_tstamp > current_date - integer '31'
and event = 'page_view'
group by domain_userid, domain_sessionidx;
{% endhighlight %}

We then aggregate those results together by the number of page views per visit

{% highlight sql %}
/* Redshift / PostgreSLQ */
select
"Page views per visit",
count(*) as "Number of visits"
from (
	select
	domain_userid,
	domain_sessionidx,
	count(*) as "Page views per visit"
	from events
	where collector_tstamp > current_date - integer '31'
	and event = 'page_view'
	group by domain_userid, domain_sessionidx
) t
group by "Page views per visit"
order by "Page views per visit"
{% endhighlight %}

In ChartIO:

![visits-in-the-last-month-by-page-depth][visits-in-the-last-month-by-page-depth]


[Back to top](#top)

 <a name="browser"><h2>15. Technology: browser</h2></a>

Browser details are stored in the events table in the `br_name`, `br_family`, `br_version`, `br_type`, `br_renderingengine`, `br_features` and `br_cookies` fields.

Looking at the distribution of visits by browser is straightforward:

{% highlight sql %}
/* Redshift / PostgreSQL */
select
br_family as "Browser",
count(distinct(domain_userid || domain_sessionidx)) as "Visits"
from events
group by "Browser"
order by "Visits" desc;
{% endhighlight %}

In ChartIO:

![visits-by-browser-type][visits-by-browser-type]


[Back to top](#top)

 <a name="os"><h2>16. Technology: operating system</h2></a>

Operating system details are stored in the events table in the `os_name`, `os_family` and `os_manufacturer` fields.

Looking at the distribution of visits by operating system is straightforward:

{% highlight sql %}
/* Redshift / PostgreSQL */
select 
os_name as "Operating System",
count(distinct(domain_userid || domain_sessionidx)) as "Visits"
from events
group by "Operating System"
order by "Visits" desc;
{% endhighlight %}

Again, we can plot the results in ChartIO:

![visits-by-operating-system][visits-by-operating-system]

[Back to top](#top)

 <a name="mobile"><h2>17. Technology: mobile</h2></a>

To work out how the number of visits in a given time period splits between visitors on mobile and those not, simply execute the following query:

{% highlight mysql %}
/* Redshift / PostgreSQL */
select 
case when dvce_ismobile=1 then 'mobile' else 'desktop' end as "Device type",
count(distinct(domain_userid || domain_sessionidx)) as "Visits"
from events
group by "Device type";
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
[new-vs-returning-visits-by-day]: /static/img/analytics/basic-recipes/new-vs-returning-visits-by-day-chartio.png
[distribution-of-visitors-by-number-of-visits]: /static/img/analytics/basic-recipes/distribution-of-visitors-by-number-of-visits.png
[days-since-last-visit-in-chartio]: /static/img/analytics/basic-recipes/days-since-last-visit-in-chartio.png
[visits-by-duration-chartio]: /static/img/analytics/basic-recipes/visits-by-duration-chartio.png
[visits-in-the-last-month-by-page-depth]: /static/img/analytics/basic-recipes/visits-in-last-month-by-page-depth-chartio.png
[visits-by-browser-type]: /static/img/analytics/basic-recipes/visits-by-browser-type-chartio.png
[visits-by-operating-system]: /static/img/analytics/basic-recipes/visits-by-operating-system-chartio.png
[split-in-visits-by-mobile-vs-desktop]: /static/img/analytics/basic-recipes/split-in-visits-by-mobile-vs-desktop-chartio.png
[page-views-per-visit-frequency-table-chartio]: /static/img/analytics/basic-recipes/page-views-per-visit-frequency-table-chartio.png
[visitors-by-country-chartio]: /static/img/analytics/basic-recipes/visitors-by-country-chartio.png 
[tableau]: http://www.tableausoftware.com/
[r]: http://cran.r-project.org/

