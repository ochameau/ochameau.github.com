---
layout: post
title: "Freemonkeys"
date: 2010-02-12
comments: true
categories: [mozilla]
---
<p style="text-align:center"><a href="https://addons.mozilla.org/en-US/firefox/addon/46873" style="font-size: 2em;">Freemonkeys</a></p>
Yet another mozilla powered project! This time, a graphical unit tests
editor/executer which enables you to spellcast an army of monkeys always happy
to work hard on your projects and find bugs for free! <img src="/public/demo/fm/asserts.png" alt="asserts.png" style="margin: 0 auto; display: block; border: 2px solid black; max-width: 300px; max-height: 300px" title="asserts.png, f&#233;v. 2010" /><br />
<strong>Here is what they can do:</strong>
<ul>
<li>Launch any Mozilla application: Firefox, Thunderbird and any xulrunner
app,</li>
<li>Use an empty profile for each test execution, or an existing one,</li>
<li>Speak fluently &quot;assert&quot; language: isTrue, isFalse, isDefined, equals, ...
etc,</li>
<li>Report you in real time test execution directly in your test source
code,</li>
<li>They are always ready to work. You don't need to restart Freemonkeys on
each test execution, nor on your application reboot. Freemonkeys is an
independant xulrunner app, which launch yours and then controls it remotly with
a network connexion,</li>
<li>Spot easily any window, any tab and any DOM element with usefull
distinctive parameters: XPath, windows attributes, zIndex order, ... etc,</li>
<li>Offer a way to facilitate node identification by simply clicking on it, and
seeing in real time what are selected node parameters,</li>
<li>They are able to write down some debug messages, inspect javascript objects
with DOM Inspector, take screenshots of any elements,</li>
<li>Ease you some kind of tests, by providing you a simple HTTP webserver in
order to simulate some websites answers,</li>
<li>They are not narrow-minded to synchronous tests but offers an assert
library and some usefull API embracing asynchronous execution of your
code!</li>
</ul>
<br />
Now let's highlight some of these cool features ...<br />
<br />
<h2>Node selection</h2>
Here I was overing the tip of the day image. Freemonkeys spot it by
highlighting it in red and show me all parameters which are going to be used to
find this node later:<br />
<img src="/public/demo/fm/inspector.png" alt="inspector.png" title="inspector.png, f&#233;v. 2010" /> You just have to click on it to get back to test
editor and have all javascript code needed to get a reference to this node,
something like this:
<pre>
var top = windows.getRegistered(&quot;firefox-window&quot;, &quot;topmost&quot;);
var tab = top.tabs.current;
var element = elements.xpath(tab, &quot;id('frame')/tbody[1]/tr[5]/td[1]/table[1]/tbody[1]/tr[1]/td[1]/table[1]/tbody[1]/tr[1]/td[1]/img[1]&quot;);
</pre>
<br />
<br />
<h2>Elements screenshots</h2>
<br />
Simply write:
<pre>
element.screenshot();
</pre>
And get a screenshot directly in the test editor:<br />
<img src="/public/demo/fm/element.screenshot.png" alt="element.screenshot.png" title="element.screenshot.png, f&#233;v. 2010" /><br />
<br />
<h2>Live test execution reporting</h2>
<br />
Your monkeys report each assert status in the test editor, allowing you to keep
the focus on test writing and not losing time by switching from your app to
your terminal, then to your code editor, your terminal and your app ... etc,
etc. <img src="/public/demo/fm/asserts.png" alt="asserts.png" style="margin: 0 auto; display: block; border: 2px solid black; margin: 5px;" title="asserts.png, f&#233;v. 2010" /> <img src="/public/demo/fm/debug-msg.png" alt="debug-msg.png" title="debug-msg.png, f&#233;v. 2010" /><br />
<br />
<h2>HTTP API</h2>
<br />
<pre>
// Get a reference to a firefox tab
var top = windows.getRegistered(&quot;firefox-window&quot;, &quot;topmost&quot;);
var tab = top.tabs.current;

// Start an HTTP server on port 81
http.start(&quot;81&quot;);

// A successfull test
// Create an assert objet which is going to wait for a request on root path of our http server
var test = http.assertGetRequest(&quot;/&quot;);
// Open this page in the tab
tab.open(&quot;http://localhost:81/&quot;);
// Now wait for this request
test.wait();

// The same test but with a non-existant page on our local server, so a failing test!
var test = http.assertGetRequest(&quot;/&quot;);
tab.open(&quot;http://localhost:81/foo&quot;);
test.wait();
</pre>
<br />
<br />
<h2>Asynchronous tests</h2>
<br />
<pre>
// A usefull function which allow you to block test execution for an amount of time in ms
wait.during(1000);

// The simpliest asynchronous test
wait.forTrue(function () {
  return true;
});

// Another, which is going to pass after 3s, with this setTimeout
var v=true;
wait.setTimeout(function() {
  v=false;
},3000);
wait.forFalse(function () {
  return v;
});

// Finally, a test which will pass when the test function is going to be called ten times
// (wait for the anonymous function returns 10)
var i=0;
wait.forEquals(function () {
  return i++;;
}, 10);
</pre>
<br />
<br />
<h1>How to get it ?</h1>
Source code is available on github: <a href="http://github.com/ochameau/freemonkeys">http://github.com/ochameau/freemonkeys</a>
(LGPL licence)<br />
If you are on windows:
<ul>
<li>Download this package: <a href="http://github.com/downloads/ochameau/freemonkeys/freemonkeys-0.1-win.zip">freemonkeys-0.1-win.zip</a></li>
<li>Extract this zip file somewhere</li>
<li>Launch freemonkeys.exe</li>
</ul>
And for linux and mac:
<ul>
<li>Download this one: <a href="http://github.com/downloads/ochameau/freemonkeys/freemonkeys-0.1.zip">freemonkeys-0.1.zip</a></li>
<li>Extract it somewhere</li>
<li>If you don't have xulrunner, download it from <a href="http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/1.9.2rc1/runtimes/">
here</a></li>
<li>Finally, launch Freemonkeys with this command:
<pre>
/path/to/your/xulrunner/dir/xulrunner /path/to/freemonkeys/application.ini
</pre></li>
</ul>