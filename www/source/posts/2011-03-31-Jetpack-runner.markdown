---
layout: post
title: "Jetpack runner"
date: 2011-03-31
comments: true
categories: [mozilla]
---
Here is the very first release of Jetpack runner. This firefox extension built
on top of the Addon SDK is a personal project that aim to ease development of
firefox extension using the SDK. It is a great exhibit of SDK capabilities as
we can now develop such tool using the SDK itself! For now, to create an addon
you need to go thought a python application that only has a command line
interface: <img src="/public/jetpack_runner/cfx.jpg" alt="cfx.jpg" style="margin: 0 auto; display: block;" title="cfx" /> This is painfull to install
and even more annoying to use on Windows as there is no really decent command
line interface. Finally, if we compare to chrome extensions, we only need
chrome to build an addon! This leads me to build a Firefox extension, that can
be really easy to install in Firefox and allow to build really cool interfaces
to create, run and test your addons.<br />
<br />
<h2>Jetpack runner features:</h2>
<img src="/public/jetpack_runner/jr.png" alt="jr.png" style="float: right; margin: 0 0 1em 1em;" title="jr.png, mar. 2011" />
<ul>
<li>Download and install SDK automatically</li>
<li>Create addon from templates</li>
<li>Run an addon</li>
<li>Execute unit-tests</li>
<li>Generate firefox extension XPI file or xulrunner application package</li>
<li>You can run these either in current firefox instance or run them in a new
one</li>
<li>We can execute a package as a firefox extension or as a xulrunner
application</li>
</ul>
<br />
<br />
<h2>Jetpack runner first steps:</h2>
On extension installation, a tab opens automatically on &quot;jetpack:&quot; url, the
main jetpack runner interface. That allow to download and install a precise SDK
release: <img src="/public/jetpack_runner/jr-first-run.jpg" alt="jr-first-run.jpg" style="margin: 0 auto; display: block;" title="jr-first-run.jpg, mar. 2011" /> Then it displays a list of packages provided
by addon SDK. &quot;addon-sdk&quot; is the main package to play with. <img src="/public/jetpack_runner/jr-packages.jpg" alt="jr-packages.jpg" style="margin: 0 auto; display: block;" title="jr-packages.jpg, mar. 2011" /> After
clicking on &quot;Create addon&quot; button, you would easily create a new one by filling
obvious form and selecting a template addon: <img src="/public/jetpack_runner/jr-templates.jpg" alt="jr-templates.jpg" style="margin: 0 auto; display: block;" title="jr-templates.jpg, mar. 2011" /> And
then, you end up on your newly created addon package page, where you can run
it, execute unit tests or download as a firefox extension XPI file: <img src="/public/jetpack_runner/jr-addon.jpg" alt="jr-addon.jpg" style="margin: 0 auto; display: block;" title="jr-addon.jpg, mar. 2011" /><br />
<br />
<h2>Jetpack runner!!!</h2>
Last but not least, here is a link to install it or to checkout the
source.<br />
<br />
<b>Firefox Extension:</b><br />
<a href="/public/jetpack_runner/jetpack-runner-0.1.1.xpi">jetpack-runner-0.1.1.xpi</a><br />

<br />
<b>Source code:</b><br />
<a href="https://github.com/ochameau/jetpack-runner">Github project</a>