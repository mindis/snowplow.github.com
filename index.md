---
layout: homepage
category: homepage
title: SnowPlow Analytics - your web analytics data in your hands
permalink: index.html
---

<div class="shortcolumn">
	<h2>Your web data in your hands</h2>
	<p>Direct access to every line of your web analytics data</p>
	<ul>
		<li><strong>Drill down</strong> to <strong>individual customers</strong> and <strong>individual events</strong> on their journeys</li>
		<li>Zoom out to <strong>compare</strong> the <strong>behaviours between user cohorts</strong></li>
		<li><strong>Segment your audience</strong> by behaviour</li>
		<li>Develop and power <strong>recommendation and personalisation engines</strong> based on user behaviour</li>
	</ul>
</div>

<div class="shortcolumn">
	<h2>The widest range of analytics</h2>
	<p>Perform <strong><i>any</i></strong> analytics, incl:</p>
	<ul>
		<li><a href="/analytics/customer-analytics/overview.html">Customer analytics</a> e.g. cohort analysis, customer lifetime value, attribution</li>
		<li><a href="/analytics/platform-analytics/overview.html">Platform analytics</a> e.g. event stream analysis, flexible funnels</li>
		<li><a href="/analytics/catalogue-analytics/overview.html">Catalogue analytics</a> Compare the performance of products and media</li>
		<li>Use your favorite tools incl: <a href="http://www.r-project.org/">R</a>, <a href="http://www.tableausoftware.com/">Tableau</a> and <a href="http://mahout.apache.org/">Mahout</a></li>
	</ul>
	<p>Explore the <a href="http://hive.apache.org/">Analytics Cookbook</a> for more.</p>
</div>

<div class="shortcolumn">
	<h2>Powerful, scalable, robust</h2>
	<ul>
		<li><strong>Hadoop powered</strong> web analytics</li>
		<li>Scales to <strong>billions of events</strong> (rows of data) per day</li>
		<li>Data can be stored in <strong>Amazon S3</strong> or <strong>Infobright Community Edition</strong></li>
		<li>Data can be analysed using <a href="http://hive.apache.org/">Apache Hive</a> and a range of other Hadoop and non-Hadoop tools</li>
	</ul>
</div>

<div class="column">
	<h2>Open source</h2>
	<ul>
		<li><strong>No lock in</strong>. <strong>Your</strong> data is kept on <strong>your</strong> S3 account or Infobright instance</li>
		<li><strong>Active community</strong> extending SnowPlow into new platforms and analyses tools</li>
		<li>Complete code available on <a href="https://github.com/snowplow/snowplow">Github</a></li>
	</ul>
	<p style="text-align:center;"><a href="https://github.com/snowplow/snowplow"><img src="/static/img/github.png" width="150" /></a></p>
	<ul>
		<li><a href="https://github.com/snowplow/snowplow/wiki/SnowPlow-setup-guide">Setup guide</a> and <a href="https://github.com/snowplow/snowplow/wiki/SnowPlow-technical-documentation">technical documentation</a> available on <a href="https://github.com/snowplow/snowplow/wiki">wiki</a></li>
	</ul>
</div>

<div class="column">
	<h2>Latest from the blog</h2>
	<ul>
		{% for post in site.posts limit:7 %}
		<li><a href="{{ post.url }}">{{ post.title }}</a> <abbr>{{ post.date | date_to_string }}</abbr></li>
		{% endfor %}
	</ul>			
</div>

<div class="column">
	<h2>SnowPlow on Twitter</h2>
	<a class="twitter-timeline" width="266" height="200" href="https://twitter.com/SnowPlowData" data-widget-id="266927205374885888">Tweets by @SnowPlowData</a>
	<script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>

</div>

[customer-analytics]: /analytics/customer-analytics/overview.html
[platform-analytics]: /analytics/platform-analytics/overview.html
[catalogue-analytics]: /analytics/catalogue-analytics/overview.html
[analytics-cookbook]: /analytics/index.html
[apache-hive]: http://hive.apache.org/
[amazon-emr]: http://aws.amazon.com/elasticmapreduce/
[infobright]: http://www.infobright.org/
[github-repo]: http://github.com/snowplow/snowplow
[setup-snopwlow]: /product/get-started.html
[problems-built-to-solve]: /product/why-snowplow.html
[more-sources-of-support]: /services/index.html#other-sources
[technical-architecture]: /product/technical-architecture.html
[professional-services]: /services/index.html
[blog]: /blog.html
[Twitter]: http://twitter.com/snowplowdata
[r-project]: http://www.r-project.org/
[tableau]: http://www.tableausoftware.com/
[microstrategy]: http://www.microstrategy.co.uk/
[mahout]: http://mahout.apache.org/
[weka]: http://weka.pentaho.com/
[product]: /product/index.html
[snowplow-roadmap]: /product/roadmap.html
