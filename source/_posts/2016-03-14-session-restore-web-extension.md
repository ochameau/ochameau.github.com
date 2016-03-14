---
layout: post
title: "Session store as a Web Extension"
date: 2016-03-14
comments: true
categories: [mozilla, pm, web-extensions]
---

Session Restore is a built-in Firefox feature which preserve user data after a crash or an unexpected close.
I spent a little time exploring if it is possible to build such a feature as an replaceable web extension.

Here is a sketch of session store implemented as a web extension:
  <iframe width="420" height="315" src="https://www.youtube.com/embed/58vPBJWmAig" frameborder="0" allowfullscreen></iframe>

This addon currently save'n restore:

* tabs (the url for each tab and the tab order)
* form values
* scroll positions

Missing features (compared to the built-in session restore):

* Does not restore session storage
* Always restore the previous session
* I have no idea what it does regarding private browsing
* No dedicated about:sessionrestore page
* Does not save tab history. Instead it just saves the current tab document/form/scroll

To get the above points working, it is a matter of time and possibly some tweaks to the current Web Extensions APIs.

<br/>
Yes. It is possible to implement a core Firefox feature with the [in-progress implementation][3] of Web Extension APIs.
It also shows the limitations of the current Chrome APIs. For example in order to fully support tab history, the APIs may needs to be extended.

Source code is available on [github][1].
A [pre-release version][2] is also available. Don't forget to toggle `xpinstall.signatures.required` preference to false from about:config to be able to install it.

[1]: https://github.com/ochameau/session-restore-webext/
[2]: https://github.com/ochameau/session-restore-webext/releases/download/v0.1-beta/sessionstore.mozilla.org-v0.1-beta.xpi
[3]: https://bugzilla.mozilla.org/show_bug.cgi?id=1214433
