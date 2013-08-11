---
layout: blog-post
shortenedlink: Towards universal event analytics: building an event grammar
title: Towards universal event analytics: building an event grammar
tags: event analytics grammar model
author: Alex
category: Inside the Plow
---

As we outgrow our "fat table" structure for Snowplow events in Redshift, we have been spending more time thinking about how we should be modelling digital events in Snowplow in the most universal, flexible and future-proof way possible.

When we blogged about [building out the Snowplow event model] [event-model-post] earlier this year, a comment left on that post by Loïc Dias Da Silva made us realize that we were missing an even more fundamental point: defining a Snowplow event **grammar** to underpin our Snowplow event dictionary. Here is part of Loïc's comment - although I would encourage you to read it in full:

_Hi, we're also working on an event model for our global eventing platform but our events currently are more macro, inspired by RDF in a sense:_

_An Actor(id/type) made and Action(verb, context) on another Object(id/type)._

_Each Actor, Action and Object can hold k/v properties._

_The context itself, owned by the action, is a k/v dictionary._

So in designing his event grammar, Loïc was influenced by RDF, the [Resource Description Framework] [rdf], the W3C specifications for modelling relationships to web resources.

An event grammar inspired by RDF is certainly interesting, but I am using a much older, more sophisticated and more tested grammar to write this sentence: the **grammar of human language**. Why not start, then, from the core grammar underpinning English, Latin, Greek, German et al and see how far this approach can take us in modelling events in the digital world?

So, in the rest of this post we will:

1. [Introduce the components of our grammar](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#grammar)
2. [Try it out on some ecommerce events](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#ecommerce)
3. [Try it out on some videogame events](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#videogame)
4. [Try it out on some digital media events](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#media)
5. [Discuss what we have learnt](/blog/2013/08/12/towards-universal-event-analytics-building-an-event-grammar#learnings)

<!--more-->

<h2><a name="grammar">1. The components of our grammar</a></h2>

All of the human languages mentioned above (and many, many others) share the same fundamental building blocks in their grammars for describing an event with a verb in the _active voice_:

![grammar] [grammar]

To go through these in turn:

* **Subject**, sometimes known as the _nominative_ case. This is the entity which is carrying out the action: "**I** wrote a letter"
* **Verb**, this describes the action being done by the subject. Verbs can be in the _active_ or _passive voice_ - but we are only concerned with the active voice in this post. Verbs conjugate in lots of other ways (tense, person, mood etc), but we don't need to worry about these here. "I **wrote** a letter"
* **Object**, aka _Direct Object_ or _accusative_ case. This is the entity to which the action is being done: "I wrote **a letter**"
* **Indirect object**, or _dative_ case. A slightly more tricky concept: this is the entity indirectly affected by the action: "I sent the letter _to_ **Tom**"
* **Prepositional object**. An object introduced by a preposition (in, for, of etc), but not the direct or indirect object: "I put the letter _in_ **an envelope**". In a language such as German, prepositional objects will be found in the _accusative_, _dative_ or _genitive_ case depending on the preposition used
* **Context**. Not a grammatical term, but we will use context to describe the phrases of time, manner, place and so on which provide additional information about the action being performed: "I posted the letter **on Tuesday from Boston**"

With these grammatical building blocks defined, let's put them through their paces modelling some digital events - starting with some online retail events:

<h2><a name="ecommerce">2. Modelling some ecommerce events</a></h2>

Here are some ecommerce events mapped to our grammatical model:

![ecomm1] [ecomm1]

In this event, a shopper (Subject) views (Verb) a t-shirt (Object) while browsing an online store (Context).

![ecomm2] [ecomm2]

Here we introduce an indirect object which has been affected by the event: the shopper (Subject) adds (Verb) a t-shirt (Object) to her shopping basket (indirect object). Again, this is while browsing (Context).

![ecomm3] [ecomm3]

Here we have an object introduced by preposition: the shopper (Subject) pays (Verb) for his order (Prepositional Object). This is all within the checkout flow (Context).

<h2><a name="videogame">3. Modelling some videogame events</a></h2>

So far so good, but how well does this model work with events generated by a gaming session?

![videogame1] [videogame1]

In a gifting screen within the game (Context), the player (Subject) gifts (Verb) some gold (Object) to another player (Indirect Object).

![videogame2] [videogame2]

During a two-player skirmish (Context), the first player (Subject) kills (Verb) the second player (Object) using a nailgun (Prepositional Object). This illustrates how your end-users can be the object of events, not just their subjects

![videogame3] [videogame3]

Here we illustrate a reflective verb: through a grinding experience (Context), the player (Subject) levels herself up (Verb, reflexive). A reflexive verb is one where the subject and the direct object are the same.

<h2><a name="media">4. Modelling some digital media events</a></h2>

Finally, let's map our new event grammar onto media and publishing:

![media1] [media1]

While consuming media on your site (Context), a user (Subject) reads (Verb) an article (Object).

![media2] [media2]

Wanting to share content socially (Context), a user (Subject) shares (Verb) a Video (Object) on Twitter (Prepositional Object).

![media3] [media3]

Working from the moderation UI (Context), an administrator (Subject) bans (Verb) user #23 (Object). This illustrates how an end-user can be the direct object of an event, and how someone other than an end-user can be the subject of the event.

<h2><a name="learnings">5. What have we learnt</a></h2>

As you can see, it is relatively straightforward to map any digital event into these 6 "slots" of: Subject, Verb, Object, Indirect Object, Prepositional Object and Context. This is unsurprising: this fundamental grammar has been accurately modelling events across many human languages across thousands of years.

Going through the above exercise, 

[event-model-post]: http://snowplowanalytics.com/blog/2013/02/04/help-us-build-out-the-snowplow-event-model/
[rdf]: http://en.wikipedia.org/wiki/Resource_Description_Framework

[grammar]: /static/img/blog/2013/07/XXX.png