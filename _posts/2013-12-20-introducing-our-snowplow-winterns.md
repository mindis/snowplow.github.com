---
layout: blog-post
shortenedlink: Introducing our Snowplow winterns
title: Introducing our Snowplow winterns
tags: snowplow intern wintern internship
author: Alex
category: Recruitment
---

Just over two months ago we announced our winter internship program for open source hackers, [right here on this blog] [original-post]. We had no idea what response kind of response we would receive - this was our first attempt at designing an internship program, and we had never heard of a startup (even an open source company like ours) recruiting _remote_ interns. As it turned out, we were delighted by the response we received, and we decided to make offers to **three** very talented "winterns" from around the world, rather than the one or two originally planned.

This week saw all three of our winterns working hard on their respective Snowplow projects, and so we wanted to take this opportunity to introduce each of them to the community, as well as giving a little more background on the projects they are working on:

## Brandon Amos: a new stream-based Scala collector for Snowplow

Brandon Amos is one of our two remote winterns.

Brandon is based on the East Coast of the US and is a third-year CS undergraduate at Virginia Tech. Outside of computer science, Brandon is an indie guitarist, classical pianist, and symphonic trumpeter. During the winternship, Brandon aims to learn more about Scala and associated libraries, such as Akka and Spray, so he can use them in his own work.

Brandon is working on a new stream-based event collector for Snowplow, written in Scala. The original plan was for this new collector to collect events from Snowplow trackers over HTTP and then emit them onto a [Kafka] [kafka] queue. However, prior to Brandon starting, we were given early access to [Amazon Kinesis] [kinesis], the new fully-managed stream processing service from AWS; we decided it makes more sense to focus on Kinesis as the first target for our new Scala collector.

Brandon's new Scala collector is being built on top of Spray (aka akka-http), a Scala/Akka toolkit for building REST/HTTP-based integration layers. As well as building the 

You can follow Brandon's progress in the xxx.

## Jiawen Zhou: a new forex library for Scala

Jiawen Zhou is working with us here at Snowplow HQ.

Jiawen is a second-year MEng undergrad at Imperial in London; she likes basketball and tells us _"I joined Snowplow because I wanted a chance to program in new languages which I am interested in. I hope I can learn from here and contribute at the end of my winternship."_

PROJECT DESC TO COME.

## Anuj More: a new Python Tracker for Snowplow

Anuj More is the second of our remote winterns.

Anuj is a recent IT graduate of Mumbai University, and is still based in the city. Anuj is ambidextrous, a huge "A Bit of Fry and Laurie" fan, and a Beatles lover. Through this winternship, Anuj is keen to find out how FOSS startups work, including the challenges on the business side of things. He also notes that _"this will be my first professionally written Python project; so excited about that too."_

PROJECT DESC TO COME.

[original-post]: /blog/2013/10/07/announcing-out-winter-open-source-internship-program/