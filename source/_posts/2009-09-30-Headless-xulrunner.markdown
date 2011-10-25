---
layout: post
title: "Headless xulrunner"
date: 2009-09-30 16:27:13
comments: true
categories: [mozilla]
---
Here is a summary on how to run a xulrunner application on an headless
computer, or more commonly just launch xulrunner in a command line with no
windows.<br />
<br />
By default, xulrunner try to open a XUL window defined in the
&quot;&quot;toolkit.defaultChromeURI&quot;&quot; preference, so you have to set this one to an
empty value.<br />
<br />
Then you need to have a running X server, even if it never open any window ...
one simple and lightweight solution is running Xvfb. But any other X server
will do the work!<br />
<br />
Finally, I suggest you to take the <a hreflang="en" href="http://releases.mozilla.org/pub/mozilla.org/xulrunner/releases/1.9.0.14/runtimes/">
1.9.0.14 xulrunner release</a> which has less painfull dependencies like
libalsa (due to ogg support) and libdbus-glib.<br />
<br />
This will avoid this kind of errors :<br />
<blockquote>
<p>./xulrunner-bin: error while loading shared libraries: libasound.so.2:
cannot open shared object file: No such file or directory<br />
./xulrunner-bin: error while loading shared libraries: libdbus-glib-1.so.2:
cannot open shared object file: No such file or directory</p>
</blockquote>
How to write such a tutorial without a complete working out of the box hello
world ?<br />
Here is a sample command line application with linux xulrunner binaries :
<a href="/public/headless-runner.tar.gz">headless-runner.tar.gz</a><br />
<pre>
$ tar zxvf headless-runner.tar.gz
$ cd headless-runner
$ Xvfb :2
$ export DISPLAY=:2
$ ./headless -ls -filesize application.ini
LS :
 - application.ini
 - a.out
 - tests
 - components
 - defaults
 - updates
 - extensions
 - xulrunner-1.9.2a2pre.en-US.linux-x86_64.tar.bz2
 - xulrunner
 - headless

$ ./headless -filesize application.ini
File size of : application.ini
  243
</pre>
The main code is in the file components/nsCommandLineHandler.js
<pre>
CommandLineHandler.prototype.handle = function(aCmdLine){
  
  var toggle = aCmdLine.handleFlag(&quot;ls&quot;, false);
  if (toggle) {
    dump(&quot;LS : 
&quot;);
    var list = aCmdLine.workingDirectory.directoryEntries;
    while(list.hasMoreElements()) {
      var file = list.getNext().QueryInterface(Components.interfaces.nsIFile);
      dump(&quot; - &quot;+file.leafName+&quot;
&quot;);
    }
    dump(&quot;
&quot;);
  }

  var filesize = aCmdLine.handleFlagWithParam(&quot;filesize&quot;, false);
  if (filesize) {
    dump(&quot;File size of : &quot;+filesize+&quot;
&quot;);
    var file = aCmdLine.resolveFile(filesize);
    if (!file)
      return dump(&quot;Unable to find this file
&quot;);
    dump(&quot;  &quot;+file.fileSize+&quot;
&quot;);
  }
}
</pre>
For more information, check the <a hreflang="en" href="http://mxr.mozilla.org/mozilla-central/source/toolkit/components/commandlines/public/nsICommandLine.idl">
nsICommandLine</a> interface of the aCmdLine object.<br />
<br />
Last but not least, why do I try to use Xulrunner in command line whereas
<a href="https://developer.mozilla.org/en/xpcshell">xpcshell</a> and &quot;<a href="https://developer.mozilla.org/En/SpiderMonkey/Introduction_to_the_JavaScript_shell">js</a>&quot;
commands exists?!
<ul>
<li><strong>First:</strong> Some tools like <a href="https://developer.mozilla.org/en/McCoy">Mccoy</a> are bundled as xulrunner
application. And you may launch these tools on headless servers in order to
build, for example, continuous integration tools!</li>
<li><strong>Second:</strong> JS shell allow you tu use only pure Javascript;
Xpcshell expose all XPCOM but some part of Mozilla environnement are disabled!
I was unabled to create a &lt;canvas&gt; element in xpcshell. There is no way
to create a XUL/HTML document/element with XPCOM and hiddenWindow is disabled
... So the only solution to build a tool which takes website screenshots with
&lt;canvas&gt; was using xulrunner!</li>
</ul>