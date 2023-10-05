---
layout: post
title: "Declarative Web Component to replace build-time HTML templates"
date: 2023-10-05 12:20
categories: [html, pm]
mastodon-comments: https://piaille.fr/@technobarje/111181914357167949
---

Recently I moved away from Jekyll to build this blog ([see more](/post/2023/10/03/minimal-blog-post-setup/)).\
While doing so I also moved away from the traditional HTML templates.\
Instead I started using a "single file declarative web component".\
The nice outcome is that the HTML page now mostly contains the text content of the blog post!\
Do not hesitate to view the source of this page :)


This idea of "single file Web Component" actually comes from Tomasz Jakut (CK Editor) very simple JavaScript loader [described over there](https://ckeditor.com/blog/implementing-single-file-web-components/).

# "Single File"

In one file you can bundle the HTML, the CSS and the JavaScript for a given Web Component.\
This is handy as you only have one file to register.\
On this blog, all the HTML pages displaying a blog post will uses a unique Web Component to implement and display the blog design/template.\
Instead of having a build step processing tool duplicating the template on every single HTML page,
the browser engine use this unique Web Component to display all the blog post the same way.

Here is an overview of this Web Component.\
You can see the header with the blog image, the navigation links, the footer,
and finally in middle of this, a `<slot>` to define where the blog post content should be put.
```
<template>
  <header>
  ...
  </header>
  <nav role=navigation>
     <ul>
       <li><a href="/">Index</a></li>
       <li><a href="/archives/">Archives</a></li>
       <li><a href="/resume/">About me/Resume</a></li>
     </ul>
  </nav>
  <div id="content"><slot>ARTICLE</slot></div>
  <footer><p>Copyright &copy; 2023 - Alexandre Poirot</p></footer>
</template>
<style>
  header { background-image: url("/images/header.png"); }
  nav { background: black; color: white; }
</style>
```

# "Declarative"

This refers to [Declarative-Shadow-DOM](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Declarative-Shadow-DOM.md#self-sufficient-html)
and [Declarative-Custom-Elements-Strawman](https://github.com/WICG/webcomponents/blob/gh-pages/proposals/Declarative-Custom-Elements-Strawman.md) proposal... in some way.\
The idea is being able to load it from the HTML page, without JavaScript.

On this web site, the Web Component used on all blog post pages is registered like this:
```
<link rel="component" href="/blog-article.wc">
```
And will implement the `<blog-article>` DOM Element used in the HTML page.
Unfortunately, as this isn't part of any implemented standard, I'm using Tomasz's naive JavaScript loader to make this work.


# Example of a blog post HTML page

The traditional header of any HTML page in 2023:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
```

The blog post title followed by the blog title.
```html
  <title>Using the fediverse/Mastodon for comments on blogs - Techno Barje</title>
```

Then, Tomasz JS loader, which will implement the support for `<link rel=component>`.
```html
  <script src="/loader.js"></script>
```

The declaration of the `<blog-article>` Web Component
```html
  <link rel="component" href="/blog-article.wc">
```

The unique CSS for the whole blog, and the end of `</head>` section.
```html
  <link href="/document.css" rel="stylesheet" type="text/css">
</head>
```

Now this is where it becomes interesting.\
The `<blog-article>` component will implement the overall blog design/template.\
So that the HTML page can focus only on the specific content of that specific HTML file:
* The blog post title and link to it,
* Its publish date,
* The actual content of the blog post.
```html
<body>
<blog-article>

  <div class="entry-title">
    <h1><a href="/post/2023/10/05/fediverse-for-comments-on-blogs/">Using the fediverse/Mastodon for comments on blogs</a></h1>

    <time datetime="2023-10-05T10:00:00.000Z" pubdate>Oct 05, 2023</time>
  </div>

  <article>
    ... The content of a blog post ...
  </article>
</blog-article>
</body>
</html>
```
And that's it. We close the `</html>` right after.

# Outcomes

My hope is that by simplifying the HTML files to the barebone actual text content, we can revive the straight edition of HTML files!

In 2023, everyone is still using either:
* Wordpress/Medium/write.as/Fediverse to publish content when you don't want to care about the hosting side of things,
* Jekyll/Hugo/writefreely.org or more and more custom build scripts for the tech-savvy who are at ease running command lines and managing the (self) hosting.

Except a few web survivalist, I've not seen anyone edit HTML page for publishing text. HTML is now some kind of assembly language only generated or at best assembled by programs.

I'll keep bloging about this topic as this Declarative Web Component trick is only one small thing. We can do much more to get back to the roots of the editable web.
