---
layout: post
title: "Mozilla memory profiling, part 2: a working tool"
date: 2009-11-25 21:57:42
comments: true
categories: [mozilla]
---
Here is another part of my work on memory analysis in Mozilla :
<p style="text-align: center"><a href="/public/another-profiler/another-profiler_techno-barje.fr.xpi" style="font-size: 2em;">another-profiler_techno-barje.fr.xpi</a></p>
<br />
This new version of &quot;Another memory profiler&quot; is now an effective tool, which
display a lot of information about all objects living in your Firefox instance!
By <em>all</em> I mean not only website javascript objects, but all objects
used by Firefox in its windows, sidebars, extensions, all tabs, iframes, etc.
The previous version allowed you only to select one component : a DOM
window(website, sub-iframe or any XUL window), a XPCOM service or a JS Module
:<br />
<br />
<img src="/public/another-profiler/another-components-list.png" alt="another-components-list.png" style="margin: 0 auto; display: block; border: 1px solid black" title="another-components-list.png, nov. 2009" />
<div style="text-align: center; font-weight: bold">Component selection</div>
<br />
Now you can get a report about currently living objects : the ones that are
still used because there is at least one reference to each of them. This report
first display all javascript files involved in your component :<br />
<br />
<img src="/public/another-profiler/another-lines-browser.png" alt="another-lines-browser.png" style="margin: 0 auto; display: block; border: 1px solid black" title="another-lines-browser.png, nov. 2009" />
<div style="text-align: center; font-weight: bold">File selection</div>
<br />
By selecting one file, you are seeing the number of living object sorted by
there instantiation line :<br />
<br />
<img src="/public/another-profiler/another-objects-browser.png" alt="another-objects-browser.png" style="margin: 0 auto; display: block;" title="another-objects-browser.png, nov. 2009" />
<div style="text-align: center; font-weight: bold">Living objects
information</div>
<br />
Finally, this tool display objects counts for each line sorted by there type.
But Javascript is not a strongly typed language, so it's not really easy to
sort its objects by a type! That's why there are several way to describe a JS
object :
<ul>
<li>Define a JS object by its attributes, like Atul Varma is doing in <a href="http://www.toolness.com/wp/?p=709">its current work</a>,</li>
<li>By its JS Prototype name, very usefull &quot;typing&quot; when you are using
Prototype and build Object-Oriented JS,</li>
<li>We are facing some specialized objects like all DOM objects :
HTMLFormElement, HTMLDivElement, ...</li>
<li>And finally all native types, like Array, String, Date, RegExp, ...
etc.</li>
</ul>
<br />
<br />
Finally, let's see how to make this extension work :
<ul>
<li><strong>First</strong> It contains a binary component which is only built
for Firefox 3.5 and 3.6 for Windows and Linux-32.</li>
<li><strong>Secondly</strong> The memory profiling component is a patched
version of the Mozilla Jetpack's one, so take care to disable Jetpack, before
testing this!</li>
<li><strong>Then</strong> In order to get the maximum information about your
living JS object, I strongly encourage you to set these two prefs to false :
<pre>
javascript.options.jit.content = false
javascript.options.jit.chrome = false
</pre>
(That's because Tracemonkey optimise loops and seems to embed empty stack frame
information on these loop's execution ...)</li>
<li>That being said, you just have to install this extension <a href="/public/another-profiler/another-profiler_techno-barje.fr.xpi">another-profiler_techno-barje.fr.xpi</a>,
go to your Tools menu and click on &quot;Open another memory profiler&quot;.</li>
</ul>
<br />
<br />
<strong>Come back for the next post for some more explanation on displayed
results with simple scripts examples.</strong>