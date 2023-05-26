---
layout: post
title: "FoobarFox : JSCtypes putting Foobar into your Firefox!"
date: 2009-10-16
comments: true
categories: [mozilla]
---
<p style="text-align:center"><a href="/public/foofox_techno-barje.fr.xpi" style="font-size: 2em;">FoobarFox</a></p>
<strong>FoobarFox features</strong>
<ul>
<li>Retrieve currently playing song information into your Firefox</li>
<li>Automatically post to your twitter account all listening tracks</li>
<li>Search for information on wikipedia, myspace or google</li>
</ul>
<strong>FoobarFox prerequisites</strong>
<ul>
<li>You have to be on Windows ...</li>
<li>Need <a href="http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-mozilla-1.9.2/">Firefox
3.6b1pre nightly</a> or <a href="http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-trunk/">Firefox
3.7a1pre nightly</a></li>
<li>Use <a href="http://www.foobar2000.org/">Foobar</a> music player</li>
</ul>
<p style="text-align:center">install <a href="/public/foofox_techno-barje.fr.xpi" style="font-size: 1em;">foofox@techno-barje.fr.xpi</a></p>
<img src="/public/foobarfox-1.png" alt="foobarfox" style="margin: 0 auto; display: block; border: 2px solid black; margin-bottom: 5px;" title="foobarfox" /> <img src="/public/foobarfox-2.png" alt="foobarfox" style="margin: 0 auto; display: block; border: 2px solid black;" title="foobarfox" /><br />
<br />
<br />
<h3>Real world JSCtypes usage</h3>
FoobarFox is not so usefull, it's mainly a proof of concept for JSCtypes
capabilities.<br />
Let's see how use JSCtypes to do fun things. You can copy paste this sample
code into your JS Console while your foobar is playing something :
<pre>
Components.utils.import(&quot;resource://gre/modules/ctypes.jsm&quot;);

/* Change the dll path if your main windows directory is not on C:\WINDOWS! */
var lib = ctypes.open(&quot;C:\\WINDOWS\\system32\\user32.dll&quot;);

/* Declare the signature of FindWindows function */
var findWindowEx = lib.declare(&quot;FindWindowW&quot;,
                               ctypes.stdcall_abi,
                               ctypes.int32_t,
                               ctypes.ustring,
                               ctypes.int32_t);

/* Search for Foobar windows by it's id */
/* this ID is often changing of value at each release :/ */
var win = findWindowEx(&quot;{DA7CD0DE-1602-45e6-89A1-C2CA151E008E}/1&quot;, 0);
if (!win)
  win = findWindowEx(&quot;{DA7CD0DE-1602-45e6-89A1-C2CA151E008E}&quot;, 0);
if (!win)
  win = findWindowEx(&quot;{97E27FAA-C0B3-4b8e-A693-ED7881E99FC1}&quot;, 0); 
if (!win)
  win = findWindowEx(&quot;{E7076D1C-A7BF-4f39-B771-BCBE88F2A2A8}&quot;, 0);

/* Define another signature of windows API function */
var getWindowText = lib.declare(&quot;GetWindowTextW&quot;,
                               ctypes.stdcall_abi,
                               ctypes.int32_t,
                               ctypes.int32_t,
                               ctypes.ustring,
                               ctypes.int32_t);

/* Fill the string buffer we give to JSCtypes call */
var text=&quot;&quot;;
var max_len = 100;
for(var i=0; i &lt; max_len; i++)
  text+=&quot; &quot;;
var text_len = getWindowText(win,text,100);

/* Extract song information from foobar window title */
var m = text.match(/(.*) - (?:\[([^#]+)([^\]]+)\] |)(.*) \[foobar2000.*\]/);

var musicinfo = {
  artist : m[1],
  album : m[2],
  trackNumber : m[3],
  track : m[4]
};
alert(musicinfo.toSource());
</pre>
<h3>JSCtypes current capabilities</h3>
<p>As I said in my <a href="/post/2009/10/12/JS-Ctypes">previous post</a>,
ctypes support in Firefox is limited and we can't use <i>struct</i>. So we're
able to play only with libraries that wait string and int. You can even pass
objects/structures, but only if they can be created by a function whose
arguments support the same limitation. As you can see in the previous example,
we're able to retrieve a pointer to a HWND object with FindWindowEx because it
only wait string arguments. After that we give this pointer to getWindowText as
a ctypes.int32_t.</p>
<h3>JSCtypes current limitations</h3>
Now, let's see a C++ code that can't be mapped into JSCtypes :
<pre>
// Add a notification to the tray.
NOTIFYICONDATA nid = {0};

nid.cbSize         = sizeof(nid);
nid.uID            = 100;    
nid.uFlags         = NIF_ICON;
nid.hIcon          = LoadIcon(g_hInstance, MAKEINTRESOURCE(IDI_SAMPLEICON));

Shell_NotifyIcon(NIM_ADD, &amp;nid);
</pre>
<p style="text-align: right">source: <a href="http://msdn.microsoft.com/en-us/library/aa453686.aspx">msdn</a></p>
In this case, we are neither able to create any NOTIFYICONDATA object, nor to
set attributes on this structure.<br />
<br />
<b>For more information</b>
<ul>
<li><a href="https://wiki.mozilla.org/Jsctypes/api">JSCtypes api</a>. But take
care, this is a work in progress!</li>
<li>Bug <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=513788">513788</a> - Revise
js-facing API for js-ctypes.</li>
<li>Bug <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=429551">429551</a> - add struct
support to js-ctypes.</li>
</ul>