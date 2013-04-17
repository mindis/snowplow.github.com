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
3. [Visualizing how a user engages with a particular web page over time](#single-page)

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

Concentrating on the graphic specifically: (Click to zoom in.)

<a href="/static/img/analytics/catalog-analytics/content-page-performance/customer-journey-1.jpg"><img src="/static/img/analytics/catalog-analytics/content-page-performance/customer-journey-1.jpg" /></a>

A number of things become apparent very quickly:

1. This user was browsing the Snowplow website on-and-off for a pretty long period that lasted between 3pm and 7pm on April 14th
2. Although the user arrived on the `/technology/index.html` page, he / she actually spent the bulk of their time viewing the blog
3. The blog posts that they particularly engaged with were 'From ETL to Enrichment', 'Snowplow in a Universal Analytics world'
4. Although the user spent a most of his / her time on the blog, he / she did engage with content on the rest of the site. In particular, he / she viewed all four pages in the 'services' section, and spent the most time between thme on the 'custom-development' page. Maybe this is a user we should target with advertising for our professional services offering?

<a name="single-page"><h2>Visualizing how a user engages with a particular web page over time</h2></a>

We can use Snowplow data not just to visualize a user's interaction with the different pages on a website, but also zoom in on his / her interaction with a particular web page.

In the above example, we saw that this particular user spent some time on the 'From ETL to Enrichment' blog post. We can execute the following query to understand how he / she scrolled over that web page during that time period:

{% highlight mysql %}
/* Infobright / MySQL */
SELECT 
	TIMESTAMP(collector_dt, collector_tm) AS tstamp,
	page_urlpath,
	event,
	pp_xoffset_min,
	pp_xoffset_max,
	pp_yoffset_min,
	pp_yoffset_max,
	br_viewwidth,
	br_viewheight,
	doc_width,
	doc_height
FROM `events_008_clj`
WHERE domain_userid = '594b77eb9d30435b'
AND page_urlpath LIKE '%etl-to-enrichment%';
{% endhighlight %}

We can load that data into Tableau:

<a href="/static/img/analytics/catalog-analytics/content-page-performance/interaction-one-user-one-page-data.jpg"><img src="/static/img/analytics/catalog-analytics/content-page-performance/interaction-one-user-one-page-data.jpg" /></a>

A number of things that should be apparent from the above data:

* Over the course of the c.6 minutes the user is on the page, he / she scrolls all the way from the top to the bottom. We can see that they scrolled to the very bottom of the page, because the maximum value for the y-offset (`pp_yoffset_max`) + the browser view-height (`br_viewheight`) = the document height (`doc_height`)
* The user does not scroll left or right at all. (`pp_xoffset_min` and `pp_xoffset_max` are 0 for every page ping.) This is not surprising, as the document width is 1,509 pixels, and the browser view width is 1,509 pixels. (So the complete web page width is visible in the browser.)

We can easily plot how the user scrolls down the page over time in Tableau, by plotting either the `pp_yoffset_min` or `pp_yoffset_max` against time in seconds. (To do this, simply drag `tstamp` to the columns shelf, drag `ppy_offset_min` or `pp_yoffset_max` to the rows shelf, and select the line graph.) A plot like the following appears:

<a href="/static/img/analytics/catalog-analytics/content-page-performance/tableau-visualization-2.JPG"><img src="/static/img/analytics/catalog-analytics/content-page-performance/tableau-visualization-2.JPG"></a>

The most striking thing about the above graph is that the user appears to read the top of the page in fair detail (spending a good 30 seconds there) before scrolling down almost 4000 pixels in a single (10 second) ping period. That becomes less surprising if we look at the actual blog post itself:

<p style="text-align: center"><a href="/static/img/analytics/catalog-analytics/content-page-performance/from-etl-to-enrichment-page-with-measurements.JPG"><img src="/static/img/analytics/catalog-analytics/content-page-performance/from-etl-to-enrichment-page-with-measurements.JPG"></a></p>

The user has quickly scrolled over the flow chart that extends from c.600 pixels down the post to c.3200 pixels down the post, and is engaging much more closely with the text on either side, than the image itself.

[js-tracker]: https://github.com/snowplow/snowplow/wiki/2-Specific-event-tracking-with-the-Javascript-tracker#wiki-pagepings