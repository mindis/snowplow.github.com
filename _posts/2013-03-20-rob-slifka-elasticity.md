---
layout: blog-post
shortenedlink: Rob Slifka's Elasticity
title: Inside the Plow - Rob Slifka's Elasticity
tags: snowplow emr elasticity mapreduce
author: Alex
category: Inside the Plow
---

_The SnowPlow platform is built standing on the shoulders of a whole host of different open source frameworks, libraries and tools. Without the amazing ongoing work by these individuals, companies and not-for-profits, the SnowPlow project literally could not exist._

_As part of our "Inside the Plow" series, we will also be showcasing some of these core components of the SnowPlow stack, and talking to their creators. To kick us off, we are delighted to have [Rob Slifka] [robslifka-twitter], VP of [Engineering] [sharethrough-engineering] at [Sharethrough] [sharethrough] in San Francisco, talking to us about his [Elasticity] [elasticity] project. For those who aren't aware: Elasticity is a Ruby library which we use as part of our [EmrEtlRunner] [emr-etl-runner], to make it easy to automate the SnowPlow ETL Job on Amazon Elastic MapReduce. The Elasticity library is a great piece of tech - and indeed was a major factor in us deciding to write EmrEtlRunner in Ruby._

_With the introductions done, let's hand over to Rob to tell us a bit about himself, Elasticity and what he's working on next:_

![rob-slifka-img][rob-slifka-img]

Thanks Alex! Quick bit about me: I've been in software development since the mid 90s working on everything from Java Swing (design automation tools) to embedded Jetty (email encryption) and now a mixture of Ruby and Scala. Since 2010, I’ve been responsible for [engineering] [sharethrough-engineering] at [Sharethrough] [sharethrough] - an ad tech company based out of San Francisco.  We’re building a native advertising platform based on the belief that advertising is no longer sustainable as banners and punch-the-monkey ads and has begun the transition to engaging, non-interruptive choice-based experiences. One thing that a lot of people outside of ad tech don’t realize is that online advertising is synonymous with scale and some of the most interesting technology problems are driven from those demands.  This is where [Elasticity] [elasticity] comes in.

<!--more-->

Our ads report a significant amount of information around user behaviour which we then use in decisioning, pricing and insight derivation (e.g. “Do people share videos before watching them?”).  In the early days, we were handling what we now consider a small volume of logs (1GB/day) with a correspondingly quick and dirty ETL: a log parser that updated the MySQL instance backing our reporting dashboards.  Fast forward to 2013 and our log intake is north of 30GB/day.  With this volume of data and with the insights we wanted to derive, that process didn’t cut it and we determined that the quickest way for us to begin deriving value from our data was via [Amazon Elastic MapReduce] [amazon-emr] (hereon referred to as EMR).

If you’re unfamiliar with AWS service interaction and evolution, it often follows this pattern (using EMR as an example):

1. One way to provide access to EMR might be via Ruby methods that wrap each of these calls, something like [this] [emr.rb].  And by providing only this, you as a developer would be required to understand the EMR API documentation to use Elasticity - still not much better than using the CLI tools
2. Another option might be for Elasticity to say, "Forget about job flows!  I'm going to give you a 'Session' and each step of your job flow is a 'Batch Processing Function'"… and you’d be properly confused, having to map between your understanding of EMR and what Elasticity exposes
3. Elasticity went with a third option - mirroring what was offered in the AWS EMR UI: **Elasticity is a Ruby gem for working with EMR that requires you only understand the EMR user's manual, not the EMR developer’s manual.**

Elasticity v1 split (2) and (3) above, encapsulating an entire “job” as your unit of interaction with the API. You'd create and configure a "HiveJob" and start it. This was assuming that most interactions with EMR are single-step.

Elasticity v2 was a major rewrite focusing wholly on option (3) above.  You create and configure "JobFlows" and add steps to them, just as you do in the UI; a much more comfortable model for those familiar with the EMR UI (which we all were at some point when we learned how to use EMR).

Elasticity v3... who knows?  First and foremost, I work on features that Sharethrough requires. We're in a steady state with EMR at the moment and now I'm hoping the community has some suggestions :)

Thanks for making it this far! **And if anything I touched on sounds interesting, Sharethrough is hiring and we're relo-friendly! Check us out at [Sharethrough Engineering] [sharethrough-engineering].**

[rob-slifka-twitter]: https://twitter.com/robslifka
[sharethrough]: http://www.sharethrough.com
[sharethrough-engineering]: http://www.sharethrough.com/engineering
[elasticity]: https://github.com/rslifka/elasticity
[emr-etl-runner]: https://github.com/snowplow/snowplow/wiki/setting-up-EmrEtlRunner
[amazon-emr]: http://aws.amazon.com/elasticmapreduce/
[rob-slifka-img]: /static/img/blog/2013/03/rob-slifka.jpeg
[emr.rb]: https://github.com/rslifka/elasticity/blob/master/lib/elasticity/emr.rb