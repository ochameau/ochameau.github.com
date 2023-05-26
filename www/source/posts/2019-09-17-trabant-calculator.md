---
layout: post
title: "Trabant Calculator - A data visualization of TreeHerder Jobs durations"
date: 2019-09-17 17:00
categories: [mozilla, pm]
mastodon-comments: https://piaille.fr/@technobarje/111161673300060672
---

[Link to this tool][1] (its [sources][2])

## What is this tool about?

Its goal is to give a better sense on how much computations are going on in Mozilla automation.
Current [TreeHerder UI][3] surfaces job durations, but only per job. To get a sense on how much we stress
our automation, we have to click on each individual job and do the sum manually.
This tool is doing this sum for you.
Well, it also tries to rank the jobs by their durations. I would like to open minds about the possible impact on the environment we may have here.
For that, I am translating these durations into something fun that doesn't necessarily make any sense.

## What is that car's GIF?
The car is a [Trabant][4]. This car is often seen as symbolic of the former East Germany and the collapse of the Eastern Bloc in general. This part of the tool is just a joke. You may only consider looking at durations, which are meant to be trustable data. Translating a worker duration into CO2 emission is almost impossible to get right. And that's what I do here: Translate worker duration into a potential energy consumption, which I translate into a potential CO2 emission, before finally translating that CO2 emission into the equivalent emission of a trabant over a given distance in kilometers.

## Power consumption of an AWS worker per hour
Here is a really weak computation of Amazon AWS CO2 emissions for a t4.large worker.
The power usage of the machines these workers are running on could be 0.6 kW.
Such worker uses 25% of these machines.
Then let's say that Amazon [Power Usage Effectiveness][5] is 1.1.
It means that one hour of a worker consumes **0.165 kWh** (0.6 * 0.25 * 1.1).

## CO2 emission of electricity per kWh
Based on US Environmental Protection Agency ([source][6]), the average CO2 emission per MWh is 998.4 lb/MWh.
So 998.4 * 453.59237(g/lb) = 452866 g/MWh, and, 452866 / 1000 = **452 g of CO2/kWh**.
Unfortunately, the data is already old. It comes from a 2018 report, which seems to be about 2017 data.

## CO2 emission of a Trabant per km
A Trabant emits **170 g of CO2 / km** ([source][7]). (Another [source] reports 140g, but let's say it emits a lot.)

## Final computation

    Trabant's kilometers = "Hours of computation" * "Power consumption of a worker per hour"
                           * "CO2 emission of electribity per kWh"
                           / "CO2 emission of a trabant per km"
    Trabant's kilometers = "Hours of computation" * 0.165 * 452 / 170
    => Trabant's kilometers = "Hours of computation" * 0.4387058823529412 **

## All of this must be wrong

Except the durations! Everything else is highly subject to debate. <br/>
Sources are [here][2], and contributions or feedback are welcomed.

[1]: https://ochameau.github.io/trabant-calc/
[2]: https://github.com/ochameau/trabant-calc/
[3]: https://treeherder.mozilla.org/#/jobs?repo=mozilla-central
[4]: https://en.wikipedia.org/wiki/Trabant
[5]: https://en.wikipedia.org/wiki/Power_usage_effectiveness
[6]: https://www.epa.gov/sites/production/files/2018-02/documents/egrid2016_summarytables.pdf
[7]: http://www.trabantforum.de/ubb/Forum1/HTML/007230.html
[8]: https://www.focus.de/auto/fahrberichte/tid-6214/fahrbericht-trabant-p-601l_aid_60251.html

