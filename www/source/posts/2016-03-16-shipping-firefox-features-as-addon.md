---
layout: post
title: "Shipping Firefox features as Web Extensions"
date: 2016-03-16 10:40
categories: [mozilla, pm, web-extensions]
mastodon-comments: https://piaille.fr/@technobarje/110443217423916377
---

What about using Web Extension APIs to implement core firefox features?
Here is the opportunity I would like to discuss today.

Not only new features (Hello, Pocket) but also existing built-in features (e.g Session Restore). I [recently blogged][1] about building it as a web extension.

Session restore is a critical feature of Firefox.
It uses many mozilla-only technologies: XUL, XPCOM, message managers, jsm and so on.
It also involves mostly privileged code whereas it isn't really needed, possibly leading to security issues.
Even if it is living in it's own folder _/browser/components/sessionstore/_, there are many hardcoded parts of it elsewhere.
It is clearly not self contained.

Instead of just hardcoding this feature into Firefox, we could possibly ship it as an addon.
That would have various benefits:

  * Let a chance to release this part of firefox faster than the platform,
  * Help us experiment by doing some A/B testing with two very different implementations,
  * Dogfooding Web Extension APIs would make them more stable and ensure they are both useful and powerful,
  * It should open ways to reuse these addons once Servo is ready and implements Web Extension APIs,
  * Last but not least, it dramatically reduces the contribution efforts required to modify a core Firefox feature:
    * Forget about building C++ and having a build environment,
    * You can possibly checkout a small repo instead of all mozilla-central,
    * Do not necessarily have to use various mozilla specific tools like mach,
    * No need to even build Firefox itself, instead you could fetch a nightly build and install the addon on it,
    * And forget about all cryptic technologies that we keep using as ancient relics like xul, xpcom and so on!

About contribution. I asked about how many people contribute(d) to session restore.
There is mostly one active employee working on it: mconley.
Then sparse contributions are being made by other employees like ttaubert, yoric, dragana, mystor, mayhemer,...
But there seem to be only one non-employee contribution made by Allasso Travesser with just one patch.

I'm convinved we can engage more with simplier workflows (Addon versus built-in) and technologies with a lower learning curve (Web Extension vs XUL).

[1]: http://blog.techno-barje.fr/post/2016/03/14/session-restore-web-extension/
