---
layout: blog-post
shortenedlink: SnowPlow Arduino Tracker released
title: SnowPlow Arduino Tracker released - sensor and event analytics for the internet of things
tags: snowplow arduino tracker internet-of-things
author: Alex
category: Releases
---

Today we are releasing our first non-Web tracker for SnowPlow: an event tracker for the [Arduino] [arduino] open-source electronics prototyping platform. The [SnowPlow Arduino Tracker] [snowplow-arduino-tracker] lets you track sensor and event-stream information from one or more IP-connected Arduino boards.

We chose this as our first non-Web tracker because we're hugely excited about the potential of sophisticated analytics for the [Internet of Things] [iot], following in the footsteps of great projects like [Cosm] [cosm] and [Exosite] [exosite]. And of course, SnowPlow's extremely-scalable architecture is a great fit for the huge volumes of events and sensor readings which machines are able to generate - you could say that we are already "machine-scale"!

As far as we know, this is the first time an event analytics platform has released a dedicated tracker for the maker community; we can't wait to see what the Arduino and SnowPlow communities will use it for! Some ideas we had were:

1. Deploying a set of SnowPlow-connected Arduinos to monitor the environment (temperature, humidity, light levels etc) in your home
2. Tracking the movement of products around your shop/warehouse/factory using Arduino, [RFID readers] [arduino-rfid] and SnowPlow
3. Sending vehicle fleet information (locations, speeds, fuel levels etc) back to SnowPlow using Arduino's [3G and GPS] [3g-gps] shields 

In fact Alex has gone ahead and written a sample Arduino sketch to track temperatures and log the readings to SnowPlow - you can find his project on GitHub at [alexanderdean/arduino-temp-tracker] [arduino-temp-tracker].

Want to find out more? To get started using our event tracker for Arduino, check out:

* Our [Technical Documentation] [tech-docs]
* Our [Setup Guide] [setup-guide]

Happy making!

[arduino]: http://www.arduino.cc/
[snowplow-arduino-tracker]: https://github.com/snowplow/snowplow-arduino-tracker

[iot]: http://www.forbes.com/sites/ericsavitz/2013/01/14/ces-2013-the-break-out-year-for-the-internet-of-things/

[cosm]: https://cosm.com/
[exosite]: http://exosite.com/

[arduino-rfid]: http://arduino.cc/blog/category/wireless/rfid/
[3g-gps]: http://www.cooking-hacks.com/index.php/documentation/tutorials/arduino-3g-gprs-gsm-gps

[arduino-temp-tracker]: https://github.com/alexanderdean/arduino-temp-tracker

[tech-docs]: https://github.com/snowplow/snowplow/wiki/Arduino-Tracker
[setup-guide]: https://github.com/snowplow/snowplow/wiki/Arduino-Tracker-Setup