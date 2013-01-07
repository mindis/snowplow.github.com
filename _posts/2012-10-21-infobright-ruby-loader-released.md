---
layout: blog-post
shortenedlink: infobright-ruby-loader-released
title: Infobright Ruby Loader Released
author: Alex
category: Releases
---

We're pleased to start the week with the release of a new Ruby gem, our [Infobright Ruby Loader] [irl-repo] (IRL).

At SnowPlow we're committed to supporting multiple different storage and analytics options for SnowPlow
events, alongside our current Hive-based approach. One of the alternative data stores we are working with
is [Infobright] [infobright], a columnar database which is available in open source and commercial versions.

For all but the largest SnowPlow users, columnar databases such as Infobright should be an attractive
alternative to doing all of your analysis in Hive. The main advantages of columnar databases are as follows:

1. Scale to terabytes (although not petabytes, unlike Hive)
2. Fixed cost (dedicated RAM-heavy analytics server), versus pay-as-you-go querying on Amazon EMR
3. Significantly faster query times – typically seconds, not minutes
4. Plug in to many analytics front ends e.g. Tableau, Qlikview, R

So, open source columnar databases like Infobright Community Edition (ICE) are a good fit for SnowPlow analytics.
Unfortunately, when we started to load SnowPlow event logs into ICE, we realised that there wasn't a good
data-loading solution for Infobright in Ruby, our ETL language of choice. So, we built one :-)

Our freshly minted [Infobright Ruby Loader] [irl-repo] (IRL) can be used in two different ways:

1. **As a command-line tool** - for manual loading of data into Infobright at the command-line. No Ruby expertise required
2. **As part of another application** - because it's a Ruby gem with a Ruby API, IRL can be integrated into larger Ruby ETL processes

We will be using IRL at SnowPlow as part of our larger ETL process to load SnowPlow events into ICE for analysis - we hope
to roll this out within the next few weeks.

In the meantime, we hope that IRL is useful to people in the Infobright community who need to run data loads at the
command-line; IRL was inspired by [ParaFlex] [paraflex], an excellent Bash script from the Infobright team to perform
parallel loading of Infobright, and can be used as a direct alternative to ParaFlex.

To find out more about our Infobright Ruby Loader, please check out the detailed [README] [readme] in the GitHub repository.
And please direct any questions through the [usual channels] [talk-to-us]!

[irl-repo]: https://github.com/snowplow/infobright-ruby-loader
[infobright]: http://www.infobright.org/
[paraflex]: http://www.infobright.org/Blog/Entry/unscripted/
[readme]: https://github.com/snowplow/infobright-ruby-loader/blob/master/README.md
[talk-to-us]: https://github.com/snowplow/snowplow/wiki/Talk-to-us