---
layout: post
title: "Session per tab in Firefox"
date: 2009-12-05
comments: true
categories: [mozilla]
---
The brand new version of Yoono, <a href="http://www.yoono.com">Yoono7</a>
brings a <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=117222">long-awaited</a> Firefox
feature: the possibility to sign-in on the same website with multiple accounts
in different tabs or windows.<br />
<br />
Althought this new feature is a big technical challenge, for the end user, it's
really simple and non-intrusive! This feature only add one simple &quot;profile&quot;
selector on the left of the URL bar : <img src="/public/accounts/urlbar-global.png" alt="urlbar-global.png" style="margin: 0 auto; display: block;" title="urlbar-global.png, d&#233;c. 2009" /> This
is the default status of the selector, it simply says that the current firefox
behavior is &quot;as before&quot;, using the same global session for all tabs.<br />
Let's look it when we enable session per tab on different profiles : <img src="/public/accounts/urlbar-gmail.png" alt="urlbar-gmail.png" style="margin: 0 auto; display: block;" title="urlbar-gmail.png, d&#233;c. 2009" />
<img src="/public/accounts/urlbar-facebook.png" alt="urlbar-facebook.png" style="margin: 0 auto; display: block;" title="urlbar-facebook.png, d&#233;c. 2009" /> <img src="/public/accounts/urlbar-witter.png" alt="urlbar-witter.png" style="margin: 0 auto; display: block;" title="urlbar-witter.png, d&#233;c. 2009" />
<p>When you start the browser, open a bookmark, do a search or enter manually
an URL, your request is loaded with the default global session (ie &quot;as
before&quot;). But when you select a profile with this selector, the current tab is
reloaded in order to use one specific totally independant session. Futhermore,
if this website open a new tab or window, or if you click on a link, the new
tab, window or webpage is going to use the same specific session.</p>
<br />
But let's see how to use this feature from the beginning.
<ol>
<li style="clear:both"><img src="/public/accounts/perso-add.png" alt="perso-add.png" style="float: right; margin: 0 0 1em 1em;" title="perso-add.png, d&#233;c. 2009" /> <img src="/public/accounts/default-menu.png" alt="default-menu.png" style="float: right; margin: 0 0 1em 1em;" title="default-menu.png, d&#233;c. 2009" /> First, we create one session linked to a
personnal account. In this example I take gmail, but it can be any website :
twitter, facebook, flickr, ... whatever! To do so we click on the profile
selector and get menu on the left and we click on &quot;+ new profiles&quot; and get the
right's one.</li>
<li style="clear:both">We are redirected to the homepage URL, where we must
sign-in for this personnal account: poirot.alex. <img src="/public/accounts/perso-signin.png" alt="perso-signin.png" style="margin: 0 auto; display: block;" title="perso-signin.png, d&#233;c. 2009" /><br />
And we are now signed in for this &quot;Personnal gmail&quot; session : <img src="/public/accounts/private-signed.png" alt="private-signed.png" style="margin: 0 auto; display: block;" title="private-signed.png, d&#233;c. 2009" /><br /></li>
<li style="clear:both"><img src="/public/accounts/add-pro.png" alt="add-pro.png" style="float: right; margin: 0 0 1em 1em;" title="add-pro.png, d&#233;c. 2009" /> Then, we do the same for one professional account:
yoono.test.<br />
<img src="/public/accounts/header-pro-signin.png" alt="header-pro-signin.png" style="margin: 0 auto; display: block;" title="header-pro-signin.png, d&#233;c. 2009" /><br />
<img src="/public/accounts/header-pro-signed.png" alt="header-pro-signed.png" style="margin: 0 auto; display: block;" title="header-pro-signed.png, d&#233;c. 2009" /><br /></li>
<li style="clear:both"><img src="/public/accounts/home-private.png" alt="home-private.png" style="float: right; margin: 0 0 1em 1em;" title="home-private.png, d&#233;c. 2009" /> Later, we can reopen one of these sessions
directly to the homepage with the profile selector and get automatically signed
in. The &quot;switch to&quot; link doesn't go to the homepage and only reload the current
tab with the selected session (very usefull for Facebook connect, sharing,
...). <img src="/public/accounts/private-signed.png" alt="private-signed.png" style="margin: 0 auto; display: block;" title="private-signed.png, d&#233;c. 2009" /></li>
</ol>
<br />
<p style="text-align: center;font-weight: bold; font-size: 1.2em">So we can
open as many different account in multiple tabs or windows!</p>
<br />
<br />
<h2>Important note:</h2>
The current version of Yoono7 doesn't allow custom profile creation. The only
profiles you can use is the ones automatically created for each account
registered in the yoono's sidebar. But watch for the next minor releases of
Yoono7, we are going to ship all this very soon!<br />
<br />
<h2>Another demo of this feature in video:</h2>
<div class="external-media" style="margin: 1em auto; text-align: center;">
<object type="application/x-shockwave-flash" data="http://www.youtube.com/v/V51S6BxTPiw&amp;hl=en_US&amp;fs=1" width="480" height="385"><param name="movie" value="http://www.youtube.com/v/V51S6BxTPiw&amp;hl=en_US&amp;fs=1" />
<param name="wmode" value="transparent" /></object></div>