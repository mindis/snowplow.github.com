---
layout: blog-post
shortenedlink: Where does your traffic *really* come from?
title: Where does your traffic *really* come from?
tags: referrer referer traffic source medium marketing
author: Yali
category: Analytics
---

One of the most common tasks for web analysts around the world is examining the sources of traffic to a website: 

* Where are the visitors coming from? 
* Which sites and marketing campaigns are driving them to our website?
* How valuable are those visitors?
* What should we be doing to drive up the number of high quality users? (In terms of spending more marketing, engaging with other websites / blogs / social networks etc.)

Unfortunately, identifying where your users come from is **not** as straightforward as it often seems. In this post, we'll cover:

1. [How, technically, can we determine where visitors have come from?](#how)
2. [Sources of errors](#errors)
3. [Problems with relying on Google Analytics approach, in particular: why the Snowplow approach is superior](#ga)
4. [Surprises when examining visitors acquired from Adwords search campaigns](#adwords): some users were **not** refered from Google Search sites

<a name="how"><h2>1. How, technically, can we determine where visitors have come from?</h2></a>

There are two sources of raw data that we can use to determine where a vistor to a website has come from: the [HTTP referer](#http-referer) and the [page URL](#page-url)

<a name="http-referer"><h3>HTTP Referer</h3></a>

When you load a web page in your browser, your browser makes an HTTP request to a web server to deliver that page. That 'request' includes a header field that identifies the address of the web page that linked to the resource being requested. (This is called the [HTTP referer] [http-referer].) Web analytics programmes typically read the HTTP header and use that as one the inputs to deduce where a visitor has come from.

<a name="http-referer"><h3>Page URL</h3></a>

HTTP referers are a technical solution to identifying where traffic comes from. In addition, digital marketers may want to label incoming traffic so that they can identify which marketing campaigns that traffic should be attributed to. This is typically done by adding a query string to the landing page URL. 

To give an example of how this technique works in practice, let's imagine that I am marketing the website `www.flowersdirect.com`. I run a campaign on Adwords called "November promotion". In my Adwords ad, I include a link (that I hope viewers of the add will click) to my homepage (`www.flowersdirect.com`). However, instead of just including the standard link in my ad i.e.

{% highlight html %}
<a href="http://www.flowersdirect.com">www.flowersdirect.com</a>
{% endhighlight %}

I add a query parameter onto the end of my link labelling the campaign:

{% highlight html %}
<a href="http://www.flowersdirect.com?utm_campaign=November_promotion">www.flowersdirect.com</a>
{% endhighlight %}

Adding the query parameter does not change the experience of the user clicking on the ad. Typically, the web analtyics Javascript tag will inspect the page URL (includign query parameter) and pass it to the web analytics application, which can then deduce that the traffic should be attributed to the "November promotion" by parsing the querystring.

Web analytics programmes use a combination of the above two sets of data to infer where traffic to the website has come from.

<a name="errors"><h2>2. Sources of errors</h2></a>

In general, there is much more scope for errors to arise deducing the source of traffic from the querystring on the page URL than there are when using the HTTP referer field. That is because querystring parameters are set by manually by humans, rather than programmatically by machines. The following are two of the most common sources of errors:

### (a) Visitors sharing page URLs with campaign parameters in the querystring, using copy-and-paste

Visitors sharing the page URL (including query string with UTM parameters) on social sites / email etc. Many times, I've noticed that a link in e.g. a Twitter post contains a 'utm_' parameter that suggests it is a CPC campaign, for example. This sort of error arises when, for example, a visitor clicks on a link from a CPC campaign, views the web page, then wants to share the web page - and does so by copying and pasting the URL. Website visitors don't typically check those URL to see if there are marketing fields on the query parameters, leave alone remove them. Everywhere that the user shares that link, that link will contain the query parameter. Any other users clicking on that link will be misclassified as coming from a CPC campaign.

### (b) Typos in the campaign parameters on the query string

The individual who sets up the campaign makes a mistake adding the querystring to the link in the ad. This is very easy to do: setting up campaigns can be tedious (especially if many are set up at the same time) and error-prone. An error as simple as typing `utm-campaign` instead of `utm_campaign` is enough that most web analytics software will misclassify *all* the visitors who clicked on that link

Note that using a traditional web analytics solution, it is:

1. Impossible to spot that an error has been made on the query string in most cases
2. Even if you can do spot the error, it is impossible to reprocess the data (and correct the error) or even 'ignore' the erroneaous data

Using Snowplow, however, spotting errors is easy, because you have access to the raw page URL parameters in your Snowplow events table. The following is some example data from [Psychic Bazaar] [pbz], an online retailer running Snowplow. We've executed the following query to identify page views where the referer is not internal (so that we only look at the first page view in each visit i.e. the one with all the interesting HTTP referer and page URL data to determine the source of traffic):


<a name="ga"><h2>3. Problems with relying on Google Analytics approach, in particular: why the Snowplow approach is superior</h2></a>


<a name="adwords"><h2>4. Surprises when examining visitors acquired from Adwords search campaigns: some users were not refered from Google sites</h2></a>


[http-referer]: http://en.wikipedia.org/wiki/HTTP_referer
[pbz]: http://www.psychicbazaar.com/