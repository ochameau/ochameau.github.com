---
layout: post
title: "Shipping Firefox features as a Web Extensions"
date: 2016-03-14
comments: true
categories: [mozilla, pm, web-extensions]
---

What about using Web Extension APIs to implement core firefox features?
Here is the opportunity I would like to raise today.

Not just new features like Hello or Pocket, but existing features.
Like session restore for example, I [recently blogged](http://blog.techno-barje.fr/blog/post/2016/03/14/session-restore-web-extension/) about an addon reimplementing it.

Session restore is a critical feature of Firefox.
It uses many mozilla-only technologies: XUL, XPCOM, message managers, jsm and so on.
It also involves mostly privileged code whereas it isn't really needed, possibly leading to security issues.
Even if it is living in it's own folder /browser/components/sessionstore/, there is many hardcoded parts of it elsewhere.
It is clearly not self contained.

Instead of just hardcoding this feature into Firefox, we could possibly ship it as an addon.
That would have various benefits:

  * Let a chance to release this part of firefox faster than the platform,
  * Help us experiment by doing some A/B testing with two very different implementations,
  * Dogfooding Web Extension APIs would make them more stable and ensure them to be useful and powerful,
  * It should open ways to reuse these addons once Servo is ready and implements Web Extenson APIs,
  * Last but not least, it dramatically reduces the contribution efforts required to modify a core Firefox feature:
    * Forget about building C++ and having a build environment,
    * You can possibly checkout a small repo instead of all mozilla-central,
    * Do not necessarely have to use various mozilla specific tools like mach,
    * No need to even build Firefox itself, instead you could fetch a nightly build and install the addon on it,
    * And forget about all cryptic technologies that we keep using as ancient relics like xul, xpcom and so on!

About contribution. I asked about how many people contribute[d] to session restore.
There is mostly one active employee working on it: mconley.
Then various sparse contributions are being made by other employees like ttaubert, yoric, dragana, mystor, mayhemer,...
But there seem to be only one non-employee contribution made by Allasso Travesser with just one patch.
Please correct me if I am wrong, but it doesn't look like this feature is much accessible to contribution.

