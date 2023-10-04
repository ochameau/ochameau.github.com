---
layout: post
title: "Minimal blog post setup - Simpler Faster Stronger"
date: 2023-10-03 10:00
categories: [html]
mastodon-comments: https://piaille.fr/@technobarje/111170218587454945
---

I could no longer build my blog...
so I finally escaped from Jekyll and its [Octopress](http://octopress.org/) fork!

Using latest ruby would throw many exceptions.
I tried using the old versions of ruby thanks to Docker, but none of them were working either.
I tried to debug a few exceptions, but I just kept having too many.

The only way out would have been to migrate to lastest jekyll, but this require to redo my design again using jekyll templates instead of octopress.

Instead, I decided to stop using any framework to avoid any similar issue in the future...

# Simpler

I still had to redo my design, but in pure HTML+CSS, which was simplier as no matter what the framework you are using, you have to know HTML and CSS...
But you no longer have to understand, nor maintain the additional bits of the framework.

There is significantly less files to be aware of. This ease the comprehension of the overall setup.

For now, I'm using the simplest possible template files with naive regexp+replace done by a JS file.

# Faster

This migration has a very nice impact on performance. The blog looks almost the same, but is much more conservative in resources!

Let's compare my [very first blog post](http://blog.techno-barje.fr/post/2007/12/21/lets-go/).
Its markdown sources is only 1.1K large.

With the previous jekyll setup that simple blog post would spawn 40 requests for a total of 1803kB, but only 1600kB transferred thanks to http compression.

Now, with this new naive setup the same post only spawns 6 requests for a total 99kB with the same transferred size.
Most of it comes from the header image which is 85kB...

The 6 requests are:
* the html page (2kB compared to 1.1kB markdown sources)
* the header image
* the favicon
* one unique CSS file
* one unique JS file, implementing Declarative and single file Web Component and the mastodon comment at the footer
* one unique Declarative Web Component, for blog posts

# Stronger

For the templates, and the parsing of markdown blog posts, I still depend on NodeJS with a custom build script.
But the APIs involved here are so trivial that it should unlikely break in the future.
No more dependency with any particular templating system which may change over time,
no more dependency on any particular library which may itself depend on a language/interpreter/compiler
which may ultimately force you to update your templates by dependency chains.

# There is more

I also moved from Disqus to the fediverse for comments. I'll say a few words about this in another blog post.

I mentioned "Declarative single file Web Component", same, I'll detail this in a next blog post.
