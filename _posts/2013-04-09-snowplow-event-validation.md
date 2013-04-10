---
layout: blog-post
shortenedlink: Snowplow event validation
title: Towards high-fidelity web analytics: introducing Snowplow's innovative new event validation capabilities
tags: snowplow event validation
author: Alex
category: Releases
---

A key goal of the Snowplow project is enabling **high-fidelity** product and marketing analytics for our community of users. What do we mean by high-fidelity analytics? Simply put, high-fidelity web analytics means Snowplow faithfully recording _all_ customer-generated events in a rich, granular, non-lossy and unopinionated way; warehousing this high-fidelity data gives Snowplow users a hugely valuable asset which they can analyse and explore to understand their customers' behaviour and come to the right business (and ultimately operational) decisions.

![high-fidelity] [high-fidelity]

Why is Snowplow so unusual in aiming for high-fidelity analytics? Most often, analytics vendors sacrifice the goal of high-fidelity data at the altar of these three compromises:

1. **Premature aggregation** - when the data store gets too large, or the reports take too long to generate, it's tempting to perform the  aggregation/roll-up of the raw event data into reports and summaries earlier, sometimes even at the point of collection. Of course this offers a huge potential performance boost to the tool, but at the cost of a huge degree of customer data fidelity
2. **Ignoring bad news** - the nature of behavioural analytics means that often incomplete, corrupted or plain wrong data is sent in to the package by the event trackers. Handling bad event data is complicated (let's go shopping!) - but instead of dealing with the complexity, most analytics packages just throw the bad data away silently; this is why tag audit companies like [ObservePoint] [observepoint] exist
3. **Being over-opinionated** - another property of customer analytics is that it's full of difficult, not-very-sexy questions that need answering before you can analyse the data: do I track users by their first-party cookie, third-party cookie, business ID and/or IP address? Do I use the server clock, or the user's clock to log the event time? When does a user session start and end? If a CPC campaign link goes viral on Facebook, is the traffic source Facebook, the original CPC campaign or both? Actually, these questions are so involved to answer that most analytics tools don't even ask them: instead they take an opinionated view and silently enforce that view through their event collection, storage and analysis

To deliver on the goal of high-fidelity analytics, then, we're trying to steer Snowplow around these three common pitfalls as best we can.

We have talked in detail on our website and wiki about how we avoid #1, Premature aggregation, and we will blog more about our ideas to combat #3, Being over-opinionated, in the future. For the rest of this blog post, though, we will look at our solution to pitfall #2, Ignoring bad news: namely, **event validation**.

Read on below the fold to find out more!

<!--more-->

Our new Scalding-based event enrichment process (introduced in [our last blog post] [snowplow-080]) introduces the idea of **event validation**.

Instead of "ignoring bad news", the Snowplow enrichment engine now validates that every logged event matches the format that we expect for Snowplow events - be they page views, ecommerce transactions, custom structured events or some other type of event. Any events which do not match this format are stored in a new "Bad Rows" bucket in Amazon S3, along with the specific data validations that the event failed.

Here are a couple of example rows which failed validation for an ecommerce site running Snowplow. You will note that the bad rows are logged to the S3 bucket in JSON format - we have "pretty printed" the rows to make them easier to read:

{% highlight json %}
{
  "line": "2012-11-14\t11:53:07\tDUB2\t3707\t92.237.59.86\tGET\td10wr4jwvp55f9.cloudfront.net\t\/ice.png\t200\thttps:\/\/www.psychicbazaar.com\/shop\/checkout\/?token=EC-6H7658847D893744L\tMozilla\/5.0%20(Windows%20NT%206.0)%20AppleWebKit\/537.11%20(KHTML,%20like%20Gecko)%20Chrome\/23.0.1271.64%20Safari\/537.11\tev_ca=ecomm&ev_ac=checkout&ev_la=id_city&ev_pr=SUCCESS&ev_va=Liverpool&tid=404245&uid=4434aa64ebbefad6&vid=1&lang=en-US&refr=https%253A%252F%252Fwww.paypal.com%252Fuk%252Fcgi-bin%252Fwebscr%253Fcmd%253D_flow%2526SESSION%345DiuJgdNO9t8v06miTqv5EHhhGukkGNH3dfRqrKhe0i-UM9FCbVNg26G10sRC%2526dispatch%253D50a222a57771920b6a3d7b606239e4d529b525e0b7e69bf0224adecfb0124e9b61f737ba21b0819882a9058c69cd92dcdac469a145272506&f_pdf=1&f_qt=0&f_realp=0&f_wma=1&f_dir=1&f_fla=1&f_java=1&f_gears=0&f_ag=1&res=1920x1080&cookie=1&url=https%253A%252F%252Fwww.psychicbazaar.com%252Fshop%252Fcheckout%252F%253Ftoken%253DEC-6H7658847D893744L\t-\tHit\tAN6xpNsbS0JS05bqjmnbJdZDkl-cVkTPQsAJDlIOgAIG4hcPTTlMFA==",
  "errors": [
    "Field [ev_va]: cannot convert [Liverpool] to Float"
  ]
}
{
  "line": "2012-11-14\t11:53:13\tDUB2\t3707\t92.237.59.86\tGET\td10wr4jwvp55f9.cloudfront.net\t\/ice.png\t200\thttps:\/\/www.psychicbazaar.com\/shop\/checkout\/?token=EC-6H7658847D893744L\tMozilla\/5.0%20(Windows%20NT%206.0)%20AppleWebKit\/537.11%20(KHTML,%20like%20Gecko)%20Chrome\/23.0.1271.64%20Safari\/537.11\tev_ca=ecomm&ev_ac=checkout&ev_la=id_state&ev_pr=SUCCESS&ev_va=Merseyside&tid=462879&uid=4434aa64ebbefad6&vid=1&lang=en-US&refr=https%253A%252F%252Fwww.paypal.com%252Fuk%252Fcgi-bin%252Fwebscr%253Fcmd%253D_flow%2526SESSION%345DiuJgdNO9t8v06miTqv5EHhhGukkGNH3dfRqrKhe0i-UM9FCbVNg26G10sRC%2526dispatch%253D50a222a57771920b6a3d7b606239e4d529b525e0b7e69bf0224adecfb0124e9b61f737ba21b0819882a9058c69cd92dcdac469a145272506&f_pdf=1&f_qt=0&f_realp=0&f_wma=1&f_dir=1&f_fla=1&f_java=1&f_gears=0&f_ag=1&res=1920x1080&cookie=1&url=https%253A%252F%252Fwww.psychicbazaar.com%252Fshop%252Fcheckout%252F%253Ftoken%253DEC-6H7658847D893744L\t-\tHit\tXbvEfkx7BvngWyY23OLDvyFi8mXe2E_nhBaJwkzCG3aNxUng1jz4hQ==",
  "errors": [
    "Field [ev_va]: cannot convert [Merseyside] to Float"
  ]
}
{% endhighlight %}

These validation errors occurred because the ecommerce site incorrectly tried to log address information in the `value` field of a custom structured event; the `value` field only supports numeric values (and is stored in Redshift in a float field). When we saw these validation errors, we notified the site and they corrected their Google Tag Manager implementation.

Currently these bad rows are simply stored for inspection in the Bad Rows bucket in S3, while Snowplow carries on with the raw event processing. In the future we may look into ways of sending alerts when bad rows are generated, or even look into ways of automatically fixing bad rows and submitting them for re-processing.

That completes our brief look at event validation - we hope you like it! For us, event validation is a key plank of our quest at Snowplow for high-fidelity event analytics - expect to hear more from us on this topic soon!

[high-fidelity]: /static/img/blog/2013/04/high-fidelity-2000.jpg
[observepoint]: http://www.observepoint.com/
[snowplow-080]: /blog/2013/04/03/snowplow-0.8.0-released-with-all-new-scalding-based-data-enrichment/
