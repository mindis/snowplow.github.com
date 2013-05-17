---
layout: section
category: analytics
analytics_category: catalog
title: Affinity analysis - identifying products that sell well together
weight: 4
---

<a name="top"><h1>Market basket analysis / affinity analysis: identifying products and content that sell well together</h1></a>

Identifying "affinities" between products (on a retail site) or content items (on a media site) is useful for a whole host of reasons:

1. The retailer or publisher can use those affinities to recommend products or content, based on the products / content a user has previously purchased or viewed, in the website. (People who bought this product *also* bought this product...)
2. The retailer or publisher has the opportunity to send the user recommendations once they are off the site (e.g. using email marketing), in a targeted bid to bring them back on their site. (*Maybe you'd be interested in X...*)
3. The retailer or publisher can use this data to cluster users by taste, further informing their understanding of the segments of users that make up their customer base.

There are a wide range of algorithms, available on a wide variety of platforms, for calculating affinities between products. In this introductory recipe, we will cover:

1. [The basic market basket analysis: understanding support, confidence and uplift metrics](#metrics)
2. [Performing marketing basket analysis using the apriori algorithm in R](#apriori)
3. [Using the analysis to drive business decision-making](#business)
4. [Expanding on the analysis - zooming out from the basket to look a customer behaviour over longer periods and different events](#expand)


<a name="metrics"><h2>1. The basic market basket analysis: understanding support, confidence and uplift metrics</h2></a>

TO WRITE


Back to [top](#top).

<a name="apriori"><h2>2. Performing marketing basket analysis using the apriori algorithm in R</h2></a>

First, pull the relevant transaction data from Snowplow

{% highlight rout %}
library("RPostgreSQL")
con <- dbConnect(drv, host="<<REDSHIFT ENDPOINT>>", port="<<PORT NUMBER>>", dbname="<<DBNAME>>", user="<<USERNAME>>", password="<<PASSWORD>>")
{% endhighlight %}

Now pull the transaction data from Snowplow:

{% highlight rout %}
t <- dbGetQuery(con, "
SELECT
\"Document No_\" AS \"transaction_id\",
\"SKU\" AS \"sku\"
FROM \"NAV-AllOrders\"
WHERE \"SKU\" <> '2'
AND \"SKU\" <> '1'
GROUP BY \"transaction_id\", \"sku\"
")
{% endhighlight %}

Now we need to group lines by transaction id:

{% highlight rout %}
i <- split(t$sku, t$transaction_id)
{% endhighlight %}

Now we convert the data into a "Transaction" object optimized for running the arules algorithm:

{% highlight rout %}
txn <- as(i, "transactions")
{% endhighlight %}

Finally, we can run our algorithm:

{% highlight rout %}
basket_rules <- apriori(txn, parameter = list(sup = 0.005, conf = 0.01, target="rules"))
{% endhighlight %}

And inspect the results:

{% highlight rout %}
inspect(basket_rules)
{% endhighlight %}

Back to [top](#top).

<a name="business"><h2>3. Using the analysis to drive business decision-making</h2></a>

TO WRITE

Back to [top](#top).

<a name="expand"><h2>4. Expanding on the analysis - zooming out from the basket to look a customer behaviour over longer periods and different events</h2></a>

TO WRITE

Back to [top](#top).