---
layout: post
title: "Hackability test : Google Chrome vs Mozilla Firefox (with Jetpack)"
date: 2009-11-10 11:25:10
comments: true
categories: [mozilla]
---
Here is a small summary of what we are able to extend in Chrome and
Firefox(with Jetpack).<br />
<br />
<br />
<h1>How to add a new item in context menu (right click menu)</h1>
<strong>In Chrome</strong>
<p>You just can't, <a href="http://www.google.com/support/forum/p/Chrome/thread?tid=375371626e2ba749&amp;hl=en">
see here</a>.</p>
<strong>In Firefox, with Jetpack</strong>
<pre>
jetpack.future.import(&quot;menu&quot;);
jetpack.future.import(&quot;selection&quot;);

jetpack.menu.context.page.add(function(context)({
   label: &quot;My context menu item&quot;,
   command: function(target) {
     
     // Do something fun with this selection
     jetpack.notifications.show( &quot;Current selection : &quot;+jetpack.selection.text );
     
   }
 }));
</pre>
<img src="/public/jetpack-context.png" alt="jetpack-context.png" style="margin: 0 auto; display: block; border: 1px solid black" title="jetpack-context.png, nov. 2009" /> <a href="https://wiki.mozilla.org/Labs/Jetpack/JEP/14">A lot more information
here</a><br />
<br />
<br />
<h1>How to add a sidebar ?</h1>
<strong>In Chrome</strong>
<p>You just can't, it's a well known limitation, but nobody say it loud.</p>
<strong>In Firefox, with Jetpack</strong>
<pre>
jetpack.future.import(&quot;slideBar&quot;);
jetpack.slideBar.append({
   url: &quot;about:blank&quot;,
   width: 220,
   persist: true,
   autoReload: false,
   onReady: function(slide){

     // Do something fun with this sidebar
     var doc = slide.contentDocument;
     doc.body.innerHTML=&quot;Hello world from techno-barje!&quot;

   }
 });
</pre>
<img src="/public/jetpack-slidebar.png" alt="jetpack-slidebar.png" style="margin: 0 auto; display: block; border: 1px solid black" title="jetpack-slidebar.png, nov. 2009" /> <a href="https://wiki.mozilla.org/Labs/Jetpack/JEP/16">More details here</a><br />
<br />
<br />
<h1>How to have settings and display them to users ?</h1>
<strong>In Chrome</strong>
<p>You have to add custom menu somewhere, as you want. So each extension may
display a different way to fill up their settings ...</p>
<strong>In Firefox, with Jetpack</strong>
<pre>
var manifest = {
  settings: [
    {
      name: &quot;twitter&quot;,
      type: &quot;group&quot;,
      label: &quot;Twitter&quot;,
      settings: [
        { name: &quot;username&quot;, type: &quot;text&quot;, label: &quot;Username&quot; },
        { name: &quot;password&quot;, type: &quot;password&quot;, label: &quot;Password&quot; }
      ]
    },
    {
      name: &quot;facebook&quot;,
      type: &quot;group&quot;,
      label: &quot;Facebook&quot;,
      settings: [
        { name: &quot;username&quot;, type: &quot;text&quot;, label: &quot;Username&quot;, default: &quot;jdoe&quot; },
        { name: &quot;password&quot;, type: &quot;password&quot;, label: &quot;Secret&quot; }
      ]
    },
    { name: &quot;music&quot;, type: &quot;boolean&quot;, label: &quot;Music&quot;, default: true },
    { name: &quot;volume&quot;, type: &quot;range&quot;, label: &quot;Volume&quot;, min: 0, max: 10, default: 5 },
    { name: &quot;size&quot;, type: &quot;number&quot;, label: &quot;Size&quot; },
    { name: &quot;mood&quot;, type: &quot;member&quot;, label: &quot;Mood&quot;, set: [&quot;happy&quot;, &quot;sad&quot;, &quot;nonchalant&quot;] }
  ]
};
</pre>
<img src="/public/jetpack-settings.png" alt="jetpack-settings.png" style="margin: 0 auto; display: block; border: 1px solid black" title="jetpack-settings.png, nov. 2009" /> <a href="https://wiki.mozilla.org/Labs/Jetpack/JEP/24">Full planned API</a>(work in
progress)<br />
<a href="https://bugzilla.mozilla.org/show_bug.cgi?id=511764">You can track
progress here</a><br />
<a href="http://mykzilla.org/jetpack/settings-test.html">Jetpack demo
here</a><br />
<br />
<br />
<h1>How to display a system notification (or something like) ?</h1>
<strong>In Chrome</strong>
<p>You may display a custom HTML popup, but you will have to handle youself
display/hide of this popup, his style and each extension will have his
notification system ...</p>
<strong>In Firefox, with Jetpack</strong>
<pre>
jetpack.notifications.show({title: 'hai2u', body: 'o hai.', icon: 'http://www.mozilla.org/favicon.ico'}); 
</pre>
<img src="/public/jetpack-notifications.png" alt="jetpack-notifications.png" style="margin: 0 auto; display: block; border: 1px solid black" title="jetpack-notifications.png, nov. 2009" /> <a href="https://jetpack.mozillalabs.com/api.html">More info here</a><br />
<br />
<br />