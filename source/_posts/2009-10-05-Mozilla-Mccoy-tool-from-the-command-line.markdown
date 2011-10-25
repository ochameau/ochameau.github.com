---
layout: post
title: "Mozilla Mccoy tool from the command line"
date: 2009-10-05
comments: true
categories: [mozilla]
---
We have seen in the <a href="/post/2009/09/30/Headless-xulrunner" hreflang="en">previous post</a> how to build an headless xulrunner application.<br />
My first use case was enabling the Mozilla <a href="https://developer.mozilla.org/en/McCoy" hreflang="en">Mccoy</a> application to
launch from command line. That allows me to build a bash script which create
nightly builds of a firefox extension automatically updated by Firefox every
day!.<br />
<br />
Here is the resulting Mccoy version :
<ul>
<li><strong>Linux i686 patched build of Mccoy:</strong> <a href="/public/mccoy.tar.gz">mccoy-0.5-command-line.tar.gz</a></li>
<li><strong>Patch based on 0.5 official release:</strong> <a href="/public/mccoy-0.5-command-line.patch">mccoy-0.5-command-line.patch</a></li>
</ul>
<br />
<strong>Now, a summary of each command line arguments :</strong>
<pre>
# Create a new named public/private key
$ ./mccoy -createKey mykey
Creating key with name : mykey
Public key : MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDbV+ZGXs658dOm/+4YtT+VzT5JWzMFYiQ8155fnMkOJCina2yDEBq8Lvi5qF5SyoMDkqaYeO51LR+B4p1g7oWmBW9HbOz3eA9lD/AHUR1SHiJAX7RQq8v9sPSkYta+LyVrCMFgpTmhOWPUXOnwalmL7syGkXyjxHqHCYz+s3d22QIDAQAB
The key has been successfully created!

# List all keys in the current mccoy profile
# /!\ Don't forget to save your profile!
$ ./mccoy -listKeys
Registered keys :
 - mykey

# Inject the public key in your extension's install.rdf
$ ./mccoy -installRDF myextension_workdir/install.rdf -key myextensionkey
Public key inserted!

# Update the signature of the update xml file
$ ./mccoy -signRDF update.xml -key mykey
Sign &lt; update.xml &gt; with key &lt; mykey &gt;
Sign addon : urn:mozilla:extension:mccoy@techno-barje.fr
File signed!

# Check if the update xml file is correctly signed
$ ./mccoy -verifyRDF update.xml -key myextensionkey
Check rdf : update.xml with key myextensionkey
Valid signature!

</pre>