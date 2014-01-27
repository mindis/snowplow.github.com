

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
	"p2buy_score": xxx,
	"segment": xxx
}
{% endhighlight %}

Then one or both of these contexts can be added to the generated Snowplow events, like so:

{% highlight javascript %}
// User arrives on site


<h3>Roadmap</h3>

**Note:** custom contexts are **not** currently processed by the Snowplow Enrichment process, or available in Storage. We are well aware that this release is only the start of adding custom contexts to Snowplow.

Please keep an eye on our [Roadmap wiki page] [roadmap] to see how Snowplow's support for custom contexts evolves.