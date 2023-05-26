---
layout: post
title: "Interfaces experiments for and from Firefox"
date: 2016-06-28 11:30
categories: [mozilla, pm, html]
mastodon-comments: https://piaille.fr/@technobarje/110443218332741943
---

What about easily experimenting new interfaces for Firefox?
Written with regular web technologies, served from http, refreshable via a key shortcut.

## How so?

Follow these 3 steps:

- Ensure running [Firefox Nightly][4],
- Install [this addon][3],
- Visit this link: [browserui://rawgit.com/ochameau/planula-browser-advanced/addon-demo/][5].

You should see a page asking you to confirm testing this browser experiment.
Once you click on the install button, the current Firefox interface will be replaced on the fly.

<iframe width="420" height="315" src="https://www.youtube.com/embed/JZemGiSl5LA" frameborder="0" allowfullscreen></iframe>

This interface is a old version of [Browser.html][6]. But instead of requiring a custom runtime, this is just a regular web site, written with web technologies and fetched from github at every startup.
If you want to check if this is a regular web page, just look at the sources:
  view-source:http://rawgit.com/ochameau/planula-browser-advanced/addon-demo/

If needed you can revert at any time back to default Firefox UI using the "Ctrl + Alt + R" shortcut.

Want to see more interfaces, here are some links:

* [browserui://rawgit.com/ochameau/planula-minimal-browser/master/index.html][12] Simplest interface ever. Just one HTML file.
* [browserui://rawgit.com/ochameau/planula-browser-advanced/addon-demo/index.html?tabsui=sidetabs][14] Tabs on the side.
* Yours?


## How does it work ?

The addon itself is simple. It does 4 things:

* Install a custom protocol handler for browserui:// in order to redirect to the install page,
* The install page then communicate with a privileged script to set the "browser.chromeURL" preference which indicates the url of the top level document,
* While we set this preference, we also grant additional permissions to the target url to use the "mozbrowser" property on iframes,
* Finnaly, it reload the top level document with the target url.

The &lt;iframe mozbrowser> tag, while beeing non-standard, allows an iframe to act similarly to a &lt;xul:browser> or a &lt;webview> tag. It allows to safely open websites within the interface. Webpages loaded inside it also run into a seperated content process (e10s) contrary to regular &lt;iframe> tag.


## Why?

Last year, during Whistler All Hands, there was this "Kill XUL" meeting.
[Various options][1] were discussed. But it is unclear that any has been really looked into.
Except may be the electron option, via Tofino project.

Then a thread was posted on [firefox-dev][2]. At least Go faster and new Test Pilot addons
started using HTML for new self-contained features of Firefox, which is already a great step forward!

But there was no experiment to measure how we could leverage HTML to build browsers within Mozilla.

Myself and [Vivien][7] started looking into this and ended up releasing this addon.
But we also have some more concrete plan on how to slowly migrate Firefox full of XUL and cryptic XPCOM/jsm/chrome technologies
to a mix of Web standards + Web extensions. We do have a way to make Web extensions to work within these new HTML interfaces.
Actually, it already supports basic features. When you open the browserui:// links, it actually opens an HTML page from a Web extension.


## How to hack your own thing?

First, you need to host some html page somewhere.
Any website could be loaded. [browserui://localhost/][10] if you are hosting files locally.
But you may also just load google if you want to [browserui://google.com/][11].
Just remember the "Ctrl + Alt + R" shortcut to get back to the default Firefox UI!

The easiest is probably to fork [this one-file minimal browser][8], or directly the [demo browser][9].
Host it somewhere and open the right browserui:// url.
browserui:// just maps one to one to the same URL starting with "http" instead of "browserui".
Given that this addon is just a showcase, we don't support https yet.

Then, change the files, hit "Ctrl + R" and your browser UI is going to be reloaded, fetching resources again from http.

Once you have something you want to share, using github is handy.
If you push files to let say the "mozilla" account and "myui" as the repository name,
then you can share simply via the following link:

  browserui://rawgit.com/mozilla/myui/master/

But there is many ways to control which particular version you want to share.
Sharing another branch, like the "demo" branch:

  browserui://rawgit.com/mozilla/myui/demo/

Or a particular changeset:

  browserui://rawgit.com/mozilla/myui/5a931e3e0046ccde6d4ad3a73e93016bcc3a9650/


## Contribute

This addon lives on github, over here: [https://github.com/ochameau/browserui][13].
Feel free to submit Issues or Pull requests!


## What's next?

* Demonstrate WebExtension based browser and the ability to implement Web Extension APIs from an HTML document.
* Tweak the platform to handle OS integration better from low privileged HTML document.
Things like popup/panels, transparent windows, native OS controls, menus, ...
* Also tune the platform to be able to load existing browser features from HTML like about: pages, view-source:, devtools, ...

Actually, we already have various patches to do that and would like to upstream them to Firefox!


[1]: https://public.etherpad-mozilla.org/p/kill-xul-planning
[2]: https://mail.mozilla.org/pipermail/firefox-dev/2015-July/003063.html
[3]: http://techno-barje.fr/public/browser_ui-0.1.2-fx.xpi
[4]: https://nightly.mozilla.org/
[5]: browserui://rawgit.com/ochameau/planula-browser-advanced/addon-demo/
[6]: https://github.com/browserhtml/browserhtml/
[7]: https://github.com/vingtetun/
[8]: https://github.com/ochameau/planula-minimal-browser/
[9]: https://github.com/ochameau/planula-browser-advanced/tree/addon-demo/
[10]: browserui://localhost/
[11]: browserui://google.com/
[12]: browserui://rawgit.com/ochameau/planula-minimal-browser/master/index.html
[13]: https://github.com/ochameau/browserui
[14]: browserui://rawgit.com/ochameau/planula-browser-advanced/addon-demo/index.html?tabsui=sidetabs
