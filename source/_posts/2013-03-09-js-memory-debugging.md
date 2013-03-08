---
layout: post
title: "Debug pure javascript leaks"
date: 2013-03-09
comments: true
categories: [mozilla, memory, pm]
---

Mozilla ecosystem already has plenty of [built-in features, scripts and addons](https://wiki.mozilla.org/Performance:Leak_Tools) to debug memory usage. But most of them are focused on the internals of the C++ codebase. These tools are very verbose and expose very-very few Javascript metadata. So that you have to start learning tons of internal C++ classes before being able to undersstand that your Javascript objects are actually visible in these tools output!

For now, when chasing Addon SDK memory leaks, I was just looking at overall memory usage and tried to read and re-read our codebase until I finally find the leak by seeing it in the code... But that practice may come to an end!
We should have Javascript-oriented memory debugging tool. With a clear picture of which objects are still allocated at a given point in time. __Without any C++ aspect.__ With an output that any confirmed Javascript developer can easily read and understand without knowing much about how Mozilla engine works.

With that in mind, I started looking at __the object CC/GC graph__. This graph contains a view of all objects allocated dynamically by the Garbage collector. All Javascript objects end up being in this graph. But also way more other C++ objects that we will have to translate into a meaningfull Javascript paradigm to the developer.

Then I realized that an XPCOM component already expose the whole CC graph: [nsICycleCollectorListener](https://developer.mozilla.org/en-US/docs/XPCOM_Interface_Reference/nsICycleCollectorListener). But again, with very few Javascript information other than "this is a Javascript object", or, "this is a javascript function". Not much more. It ends up being quite frustrating as most of the information is there, we just miss few pinches of Javascript metadata.
Like:

  * what are the attributes of this object?
  * in which document it lives?
  * in which script it has been allocated?
  * in which line?
  * in which function?
  * what other Javascript objects refers this one?
  * what is the function name/source?
  * ...

Finally, because of -or- thanks to the extra motivation given by [padenot](http://paul.cx/) and [vingtetun](https://github.com/vingtetun), I ended up doing crazy hacks to fetch this few information directly from Javascript: Call the [jsapi](https://developer.mozilla.org/en-US/docs/SpiderMonkey/JSAPI_Reference) library by using jsctypes with the object addresses given by the nsICycleCollectorListener interface. The benefit is that this experiment can run on any firefox release build (i.e. no need for a custom Firefox build). Using only JS also allows to experiment faster by avoiding the compiling phase. But that should definitely be kept as an experiment as I would not consider this as a safe practice!!

The result of this is:

  * a [jsctypes C++ mangling library](https://github.com/ochameau/jscpptypes),
  * a [work-in-progress addon](/public/demo/cc-js-tool/cc-js-tool.xpi) to identify DOM node leaks involving multiple compartments/documents, and,
  * two ([1](https://bugzilla.mozilla.org/show_bug.cgi?id=833783), [2](https://bugzilla.mozilla.org/show_bug.cgi?id=839280)) bug fixes.

You can install this [addon](/public/demo/cc-js-tool/cc-js-tool.xpi), it should work on Windows and Linux with FF20+. You can easily see bug 839280's leaks on today's Aurora (FF21) by opening firefox with this addon, then open and close the devtool inspector panel (CTRL+MAJ+I) and finally run the memory script by pressing ALT+SHIFT+D shortcut.
Wait a bit, the addon is processing the whole CC graph and will freeze your firefox instance. And then open a folder with a log file that displays various information about potential cross compartment leaks.

Let me show you addon's output for this leak.
The code involved in this leak is the following button's click listener:
[/browser/devtools/shared/DeveloperToolbar.jsm](http://hg.mozilla.org/mozilla-central/annotate/5d7a14c71f51/browser/devtools/shared/DeveloperToolbar.jsm#l102)
```
button.addEventListener("click", function() {
  requisition.update(buttonSpec.typed);
  //if (requisition.getStatus() == Status.VALID) {
    requisition.exec();
  /*
  }
  else {
    console.error('incomplete commands not yet supported');
  }
  */
}, false);
```

The script will print this in the log file:

```
############################################################################
DOM Listener leak.

>>> Leaked listener ctypes.uint64_t.ptr(ctypes.UInt64("0x128a16c0")) - JS Object (Function)
Function source:
function () {
"use strict";

          requisition.update(buttonSpec.typed);
          //if (requisition.getStatus() == Status.VALID) {
            requisition.exec();
          /*
          }
          else {
            console.error('incomplete commands not yet supported');
          }
          */
        }

>>> DOM Event target holding the listener ctypes.uint64_t.ptr(ctypes.UInt64("0x12a95f60"))
FragmentOrElement (XUL) toolbarbutton id='command-button-responsive' class='command-button' chrome://browser/content/devtools/framework/toolbox.xul


############################################################################
Scope variable leak.

>>> Function keeping 'button' scope variable alive ctypes.uint64_t.ptr(ctypes.UInt64("0xf9a1640")) - JS Object (Function)
Function source:
function () {
"use strict";

          requisition.update(buttonSpec.typed);
          //if (requisition.getStatus() == Status.VALID) {
            requisition.exec();
          /*
          }
          else {
            console.error('incomplete commands not yet supported');
          }
          */
        }

```

It immediatly tells you that you __may__ leak something via this anonymous function. __may leak__, and not __do leak__, as it is always hard to tell which references are expected to be removed or not, but at least, it tells you that this reference still exist and may keep your compartment/document/global alive.

To make it short, the script first search for FragmentOrElement objects in the CC and search for all objects from the same compartment. Then I focused my work on cross compartment leaks so that I looked for edges going from and to these objects. Finally I analysed each of these objects having references from and to other compartments and tried to translate C++ object patterns into a meaningfull sentence for the Javascript paradigm.

Now What?

I'd like to get feedback from people used to debug leaks (no matter the language) and also discuss with people used to gecko internals like nsXPCWrappedJS, JS Object (Call), ... in order to know if assumptions I made [here](https://github.com/ochameau/cc-js-tool/blob/master/main.js#L213-L250) are correct. So that I can continue translating new potential C++ object patterns into meaningfull Javascript usecases.

