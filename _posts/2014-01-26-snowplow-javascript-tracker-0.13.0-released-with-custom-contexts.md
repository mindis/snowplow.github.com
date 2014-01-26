---
layout: blog-post
shortenedlink: JavaScript Tracker 0.13.0 released
title: Snowplow JavaScript Tracker 0.13.0 released with custom contexts
tags: snowplow javascript tracker
author: Alex
category: Releases
---

We're pleased to announce the immediate availability of the Snowplow JavaScript Tracker version 0.13.0. This is the first new release of the Snowplow JavaScript Tracker since separating it from the main Snowplow repository last year.

The primary objective of this release was to introduce some key new tracking capabilities, in preparation for adding these to our Enrichment process later this year. Secondarily, we also wanted to perform some outstanding housekeeping and tidy-up of the newly-independent repository.

In the rest of this post, then, we will cover:

1. [New feature: adding custom contexts to events](/blog/2014/01/26/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#context)
2. [New feature: setting the transaction currency](/blog/2014/01/26/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#currency)
3. [New feature: specifying the tracking platform](/blog/2014/01/26/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#platform)
4. [Project tidy-up](/blog/2014/01/26/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#tidyup)
5. [Upgrading](/blog/2014/01/26/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#upgrading)
6. [Getting help](/blog/2014/01/26/snowplow-javascript-tracker-0.13.0-released-with-custom-contexts/#help)

<!--more-->

<h2><a name="context">1. New feature: adding custom contexts to events</a></h2>

The most exciting new feature is the addition of custom contexts to all of our `track...()` events.

**Please note that this release only adds custom contexts to the JavaScript Tracker - adding custom contexts to our Enrichment process and Storage targets is on the roadmap - but rest assured we are working on it!**

<h3>Recap on context</h3>

We set out our original thinking about event context in our blog post last August, [Towards universal event analytics - building an event grammar] [event-grammar-post].

Briefly: context is what describes the circumstances surrounding an individual event - for example, when the event happened, where it happened, how it happened. The JavaScript Tracker already captures lots of standard web context, but this new feature allows you to define your own custom contexts: ones which make sense to your specific business.

Think "custom variables" but much more powerful and flexible.

<h3>Our custom contexts implementation</h3>

With this release, there is now a new optional last argument to each `track...()` method, called simply `contexts`. For example, here is the new signature for tracking a page view:

{% highlight javascript %}
function trackPageView(customTitle, contexts) { }
{% endhighlight %}

The `contexts` argument is always optional. If set, it must be a JSON taking the form:

{% highlight javascript %}
{
	"context1_name": { ... },
	"context2_name": { ... },
	...
}
{% endhighlight %}

To add a little more detail here:

1. If set, the `contexts` JSON must contain at least one `"context": { ... }` entry
2. Each context's own `{ ... }` envelope can contain any of the same data types supported by [custom unstructured events] [custom-unstructured-events]
3. Context names are globally namespaced - use the same context name across multiple different events and event types to refer to the same fields in the `{ ... }` envelope

<h3>Example</h3>

An example should make custom contexts a little more real.

Let's take an online retailer who sells movie memorabilia, especially movie posters. For every movie poster, she cares about the name of the film, the country which produced the film poster and the year the poster was printed. She has also done some work understanding her customer base, and can assign all of her website visitors a propensity-to-buy score and a customer segment as soon as they add something to their basket.

Based on the above, our retailer will define two custom contexts. The first describes a given movie poster:

{% highlight javascript %}
"movie_poster": {
	"movie_name": xxx,
	"poster_country": xxx,
	"poster_year$dt": xxx
}
{% endhighlight %}

And then the second context describes the customer:

{% highlight javascript %}
"customer": {
	"ptb_score": xxx,
	"segment": xxx
}
{% endhighlight %}

Then one or both of these contexts can be added to the generated Snowplow events, like so:

{% highlight javascript %}
// User arrives on site


<h3>Roadmap</h3>

**Note:** custom contexts are **not** currently processed by the Snowplow Enrichment process, or available in Storage. We are well aware that this release is only the start of adding custom contexts to Snowplow.

Please keep an eye on our [Roadmap wiki page] [roadmap] to see how Snowplow's support for custom contexts evolves.

<h2><a name="currency">2. New feature: setting the transaction currency</a></h2>

We have updated our ecommerce tracking methods to add support for setting the currency which the transaction took place in.

The new `currency` argument is the penultimate argument (the last before `context`, see above) to both the `addTrans()` and `addItem()` methods. Use it like so:

{% highlight javascript %}
_snaq.push(['addTrans',
    '1234',           // order ID - required
    'Acme Clothing',  // affiliation or store name
    '11.99',          // total - required
    '1.29',           // tax
    '5',              // shipping
    'San Jose',       // city
    'California',     // state or province
    'USA',            // country
    'USD'             // currency
  ]);

_snaq.push(['addItem',
    '1234',           // order ID - required
    'DD44',           // SKU/code - required
    'T-Shirt',        // product name
    'Green Medium',   // category or variation
    '11.99',          // unit price - required
    '1',              // quantity - required
    'USD'             // currency
  ]);
{% endhighlight %}

Please make sure to pass in the valid [ISO 4217] [iso-4217] code for your currency. This will ensure that your ecommerce transactions are compatible with the currency conversion enrichment we are currently developing (see [this blog post] [forex-post] for details).

Don't forget to set the currency on **both** the parent transaction and its child items.

<h2><a name="paltform">3. New feature: specifying the tracking platform</a></h2>

Many thanks to community member [Ryan Sorensen] [rcs] for contributing the new `setPlatform()` method.

This allows you to override the default tracking platform ("web") with another of the [platform values supported in the Snowplow Tracker Protocol] [protocol-platform]. For example, to set the platform to "mob" for mobile:

{% highlight javascript %}
_snaq.push(['setPlatform', 'mob']);
{% endhighlight %}

Thanks for your contribution Ryan!

<h2><a name="tidyup">4. Project tidy-up</a></h2>

We have taken advantage of the move to a separate repository to perform some much needed tidy-up of the tracker codebase:

* Added a complete [historic CHANGELOG] [changelog]
* Back-filled git tags for all of the tracker's releases
* Restructured the folders
* Added a package.json
* Added a node.js-friendly .gitignore
* Added some useful helper functions

As well as tidying up the repository, these updates should lay the groundwork for us replacing our custom `snowpak.sh` Bash build script with a Grunt-based build process in the [next release] [0140-issues].

<h2><a name="upgrading">5. Upgrading</a></h2>

As always, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.13.0/sp.js

Please note that as of this release, we are moving the Snowplow JavaScript Tracker to true [semantic versioning] [semver]. This means that going forwards we are also making this tracker available as:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0/sp.js

where 0 is the semantic MAJOR version. If you prefer, you can use this URI path and then get new features and bug fixes "for free" as we roll-out MINOR and PATCH updates to the tracker. Any breaking changes will mean a new MAJOR version, which will be hosted on `/1/sp.js`, i.e. won't break your existing installation.

<h2><a name="help">6. Getting help</a></h2>

Check out the [v0.13.0 release page] [0130-release] on GitHub for the full list of changes made in this version.

As always, if you run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].

[event-grammar-post]: /blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar/
[roadmap]: https://github.com/snowplow/snowplow/wiki/Product-roadmap

[iso-4217]: http://en.wikipedia.org/wiki/ISO_4217#Active_codes
[forex-post]: /blog/2014/01/17/scala-forex-library-released/

[protocol-platform]: https://github.com/snowplow/snowplow/wiki/snowplow-tracker-protocol#11-application-parameters

[changelog]: https://github.com/snowplow/snowplow-javascript-tracker/blob/master/CHANGELOG

[semver]: http://semver.org/spec/v2.0.0.html
[0140-issues]: https://github.com/snowplow/snowplow-javascript-tracker/issues?milestone=3&page=1&state=open
[0130-release]: xxx

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us