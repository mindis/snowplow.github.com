---
layout: section
category: analytics
analytics_category: catalog
title: Content page performance
weight: 3
---

<a name="top"><h1>Measuring content page performance</h1></a>

1. [Understanding page ping events](#page_pings)
2. [Visualizing an individual user journey through your website](#single-user-journey)

<a name="page_pings"><h2>Understanding page ping events</h2></a>

Snowplow includes a specific event type to help understand how users engage with content rich pages over time: Page Pings. This is a feature of the [Javascript tracker] [js-tracker].

If enabled in the Javascript tracker, page ping events are fired at regular intervals, so long as a user continues to engage with the page. ('Engage' in this context is defined very broadly: if the user does *anything* with the web page e.g. scrolls, mouses over images etc., it counts as engagement. If, on the other hand, a user goes to a different tab on their browser, or a different application, the page pings stop.) With each page ping, several data points are recorded:

* `pp_xoffset_min` and `pp_xoffset_max`: the minimum and maximum page x offset in the last ping period
* `pp_yoffset_min` and `pp_yoffset_max`: the minimum and maximum page y offset in the last ping period

By looking at these values and comparing them with the browser window dimensions (`br_viewwidth` and `br_viewheight`) and web page dimensions (`doc_width` and `doc_height`), we can analyse how users scroll over a web page over time.

Page pings are enabled using the [enableActivityTracking] [js-tracker] function in the Javascript tracker. When enabled, you can configure what time period the user needs to engage with the page, since the page load, before the first page ping event occurs, and then over what period a user must continue to engage with the web page before the next page ping is sent. So, for example, if the Javascript function is called as follows:

{% highlight javascript %}
_snaq.push(['enableActivityTracking', 30, 10]);
{% endhighlight %}

The first ping would occur after 30 seconds, and subsequent pings every 10 seconds.

<a name="single-user-journey"><h2>Visualizing an individual user journey through your website</h2></a>

We can pull up a stream of the page view and page ping events for a particular user over time executing a query like this:

{% highlight mysql %}
/* Infobright / MySQL */
SELECT
	domain_userid,
	domain_sessionidx,
	TIMESTAMP(collector_dt, collector_tm) AS tstamp,
	page_urlpath,
	page_title,
	event
FROM
events_008_clj
WHERE domain_userid = '594b77eb9d30435b'
AND (event = 'page_ping'
OR event = 'page_view')
ORDER BY domain_userid, tstamp
{% endhighlight %}

We can visualize the above user journey in Tableau:

* Connect Tableau to your Redshift / Infobright instance, but instead of connecting to your Snowplow events table directly, execute the above custom SQL

<p style="text-align: center"><img src="/static/img/analytics/catalog-analytics/content-page-performance/tableau-custom-sql.JPG" width="250" /></p>

* Drag the `tstamp` dimension into the columns shelf and set it to show 'seconds'. (Rather than the default 'years')
* Drag the `page_urlpath` dimension to the rows shelf. You should now see a Gantt style view of the user journey through the different web pages
* To make the visualization clearer, we list the `page_urlpath` in the order in which this user visited them. Click on the `page_urlpath` in the rows shelf, select 'sort' from the dropdown, and select 'Sort by... Field'. In the field dropdown, select `tstamp` and in the aggregation dropdown, select `Minimum`. Click 'Apply'
* To make the visualization easier to read, drag `page_urlpath` from the dimensions pane to the 'Color' mark. You should now see a visualization like the one shown below: (Click to zoom in.)

<a href="/static/img/analytics/catalog-analytics/content-page-performance/tableau-visualization-1.JPG"><img src="/static/img/analytics/catalog-analytics/content-page-performance/tableau-visualization-1.JPG" /></a>

Concentrating on the graphic specifically:

<a href="/static/img/analytics/catalog-analytics/content-page-performance/customer-journey-1.jpg"><img src="/static/img/analytics/catalog-analytics/content-page-performance/customer-journey-1.jpg" /></a>

A number of things become apparent very quickly:

1. This user was browsing the Snowplow website on-and-off for a pretty long period that lasted between 3pm and 7pm on April 14th
2. Although the user arrived on the `/technology/index.html` page, he / she actually spent the bulk of their time viewing the blog
3. The blog posts that they particularly engaged with were 'From ETL to Enrichment', 'Snowplow in a Universal Analytics world'
4. Although the user spent a most of his / her time on the blog, he / she did engage with content on the rest of the site. In particular, he / she viewed all four pages in the 'services' section, and spent the most time between thme on the 'custom-development' page. Maybe this is a user we should target with advertising for our professional services offering?





[js-tracker]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#wiki-pagepings