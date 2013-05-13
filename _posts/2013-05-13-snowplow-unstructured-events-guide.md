---
layout: blog-post
shortenedlink: Snowplow unstructured events guide
title: A guide to unstructured events in Snowplow 0.8.3
tags: snowplow unstructured events javascript tracker
author: Alex
category: Releases
---

Earlier today we [announced the release of Snowplow 0.8.3] [snowplow-083-blog], which updated our JavaScript Tracker to add the ability to send custom unstructured events to a Snowplow collector with `trackUnstructEvent()`.

In our earlier blog post we briefly introduced the capabilities of `trackUnstructEvent` with some example code. In this blog post, we will take a detailed look at Snowplow's custom unstructured events functionality, so you can understand how best to send unstructured events to Snowplow. This is particularly important because our ETL process does not yet extract unstructured events, so you will not get any feedback yet from the ETL as to whether you are tracking them correctly.

In the rest of this post, then, we will cover:

1. [Basic usage](/blog/2013/04/12/snowplow-0.8.1-released-with-referer-url-parsing#referer-parsing)
2. [XXX](/blog/2013/04/12/snowplow-0.8.1-released-with-referer-url-parsing#example-data)
3. [XXX](/blog/2013/04/12/snowplow-0.8.1-released-with-referer-url-parsing#upgrading-usage)
4. [XXX]()
4. [XXX](/blog/2013/04/12/snowplow-0.8.1-released-with-referer-url-parsing#help)

<!--more-->

<h2><a name="basic-usage">1. Basic usage</a></h2>

Tracking an unstructured event with the JavaScript Tracker is very straightforward - use the `trackUnstructEvent(name, properties)` function:

* `name` is the name of the unstructured event. This is case-sensitive; spaces etc are allowed
* `properties` is a JavaScript object

Here is an example:

{% highlight javascript %}
_snaq.push(['trackUnstructEvent', 'Viewed Product',
                {
                    product_id: 'ASO01043',
                    category: 'Dresses',
                    brand: 'ACME',
                    returning: true,
                    price: 49.95,
                    sizes: ['xs', 's', 'l', 'xl', 'xxl'],
                    available_since$dt: new Date(2013,3,7)
                }
            ]);
{% endhighlight %}

Every call to `trackUnstructEvent` has the same structure - the complexity comes from knowing how to structure the `properties` JavaScript object. We will discuss this next:

<h2><a name="properties-object">2. The `properties` JavaScript object</a></h2>

The `properties` JavaScript consists of a set of individual `name: value` properties. The structure must be flat - in other words, properties cannot be nested. Continuing with the exampe code above, this means that the following is **not** allowed:

{% highlight javascript %}
{
    product_id: 'ASO01043',
    category: { primary: 'Womenswear', secondary: 'Dresses'}, // NOT allowed
    ...
}
{% endhighlight %}

The `properties` JavaScript object supports a wide range of datatypes - see below for details.

<h2><a name="supported-datatypes">3. Supported datatypes</a></h2>

Snowplow unstructured events support a relatively rich set of datatypes. Because these datatypes do not always map directly onto JavaScript datatypes, we have introduced some "type suffixes" for the JavaScript property names, to tell Snowplow what Snowplow datatype we want the JavaScript data to map onto.

Our datatypes, then, are as follows:

| Snowplow datatype | Description                  | JavaScript datatype  | Type suffix(es)      | Supports array? |
|:------------------|:-----------------------------|:---------------------|:---------------------|:----------------|
| Null              | Absence of a value           | Null                 | -                    | No              |
| String            | String of characters         | String               | -                    | Yes             |
| Number            | Integer or decimal           | Number               | -                    | Yes             |
| Boolean           | True or false                | Boolean              | -                    | Yes             |
| Geo-coordinates   | Longitude and latitude       | [Number, Number]     | `$geo`               | Yes             |
| Date              | Date and time (ms precision) | Number               | `$dt`, `$tm`, `$tms` | Yes             |
| Array             | Array of values              | [x, y, z]            | -                    | -               |

Let's go through each of these in turn, providing some examples as we go:

### Null

Tracking a Null value for a given field is straightforward:

{% highlight javascript %}
{
    returns_id: null,
    ...
}
{% endhighlight %}

### String

Tracking a String is easy:

{% highlight javascript %}
{
    product_id: 'ASO01043', // Or "ASO01043"
    ...
}
{% endhighlight %}

### Number

Both Snowplow and JavaScript have only one type of a Number, track it like this:

{% highlight javascript %}
{
    in-stock: 23,
    price: 49.95,
    ...
}
{% endhighlight %}

### Boolean

Tracking a Boolean is straightforward:

{% highlight javascript %}
{
    trial: true,
    ...
}
{% endhighlight %}

### Geo-coordinates

Tracking a pair of geographic coordinates is done like so:

{% highlight javascript %}
{
    check-in$geo: [-88.21337, 40.11041],
    ...
}
{% endhighlight %}

**Warning:** if you do not add the `$geo` type suffix, then the value will be incorrectly interpreted as an Array of Floats.

### Date

Snowplow Dates include the date _and_ the time, with milliseconds precision. There are three type suffixes supported:

* `$dt` - the Number of days since the epoch
* `$tm` - the Number of seconds since the epoch
* `$tms` - the Number of milliseconds since the epoch. The default for JavaScript Dates if no type suffix supplied

You can track a date by adding either a JavaScript Number _or_ JavaScript Date to your `properties` object:

{% highlight javascript %}
{
    birthday$dt: new Date(1980,11,10), // Sent to Snowplow as birthday$dt: XXXXXXXXX
    _birthday$dt: XXXXXXXXX, // ^ Same
    signed-up$tm: XXXXXXXXXXXXXX, // With secs precision
    last-ping$tms: XXXXXXXXXXXXXXXX, // Accurate to secs
    last-action: new Date() // Sent to Snowplow as last-action$tms: XXXXXXXXXXXXX
    ...
}
{% endhighlight %}

Note that the type prefix only indicates how the JavaScript Number sent to Snowplow is _interpreted_ - all Dates are stored by Snowplow to milliseconds precision (whether or not they include that data).

**Two warnings:**

1. If you specify a JavaScript Number but do not add a valid Date suffix (`$dt`, `$tm` or `$tms`), then the value will be incorrectly interpreted as a Number, not a Date
2. If you specify a JavaScript Number but add the wrong Date suffix, then the Date will be incorrectly interpreted by Snowplow, for example:

{% highlight javascript %}
{
    last-ping$dt: XXXXXXXXXXXXXXXX, // Should have been $tms. Snowplow interprets as XXXXXXXXXXXXXXXXXXXX
    ...
}
{% endhighlight %}

### Arrays

You can send an Array of values, of any data type other than Null.

Arrays must be homogeneous - in other words, all values within the Array must be of the same datatype. This means that the following is **not** allowed:

{% highlight javascript %}
{
    product_id: 'ASO01043',
    sizes: ['xs', 28, 'l', 38, 'xxl'], // NOT allowed
    ...
}
{% endhighlight %}

By contrast, the following are all allowed:

{% highlight javascript %}
{
    product_id: 'ASO01043',
    sizes: ['xs', 's', 'l', 'xl', 'xxl'],
    session-starts$tm: [XXXXXXXXXX, YYYYYYYYYYY, ZZZZZZZZZZZZ],
    check-ins$geo: [[-88.21337, 40.11041], [-78.81557, 30.22047]]
    ...
}
{% endhighlight %}

<h2><a name="help">4. Getting help</a></h2>

As always, if you do run into any issues or don't understand any of the above changes, please do get in touch with us via [the usual channels] [talk-to-us].

And if you have any ideas or feedback for our custom unstructured events, do please share them, either in the comments below or through the usual channels.