---
layout: post
title: "How to setup a mozilla extension update server"
date: 2009-10-08
comments: true
categories: [mozilla]
---
I've shared in the previous post a command line version of Mccoy. Here is a new
tutorial on how to use it!<br />
<h3>Prerequisite</h3>
<ul>
<li>a HTTP server</li>
<li>Patched version of mccoy, with command line capabilities : <a href="/public/mccoy.tar.gz">mccoy.tar.gz</a></li>
<li>This start kit : <a href="/public/mccoy-test.tar.gz">mccoy-test.tar.gz</a>
which bundle a sample extension and one update.xml file</li>
</ul>
<pre>
$ cd /one/of/your/htdocs/dir
$ wget http://blog.techno-barje.fr/public/mccoy.tar.gz
$ tar zxvf mccoy.tar.gz
$ wget http://blog.techno-barje.fr/public/mccoy-test.tar.gz
$ tar zxvf mccoy-test.tar.gz
$ cd mccoy-test/
$ ls
update.xml  workdir  xpis
</pre>
<br />
<br />
<h3>Setup your XPI with valid update information</h3>
<strong>Create a new key in Mccoy</strong>
<pre>
mccoy-test $ cd workdir/
workdir $ ls
chrome  chrome.manifest  install.rdf
workdir $ ../../mccoy -createKey myextensionkey
Creating key with name : myextensionkey
Public key : MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDbV+ZGXs658dOm/+4YtT+VzT5JWzMFYiQ8155fnMkOJCina2yDEBq8Lvi5qF5SyoMDkqaYeO51LR+B4p1g7oWmBW9HbOz3eA9lD/AHUR1SHiJAX7RQq8v9sPSkYta+LyVrCMFgpTmhOWPUXOnwalmL7syGkXyjxHqHCYz+s3d22QIDAQAB
The key has been successfully created!
</pre>
Remember the name of your key (if you forgot the name, you can later execute
<em>mccoy -listKeys</em>)<br />
<strong>Inject the public key in your extension</strong>
<pre>
workdir $ ./mccoy -installKey install.rdf -key myextensionkey
Public key inserted!
</pre>
This will set the <em>updateKey</em> attribute with the public key. (you can
later retrieve the public key with <em>mccoy -publicKey myextension</em>)<br />
<strong>Set the updateURL attribute of the install.rdf with the URL of the
update.xml file located in mccoy-test/update.xml</strong>
<pre>
workdir $ vi update.rdf
</pre>
<strong>Build the first xpi</strong>
<pre>
$ zip -r ../xpis/mccoy-test-0.1.xpi .
</pre>
<br />
<strong>&#187;&#187; now install this XPI!</strong> This sample extension will just
display an alert with message <em>&quot;Mccoy 0.1!&quot;</em><br />
<br />
<h3>Create a new version of your extension</h3>
<strong>Alter the sample extension alert message with something new</strong>
<pre>
workdir $ vi chrome/content/firefoxOverlay.xul
</pre>
<strong>Update the version number with 0.2</strong>
<pre>
workdir $ vi install.rdf
</pre>
<strong>Build the new xpi</strong>
<pre>
workdir $ zip -r ../xpis/mccoy-test-0.2.xpi .
</pre>
<strong>Update the update xml file</strong>
<pre>
workdir $ cd ..
mccoy-test $ vi update.xml
### change version with 0.2
### change updatelink with mccoy-test-0.2.xpi
### change updatehash with result of <em>sha1sum xpis/mccoy-test-0.2.xpi</em>
</pre>
<strong>Sign the update file with mccoy</strong>
<pre>
mccoy-test $ ../mccoy/mccoy -signRDF update.xml -key myextensionkey
Sign &lt; update.xml &gt; with key &lt; myextensionkey &gt;
Sign addon : urn:mozilla:extension:mccoy-test@techno-barje.fr
File signed!
</pre>
This will set the <em>signature</em> attribute with computed with your private
key.<br />
<br />
<strong>&#187;&#187; You can now force the update in your firefox, relaunch it and
voil&#224;!<br />
<br /></strong>
<h3><strong>Some tips for debugging</strong></h3>
Enable this two about:config entries in order to get some message in JS console
about update process :<br />
<pre>
extensions.logging.enabled = true
javascript.options.showInConsole = true
</pre>