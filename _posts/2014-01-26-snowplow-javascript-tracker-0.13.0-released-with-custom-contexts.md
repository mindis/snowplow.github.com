---
layout: blog-post
shortenedlink: JavaScript Tracker 0.13.0 released
title: Snowplow JavaScript Tracker 0.13.0 released with custom contexts
tags: snowplow javascript tracker
author: Alex
category: Releases
---

We're pleased to announce the immediate availability of the Snowplow JavaScript Tracker version 0.13.0. This is the first release of the Snowplow JavaScript Tracker since splitting it off from the main Snowplow repository last year.

This new release has two main goals:

1. To introduce some key new tracking capabilities, in preparation for adding to the Enrichment process
2. To perform some housekeeping and tidy-up of the newly separated repository

In the rest of this post, then, we will cover:

1. [New feature: adding custom contexts to events](/blog/2014/01/26/snowplow-javascript-tracker-0.8.3-released-with-custom-contexts/#context)
2. [New feature: setting the transaction currency](/blog/2014/01/26/snowplow-javascript-tracker-0.8.3-released-with-custom-contexts/#currency)
3. [New feature: specifying the tracking platform](/blog/2014/01/26/snowplow-javascript-tracker-0.8.3-released-with-custom-contexts/#platform)
4. [Housekeeping and tidy-up](/blog/2014/01/26/snowplow-javascript-tracker-0.8.3-released-with-custom-contexts/#tidyup)
5. [Upgrading](/blog/2014/01/26/snowplow-javascript-tracker-0.8.3-released-with-custom-contexts/#upgrading)
6. [Getting help](/blog/2014/01/26/snowplow-javascript-tracker-0.8.3-released-with-custom-contexts/#help)

<!--more-->

<h2><a name="">1. New feature: adding custom contexts to events</a></h2>


<h2><a name="">2. New feature: setting the transaction currency</a></h2>


<h2><a name="">3. New feature: specifying the tracking platform</a></h2>


<h2><a name="">4. Housekeeping and tidy-up</a></h2>

As part of this release, we have restructured the tracker to reflect that it now has its own dedicated repository. In particular we have:

* Added a complete [historic CHANGELOG] [changelog]
* Back-filled git tags for all of the tracker's releases
* Restructured the folders
* Added a package.json
* Added a node.js-friendly .gitignore
* Added some useful helper functions

As well as tidying up the repository, these updates should lay the groundwork for us replacing our custom `snowpak.sh` Bash script with a Grunt-based build process in the [next release] [0140-releases].

<h2><a name="">5. Upgrading</a></h2>

As always, the updated minified tracker is available here:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0.13.0/sp.js

Please note that as of this release, we are moving the Snowplow JavaScript Tracker to true [semantic versioning] [semver]. This means that going forwards we are also making this tracker available as:

    http(s)://d1fc8wv8zag5ca.cloudfront.net/0/sp.js

where 0 is the semantic MAJOR version. If you prefer, you can use this URI path and then get new features and bug fixes "for free" as we roll-out MINOR and PATCH updates to the tracker. Any breaking changes will mean a new MAJOR version, which will be hosted on `/1/sp.js`, i.e. won't break your existing installation.

<h2><a name="">6. Getting help</a></h2>

Check out the [v0.13.0 release page] [0130-release] on GitHub for the full list of changes made in this version.

As always, if you do run into any issues or don't understand any of the above changes, please [raise an issue] [issues] or get in touch with us via [the usual channels] [talk-to-us].


[changelog]: xxx

[semver]: http://semver.org/spec/v2.0.0.html
[0140-issues]: xxx
[0130-release]: xxx

[issues]: https://github.com/snowplow/snowplow/issues
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us