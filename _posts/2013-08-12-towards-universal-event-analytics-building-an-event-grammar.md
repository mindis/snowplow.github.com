---
layout: blog-post
shortenedlink: Towards universal event analytics: building an event grammar
title: Towards universal event analytics: building an event grammar
tags: event analytics grammar model
author: Alex
category: Inside the Plow
---

As we outgrow our "fat table" structure for Snowplow events in Redshift, we have been spending more time thinking about how we should be modelling digital events in Snowplow in the most universal, flexible and future-proof way possible.

When we blogged about [building out the Snowplow event model] [event-model-post] earlier this year, a comment left on that post by Loïc Dias Da Silva made us realize that we were missing an even more fundamental point: defining a Snowplow event **grammar** to underpin our Snowplow event dictionary. Here is part of Loïc's comment - though I would encourage you to read it in full:

_Hi, we're also working on an event model for our global eventing platform but our events currently are more macro, inspired by RDF in a sense:_

_An Actor(id/type) made and Action(verb, context) on another Object(id/type)._

_Each Actor, Action and Object can hold k/v properties._

_The context itself, owned by the action, is a k/v dictionary._

So in designing his event grammar, Loïc was influenced by RDF, the [Resource Description Framework] [rdf], the W3C specifications for modelling relationships to web resources.

An event grammar inspired by RDF is certainly interesting, but I am using a much older, more sophisticated and more tested grammar to write this sentence: the **grammar of human language**. Why not start, then, from the core grammar underpinning English, Latin, Greek, German et al and see how far this approach can take us in modelling events in the digital world?

In the rest of this post we will:

1. [Introduce the components of our grammar](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#grammar)
2. [Try it out on some ecommerce events](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#ecommerce)
3. [Try it out on some digital gaming events](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#gaming)
4. [Try it out on some digital media events](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#media)
5. [Discuss what we have learnt](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#learnings)

<!--more-->

<h2><a name="grammar">1. The components of our grammar</a></h2>

All of the human languages mentioned above (and many, many others) share the same fundamental building blocks in their grammars for describing an event with a verb in the _active voice_:

![grammar] [grammar]

To go through these in turn:

* **Subject**, sometimes known as the _nominative_. This is the entity which is carrying out the action: "**I** wrote a sentence"
* **Verb**, this describes the action being done by the Subject. Verbs can be in the _active_ or _passive voice_ - but we are only concerned with the active voice in this post. Verbs conjugate in lots of other ways (tense, person, mood etc), but we don't need to worry about these here: "I **wrote** a sentence"
* **Object**, or _accusative_. This is the entity to which the action is being done: "I wrote **a sentence**"
* **Indirect object**, or alternatively the _dative_. A slightly more tricky concept: this is the entity indirectly affected by the action
* ****

<h2><a name="ecommerce">2. Modelling some ecommerce events</a></h2>

<h2><a name="gaming">3. Modelling some digital gaming events</a></h2>

<h2><a name="media">4. Modelling some digital media events</a></h2>

<h2><a name="learnings">5. What have we learnt</a></h2>

[event-model-post]: http://snowplowanalytics.com/blog/2013/02/04/help-us-build-out-the-snowplow-event-model/
[rdf]: http://en.wikipedia.org/wiki/Resource_Description_Framework

[grammar]: /static/img/blog/2013/07/XXX.png