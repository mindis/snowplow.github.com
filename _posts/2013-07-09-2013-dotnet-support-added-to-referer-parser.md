---
layout: blog-post
shortenedlink: .NET support added to referer-parser
title: .NET (C#) support added to referer-parser
tags: snowplow referer-parser .net dotnet csharp c#
author: Alex
category: Releases
---

We are pleased to announce the addition of [.NET support] [dotnet-port] to our standalone [referer-parser] [referer-parser] library. To recap: referer-parser is a simple library for extracting seach marketing attribution data from referer _(sic)_ URLs. You supply referer-parser with a referer URL; it then tells you the medium, source and term (in the case of a search) for this referrer. The Scala implementation of referer-parser is a key part of the Snowplow enrichment process.

As part of our commitment to modular, sustainable technical architectures, we made a decision some time ago to release the Referrer Parser as a standalone library, and have been very pleased to see community ports of the library first to [Python] [python-port] and now to [.NET] [dotnet-port]. Many thanks to [Sepp Wijnands] [swijnands] at [iPerform Software] [iperform] for contributing this latest port!

Here is a taster for using the library from C#:

{% highlight c# %}
using RefererParser;

string refererUrl = "http://www.google.com/search?q=gateway+oracle+cards+denise+linn&hl=en&client=safari";
string pageUrl    = "http:/www.psychicbazaar.com/shop" // Our current URL

var referer = Parser.Parse(new Uri(refererUrl), pageUrl);

Console.WriteLine(r.Medium); // => "Search"
Console.WriteLine(r.Source); // => "Google"
Console.WriteLine(r.Term); // => "gateway oracle cards denise linn"
{% endhighlight %}

After the jump we will hear from author Sepp Wijnands and then provide some brief help on usage and finding out more.

<!--more-->

## A brief interview with author Sepp Wijnands

We asked [Sipp] [swijnands] to tell us a little bit about himself, iPerform Software and why he ported referer-parser to the Dot Net platform:

_[iPerform Software] [iperform] (website in Dutch) helps companies in the Benelux succeed with their integration and web application needs. Our focus lies on modern Line of Business web applications, and pride ourselves with the ability to integrate almost anything and everything.

One of our customers had a feature request about getting (directly) notified when a very specific set of keywords is used when somebody enters the website via Google or Bing (or ....) searches. 

While we could probably have used an existing third-party analytics platform to do the job, one of the great things about the referer-parser project is that the referer database is very complete, and using the referer-parser library we can be in full control how and when notifications are send.

The referer-parser solution is currently deployed and fully up-and-running. And so far, the customer couldn't be happier!

So, thanks again for the fabulous referer-parser project!_

## Installation

Interested in using the .NET port of referer-parser? A NuGet Package is available, under package id RefererParser.

## Find out more

For more information, please check out the [project README] [dotnet-readme] for the .NET port of referer-parser.

[swijnands]: https://github.com/swijnands
[iperform]: http://www.iperform.nl/
[python-port]: https://github.com/snowplow/referer-parser/tree/master/python
[dotnet-port]: https://github.com/snowplow/referer-parser/tree/master/dotnet
[dotnet-readme]: https://github.com/snowplow/referer-parser/blob/master/dotnet/README.md