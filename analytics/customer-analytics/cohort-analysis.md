---
layout: section
category: analytics
analytics_category: customer
title: Cohort Analysis
weight: 6
---

# Performing cohort analyses with Snowplow

1. [What is cohort analysis?](#what)
2. [Steps to performing a cohort analysis](#steps)

 <a name="what"><h2>What is a cohort analysis?</h2></a>

A cohort analysis is a longitudal study that compares two or more groups of customers / users (cohorts) over a period of time. The term cohort analysis therefore encompasses a wide variety of analyses:

1. **We can vary our cohort definitions, depending on what we want to test**. (For example, if we wanted to see if customers acquired from particular marketing channels were more valuable over their lifetimes, we'd define our cohorts based on the customer acquisition channel. On the other hand, if we wanted to see if we've got better at converting freemium users to paid users over time, we'd compare cohorts of users who started with the service a long time ago, with those that started more recently: defining our cohorts by month joined.) 
2. **We can vary the metric we are comparing between are cohorts**. (For example, comparing the average lifetime value of customers in each cohort, or retention levels by cohort)

For more detail on the variations possible with cohort analyses, see [this Keplar blog post] [varieties-of-cohort-analyses].

<a name="steps"><h2>Steps to performing a cohort analysis</h2></a>

All cohort analyses can be performed with the following steps:

1. [Cohort definition](#cohort-definition): write a query that links each user ID (usually the `domain_userid` or `network_userid`) with with the appropriate cohort (group)
2. [Metric definition](#metric-definition): write a query that calculates the required metric for each user
3. [Combine the results](#combinetheresults) from the above two queries to calculate an aggregated metric for each cohort

<a name="cohort-definition"><h2>1. Cohort definition</h2></a>

Regardless of the type of cohort analysis we want to perform, we start by mapping user IDs to cohorts:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW user_cohort_map AS
SELECT
domain_userid,
... AS cohort,
FROM "atomic".events
GROUP BY 1,2;
{% endhighlight %}


### 1a. Defining cohorts by when a user first visits the website

In this case we want to compare users who first visited us in January with those that first visited us in February, March, April etc.

To do this, we need to lookup the timestamp from when a user first visited the site (i.e. the minimum value for `collector_tstamp` for each user) and then group users by month:
	
{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_user_map_month_first_touch_website AS
SELECT
domain_userid,
DATE_TRUNC('month', MIN(collector_tstamp)) AS cohort
FROM "atomic".events
GROUP BY 1;
{% endhighlight %}


### 1b. Definine a cohort by when a user first performed a specific action

For many SaaS providers, it is not when a user first visits the site that is really important, but when a user actually signed up for a service, or performed some other specific action for the first time. 

In this case we use a variation of the above query:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_user_map_month_signed_up AS
SELECT
domain_userid,
DATE_TRUNC('month', MIN(collector_tstamp)) AS cohort
FROM "atomic".events
WHERE se_action = 'sign-up'
GROUP BY domain_userid;
{% endhighlight %} 

Note that the above query assumes that a signup is tracked using [custom structured event tracking] [custom-structured-events], where the event action field is set to 'sign-up'.

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW user_cohort_map AS
SELECT
DATE_TRUNC('month', MIN(collector_tstamp)) AS cohort,
domain_userid
FROM "atomic".events
WHERE 
event='pageview'
AND page_urlpath = ... ; 
{% endhighlight %}

### 1c. Definine a cohort by the channel a user was acquired on

This is important if we want to e.g. compare the lifetime value of customers acquired from different channels.

In this case, we need to look again at the first time a user visited the site, see how they were referred to the site, and then classify them by cohort accordingly. If we were interested in compare users who'd found the site organically, vs those from CPC campaigns, vs those referred from 3rd party sites, for example, we'd look at the `mkt_medium` field:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_user_map_month_signed_up AS
SELECT
domain_userid,
mkt_medium
FROM (
	SELECT 
	domain_userid, 
	mkt_medium,
 	rank() over (partition by domain_userid order by collector_tstamp) AS r
	FROM "atomic".events
	WHERE mkt_medium IS NOT NULL
	AND mkt_medium != ''
) t
WHERE r = 1;
>>>>>>> ddc89ffd8dc889cf7f1930a88c945e530824d2c9
{% endhighlight %}

Alternatively, we might want to distinguish between CPC traffic from Google with other PPC sources. In this case we would use a combination of `mkt_source` and `mkt_medium` to define our cohorts:

<<<<<<< HEAD
{% highlight mysql %}
/* PostgreSQL / Redshift */
CREATE VIEW user_cohort_map AS
SELECT
mkt_medium AS channel_medium_acquired,
mkt_source As channel_source_acquired,
DATE_TRUNC('month', MIN(collector_tstamp)) AS month_acquired,
domain_userid
FROM events
WHERE domain_sessionidx=1
GROUP BY 1,2,4;
=======
{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_user_map_month_signed_up AS
SELECT
domain_userid,
mkt_medium,
mkt_source
FROM (
	SELECT 
	domain_userid, 
	mkt_medium,
	mkt_source,
  	rank() over (partition by domain_userid order by collector_tstamp) AS r
	FROM "atomic".events
	WHERE mkt_medium IS NOT NULL
	AND mkt_medium != ''
) t
WHERE r = 1;
>>>>>>> ddc89ffd8dc889cf7f1930a88c945e530824d2c9
{% endhighlight %}

By including the other marketing fields (`mkt_term`, `mkt_content`, `mkt_name`) we can define cohorts more precisely e.g. to compare users acquired with different keyword combinations, or who had seen different ad versions.

<<<<<<< HEAD
We may want to define cohorts based on a the `refr_...` rather than `mkt_...` fields (e.g. because we are interested in comparing the behaviour of users from organic rather than paid campaigns), or define our cohorts based a combination of `refr_...` and `mkt_...` fields.

### 1d. Other ways to define cohorts
=======
By adding in other variables e.g. what month the user was acquired, we can build more sophisticated cohorts e.g. users acquired on Adwords in January vs users acquired on Facebook in February.
>>>>>>> ddc89ffd8dc889cf7f1930a88c945e530824d2c9

### 1d. Other ways to define cohorts

<<<<<<< HEAD
=======
Snowplow makes it possible to define cohorts based on a wide variety of criteria, including definitions obtained from data that exists outside of Snowplow. (This data will need to be uploaded to Snowplow before it can be used.) For more information, [get in touch] [get-in-touch].

>>>>>>> ddc89ffd8dc889cf7f1930a88c945e530824d2c9
<a name="metric-definition"><h2>2. Metric definitions</h2></a>

As a second step, we need to define a query that measure the _thing_ we want to compare between our cohorts. We therefore need to populate a table like the one below:

{% highlight sql %}
<<<<<<< HEAD
CREATE VIEW metric_by_user  AS
SELECT
domain_userid,
DATE_TRUNC('month', collector_tstamp) AS month,
... AS metric
FROM "atomic".events
GROUP BY 1,2
=======
/* Pseudo-SQL */
CREATE VIEW metric_by_user AS (
domain_userid,
[[time period]],
[[metric value]]
FROM "atomic".events
) ;
>>>>>>> ddc89ffd8dc889cf7f1930a88c945e530824d2c9
{% endhighlight %}

There is a wide range `metric_value`s we might want to compare between cohorts: most either get at how engaged a particular cohort is, or how valuable a particular cohort is. 

### 2a. Measuring user retention

Tracking retention levels by cohort is one of the most common types of cohort analysis. In this case, we simply check to see how many of our original cohort return, each time period, to continue to use our service.

If retention simply means return to our website, we can measure this using the following query:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.retention_by_user_by_month AS
SELECT
domain_userid,
DATE_TRUNC('month', collector_tstamp) AS months_active
FROM "atomic".events
GROUP BY 1,2;
{% endhighlight %}

### 2b. Measuring user engagement

There are a [wide variety of ways to measure user engagement][user-engagement]. Here we give just a couple of examples:

To start with, we could look at the number of actions / events performed by each user each month:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW actions_by_user AS
SELECT
domain_userid,
DATE_TRUNC('month', collector_tstamp) AS month,
COUNT(*) AS number_of_events_per_month
FROM "atomic".events
GROUP BY 1,2
{% endhighlight %}

Alternatively, we might want to just look at the average number of visits per month. (Maybe we're doing the analysis for a search or affiliate site, that aims to build a loyal base of repeat users who visit the site frequently but then get off it quickly onto other sites where they make purchases.)

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW visits_by_user_by_month AS
SELECT
domain_userid,
DATE_TRUNC('month', collector_tstamp) AS month
COUNT(DISTINCT(domain_sessionidx)) AS number_of_visits
FROM "atomic".events
GROUP BY 1,2;
{% endhighlight %}

### 2c. Measuring customer value

There are a [wide variety of ways to measure customer value and lifetime value][clv]. Here we give just one example - for a retailer that wants to compare purchase value per month:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW revenue_by_user_by_month AS
SELECT
domain_userid,
DATE_TRUNC('month', collector_tstamp) AS month,
SUM(tr_total) AS revenue
FROM "atomic".events
WHERE event LIKE 'transaction'
GROUP BY 1
{% endhighlight %}

### 2d. Other metrics to compare

Snowplow makes it possible to compare a large number of other metrics. For specific help / questions, [get in touch] [get-in-touch].

<a name="combinetheresults"><h2>3. Combining the results in the final cohort analysis</h2></a>

To perform the actual cohort analysis, we `JOIN` our two tables: the user-cohort-map table and our user-metric table, and aggregate results by cohort by time period so that we can compare them alongside each other. To take the most complex example of comparing retention levels by cohort, where cohort is defined by the month the user first signed up (complex because for this cohort definition, it makes sense to replace "Month" with a rank, so that we can compare month 1 retention for users who signed up in August with those in September), the following query does the trick:

{% highlight sql %}
/* PostgreSQL / Redshift */
CREATE VIEW recipes_customer.cohort_retention_by_month AS
SELECT
cohort,
months_active,
rank() OVER (PARTITION BY cohort ORDER BY months_active ASC) AS "Month",
COUNT(DISTINCT(m.domain_userid)) AS uniques,
COUNT(DISTINCT(m.domain_userid)) / (first_value(COUNT(DISTINCT(m.domain_userid))) OVER (PARTITION BY cohort))::REAL AS fraction_retained
FROM recipes_customer.cohort_user_map_week_first_touch_website c
JOIN recipes_customer.retention_by_user_by_month m
ON c.domain_userid = m.domain_userid
GROUP BY 1,2
ORDER BY 1,2;
{% endhighlight %}

For more about cohort analyses and performing them on Snowplow, view the [blog post series] [cohort-analysis-blog-post-series] on [Keplar LLP] [keplarllp].

[user-engagement]: /analytics/customer-analytics/user-engagement.html
[clv]: /analytics/customer-analytics/customer-lifetime-value.html
[cohort-analysis-blog-post-series]: http://www.keplarllp.com/blog/2012/05/performing-cohort-analysis-on-web-analytics-data-using-snowplow
[get-in-touch]: mailto:contact@snowplowanalytics.com
[keplarllp]: http://www.keplarllp.com
[varieties-of-cohort-analyses]: http://www.keplarllp.com/blog/2012/05/on-the-wide-variety-of-different-cohort-analyses-possible-with-snowplow
[custom-structured-events]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#wiki-custom-structured-events
