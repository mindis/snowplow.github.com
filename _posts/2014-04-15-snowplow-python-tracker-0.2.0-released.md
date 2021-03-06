---
layout: post
shortenedlink: Snowplow Python Tracker 0.2.0 released
title: Snowplow Python Tracker 0.2.0 released
tags: [snowplow, analytics, python, django, tracker]
author: Fred
category: Releases
---

We are happy to announce the release of the [Snowplow Python Tracker version 0.2.0] [repo]. This release adds support for Python 2.7, makes some improvements to the Tracker API, and expands the test suite.

This post will cover:

1. [Changes to the API](/blog/2014/04/15/snowplow-python-tracker-0.2.0-released/#api)
2. [Python 2.7](/blog/2014/04/15/snowplow-python-tracker-0.2.0-released/#compatibility)
3. [Integration tests](/blog/2014/04/15/snowplow-python-tracker-0.2.0-released/#tests)
4. [Other improvements](/blog/2014/04/15/snowplow-python-tracker-0.2.0-released/#other)
5. [Upgrading](/blog/2014/04/15/snowplow-python-tracker-0.2.0-released/#upgrading)
6. [Support](/blog/2014/04/15/snowplow-python-tracker-0.2.0-released/#support)

<!--more-->

<h2><a name="api">1. Changes to the API</a></h2>

The call to import the tracker module has not changed:

{% highlight python %}
from snowplow_tracker.tracker import Tracker
{% endhighlight %}

Tracker initialization has been simplified:

{% highlight python %}
t = Tracker("d3rkrsqld9gmqf.cloudfront.net")
{% endhighlight %}

Note that the method to set a collector URL based purely on a Cloudfront subdomain has been removed: you should now pass the whole host string "d3rkrsqld9gmqf.cloudfront.net", not just "d3rkrsqld9gmqf".

You can also provide a tracker name argument:

{% highlight python %}
t = Tracker("d3rkrsqld9gmqf.cloudfront.net", "cf")
{% endhighlight %}

Every event fired by `t` will have a tracker namespace field with value "cf". This means that you can match events to the tracker which created them.

There is one other major improvement to the API: tracker methods no longer require you to supply every argument. Arguments which are not supplied default to `None` and will not be added to the event. For example, the `track_ecommerce_transaction` method takes up to nine arguments, but only `order_id` and `total_value` are mandatory. Suppose we want to call `track_ecommerce_transaction` with just the two mandatory parameters and the optional `country` parameter. This is how to do it:

{% highlight python %}
t.track_ecommerce_transaction("12e4ba", 19.99, country="France")
{% endhighlight %}

As part of this change, the order of arguments for certain methods has been changed so that all keyword arguments come after all non-keyword arguments. For more information on which arguments are required and which are not, on the names of keyword arguments, and on the new order of arguments, see the [wiki] [wiki].

<div class="html">
<h2><a name="compatibility">2. Python 2.7</a></h2>
</div>

The Snowplow Python Tracker is now fully compatible with Python 2.7. Going forwards, we intend to maintain support for both Python 3.3 and Python 2.7, as well as adding support for other Python versions as they are requested.

<div class="html">
<h2><a name="tests">3. Integration tests </a></h2>
</div>

As well as running the test suite using both Python 2.7 and Python 3.3, we have expanded the scope of the integration tests. Now the GET payload generated by each tracking method is validated, ensuring that the correct data is being sent.

<div class="html">
<h2><a name="other">4. Other improvements </a></h2>
</div>

We have also:

* Added an event vendor parameter for events defined by Snowplow [#55] [55]
* Switched from using pycontract 0.1.4 to PyContracts 1.6.0 [#63] [63]
* Fixed the dependency versions in requirements.txt [#47] [47]
* Started sending the platform and tracker version through on the querystring [#50] [50]
* Linked the Technical Docs and Setup Guide images in the README to the appropriate pages [#60] [60]
* Changed the tracker version field from "python-0.1.0" to "py-0.2.0" [#51] [51]

<div class="html">
<h2><a name="upgrading">5. Upgrading</a></h2>
</div>

The release version of this tracker (0.2.0) is available on PyPI, the Python Package Index repository, as [snowplow-tracker] [pypi]. Download and install it with pip:

{% highlight bash %}
$ pip install snowplow-tracker --upgrade
{% endhighlight %}

Or with setuptools:

{% highlight bash %}
$ easy_install -U snowplow-tracker
{% endhighlight %}

For more information on getting started with the Snowplow Python Tracker, see the [setup page] [setup].

<div class="html">
<h2><a name="support">6. Support</a></h2>
</div>

The Snowplow Python Tracker is still very young, so please do [get in touch] [talk-to-us] if you need help setting it up or have features you would like us to add next. And [raise an issue] [issues] if you spot any bugs!

[55]: https://github.com/snowplow/snowplow-python-tracker/issues/55
[63]: https://github.com/snowplow/snowplow-python-tracker/issues/63
[47]: https://github.com/snowplow/snowplow-python-tracker/issues/47
[50]: https://github.com/snowplow/snowplow-python-tracker/issues/50
[51]: https://github.com/snowplow/snowplow-python-tracker/issues/51

[repo]: https://github.com/snowplow/snowplow-python-tracker
[pypi]: https://pypi.python.org/pypi/snowplow-tracker/0.2.0
[wiki]: https://github.com/snowplow/snowplow/wiki/Python-Tracker
[setup]: https://github.com/snowplow/snowplow/wiki/Python-tracker-setup
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us
[issues]: https://github.com/snowplow/snowplow/issues
