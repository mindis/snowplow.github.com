---
layout: homepage
category: homepage
title: SnowPlow Analytics - your web analytics data in your hands
permalink: index.html
---

<!--Slider-->
<div id="wrapper">
    <div class="slider-wrapper theme-default">
        <div id="slider" class="nivoSlider">
            <img src="/static/img/slider/slide1.png" data-thumb="/static/img/slider/slide1.png" alt="" />
            <img src="/static/img/slider/slide2.png" data-thumb="/static/img/slider/slide2.png" alt="" />
            <img src="/static/img/slider/slide3.png" data-thumb="/static/img/slider/slide3.png" alt="" />
            <a href="/product/get-started.html"><img src="/static/img/slider/slide4.png" data-thumb="/static/img/slider/slide4.png" alt="" /></a>
        </div>
    </div>
    <script type="text/javascript">
		$(window).load(function() {
	    	$('#slider').nivoSlider({
	    		pauseTime: 4500
	    	});
	});
	</script>
</div>

<div id="buttons">
	<div class="big-button" id="left-button"><a href="/product/index.html">Learn more</a></div>
	<div class="big-button" id="right-button"><a href="/product/get-started.html">Setup SnowPlow today</a></div>
</div>

<div class="column">
	<h2>Open source</h2>
	<ul>
		<li><strong>No lock in</strong>. <strong>Your</strong> data is kept on <strong>your</strong> S3 and Redshift account or Infobright instance</li>
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
		{% for post in site.posts limit:6 %}
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
