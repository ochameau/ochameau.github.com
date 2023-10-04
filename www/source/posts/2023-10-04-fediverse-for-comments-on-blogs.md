---
layout: post
title: "Using the fediverse/Mastodon for comments on blogs"
date: 2023-10-04 9:30
categories: [fediverse, pm]
mastodon-comments: https://piaille.fr/@technobarje/111175566839554757
---

Yesterday I moved away from Jekyll to build this blog ([see more](/post/2023/10/03/minimal-blog-post-setup/)).\
But while doing that, I also moved away from Disqus for handling the comments on my blog.\
This wasn't a trivial move as it was hard to keep the old comments.
I realized late that I was bound to this provider.

A nice list of self-hosted solutions is available on [lisakov.com](https://lisakov.com/projects/open-source-comments/).
But I was scared about the maintenance and hosting cost of such option.

As a long time user of Matrix, I gave a try to [Castus Comments](https://cactus.chat/), but it was a bit too complex to manage.

I finally ended up discovering a very simple snippet on [carlschwan.eu](https://carlschwan.eu/2020/12/29/adding-comments-to-your-static-blog-with-mastodon/).
This uses the Fediverse to expose comments on a static blog.
So all the credits go to [carlschwan.eu](https://carlschwan.eu/), [@veronica@mastodon.online](https://mastodon.online/@veronica/110028499674748958) and [@cassidy@blaede.family](https://mastodon.blaede.family/@cassidy).

This is just perfect:
* super simple, a couple tens of lines of JavaScript.\
  This is also very lightweight for people visiting the blog. Much much lighter than Disqus!
* I used to announce new blog post on Twitter/Mastodon.\
  The comments sent on this announcement message are now merged with comments visible on the blog!
* No hosting to maintain as it relies on the fediverse server.
* No longer bound to a unique service provider. I can move to another fediverse server.
* The moderation is part of the fediverse, so I should be able to manage the comments.

I can only think about three downsides so far:
* It requires people to be on the fediverse to be able to comment.\
  But any service compatible with Mastodon. You no longer have to register against Disqus.\
  Also, you have to write your comment on the Fediverse web page. It would require more work and maintaince to offer that from the page.
* I have to manually create a new message on my mastodon server for each new blog post.\
  But that's something I was doing anyway to announce new blog posts...
* Mastodon doesn't allow migrating existing messages to a new server.\
  So it may be hard to keep the past message while migrating to something new.\
  But as this is an open service with many open APIs, it should still be easy to export with custom scripts.
