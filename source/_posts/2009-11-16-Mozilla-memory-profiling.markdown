---
layout: post
title: "Mozilla memory profiling"
date: 2009-11-16
comments: true
categories: [mozilla]
---
As a Mozilla hacker, extension developer and Javascript expert, I've been
really exited to see the <a href="http://www.toolness.com/wp/?p=709">current
work of Atul Varma</a> on memory profiling in Firefox! It's naturally the next
step of tool to build after <a href="https://addons.mozilla.org/en-US/firefox/addon/9954">XUL Profiler</a>, which
track CPU consumption and Javascript functions calls.<br />
So, instead of waiting for web developers to describe their future new &quot;memory&quot;
firebug tab :), I've searched what information we can retrieve from JS API. And
I've not limited my scope to web content but I take all Browser objects into
account.<br />
<br />
First I've tried to find a meaningful parent for <strong>every</strong> living
object.<br />
In the Mozilla planet we may face with three main types of parents :
<ul>
<li>window : chrome (browser.xul, popups, jsconsole, sidebars, ...) or content
(websites,popups,iframes)</li>
<li>xpcom services</li>
<li>JS modules</li>
</ul>
(But there is also XBL, sandboxes and some others strange things like
&quot;Block&quot;)<br />
<br />
Here is the first result of this work :
<p style="text-align: center"><a href="/public/another-profiler_techno-barje.fr-1.0.xpi" style="font-size: 2em;">another-profiler_techno-barje.fr-1.0.xpi</a></p>
<strong>This extension need <a href="https://addons.mozilla.org/fr/firefox/addon/12025">Jetpack 0.6+</a>.</strong>
It adds a &quot;Open another memory profiler&quot; item in Tools menu and display all
living windows, xpcoms and modules. Then when you select one of them, it
displays the simplest profiling ever: number of js objects group by C++ native
class. I'll show you in the next blog post how to display a better
profiling!<br />
<img src="/public/another-profiler-1.0.png" alt="another-profiler-1.0.png" style="margin: 0 auto; display: block;" title="another-profiler-1.0.png, nov. 2009" /> But for now, I'm going to show you all
the code needed to make this first version.<br />
<br />
For the living windows, there is a lot of cases, but it's simple :
<pre>
// Get the list of absolutery ALL windows living in a Firefox session, stored as a Tree
function getAllWindows() {
  var windows = [];
  
  // Begin by iterating over all top chrome windows (browser, jsconsole, dominspector, etc.)
  var wm = Components.classes[&quot;@mozilla.org/appshell/window-mediator;1&quot;]
          .getService(Components.interfaces.nsIWindowMediator);
  var enumerator = wm.getXULWindowEnumerator(null);
  while(enumerator.hasMoreElements()) {
    var win = enumerator.getNext();
    if (win instanceof Components.interfaces.nsIXULWindow) {
      // Search for all children windows (sidebar, content, iframes, ...)
      parseDocshell(win.docShell);
   }
  }

  function getWindowByDocShell(docShell) {
    if (!(docShell instanceof Components.interfaces.nsIInterfaceRequestor))
      return;
    return docShell.getInterface(Components.interfaces.nsIDOMWindow);
  }
  function parseDocshell(docShell) {
    if (!docShell) return;
    var domWindow = getWindowByDocShell(docShell);
    
    var topWindow = {
          type  : &quot;window&quot;,
          name  : domWindow.document.title,
          href  : domWindow.location.href,
          object: domWindow,
          children: []
        };
    windows.push(topWindow);
    
    var topWindows = [topWindow];
    
    var treeItemType = Components.interfaces.nsIDocShellTreeItem.typeAll;
    // From inspector@mozilla.org inspector.js appendContainedDocuments
    // Load all the window's content docShells
    var containedDocShells = docShell.getDocShellEnumerator(treeItemType,
                                      Components.interfaces.nsIDocShell.ENUMERATE_FORWARDS);
    while (containedDocShells.hasMoreElements())
    {
      var childShell = containedDocShells.getNext().QueryInterface(Components.interfaces.nsIDocShell);
      
      if (childShell == docShell) {
        // It's the current topWindow
        continue;
      }
      
      var childDOMWindow = getWindowByDocShell(childShell);
      if (!childDOMWindow) continue;
      var parent;
      for(var i=0; i&lt;topWindows.length; i++) {
        if (topWindows[i].object == childDOMWindow.parent) {
          parent = topWindows[i];
          break;
        }
      }
      var newWindow = {
        type  : &quot;window&quot;,
        name  : childDOMWindow.document.title,
        href  : childDOMWindow.location.href,
        object: childDOMWindow,
        children : []
      };
      topWindows.push(newWindow);
      if (parent)
        parent.children.push(newWindow);
      else
        topWindow.children.push(newWindow);
    }
    delete topWindows;
  }
  
  // Finally, don't forget *the* hidden window, it's a big one used by many extensions!
  var hiddenWindow = Components.classes[&quot;@mozilla.org/appshell/appShellService;1&quot;]
         .getService(Components.interfaces.nsIAppShellService)
         .hiddenWindow;
  if (hiddenWindow instanceof Components.interfaces.nsIXULWindow) {
    parseDocshell(hiddenWindow.docShell);
  }
  
  return windows;
}
</pre>
<br />
<br />
For XPCOM services, it's shorter, but it' an unknown practice :
<pre>
// Get the list of all XPCOM services (not the xpcom objects, only services) in a Firefox session
function getAllXPCOMServices() {
  var instanciatedServices = [];
  var serviceManager=Components.manager.QueryInterface(Components.interfaces.nsIServiceManager);
  var supports = Components.interfaces.nsISupports;
  for(var cl in Components.classes) {
    try {
      if (serviceManager.isServiceInstantiated(Components.classes[cl],supports)) {
        var service=Components.classes[cl].getService(supports);
        if (service.wrappedJSObject) {
          // Get the global object
          service=service.wrappedJSObject.__parent__;
          if (!service)
            service=Components.classes[cl].getService(supports).__parent__;
          instanciatedServices.push({
            type   : &quot;xpcom&quot;,
            name   : cl,
            object : service
          });
        }
      }
    } catch(e) {
      // serviceManager.isServiceInstantiated is throwing if there is no instance ...
    }
  }
  return instanciatedServices;
}
</pre>
<br />
<br />
But for JS Modules, I've not found any way to get those ...<br />
The only solution I've got was to do a quick profiling and identify them :
<pre>
function searchJSModules () {
  var jsmodules = [];
  
  var roots=getGCRoots();
  for(var r in roots) {
    var id = roots[r];
    var info = getObjectInfo(id);
    var properties = getObjectProperties(id);
    /*
    // We can also identify XPCOM by reading global NSGetModule function
    var nsgetmodule = getObjectProperty(id,&quot;NSGetModule&quot;).NSGetModule;
    if (nsgetmodule) {
      print (&quot; --&gt; is an XPCOM&quot;);
      print (&quot; --&gt; defined in : &quot;+getObjectInfo(nsgetmodule).filename);
      continue;
    }
    */
    // See if the current object has a EXPORTED_SYMBOLS object
    // We suppose every JS Module has one ...
    var exportedsymbols = getObjectProperty(id,&quot;EXPORTED_SYMBOLS&quot;).EXPORTED_SYMBOLS;
    if (!exportedsymbols) continue;
    
    // Then search for the first declared function
    // Which will allow us to get the file of this module!
    
    // Begin to search in EXPORTED_SYMBOLS
    var symbols = getObjectProperties(exportedsymbols);
    var filename;
    for(var i in symbols) {
      var s = getObjectProperty(id,symbols[i])[symbols[i]];
      var inf = getObjectInfo(s);
      if (!inf) continue;
      if (inf.nativeClass==&quot;Function&quot; &amp;&amp; inf.filename) {
        filename=inf.filename;
        break;
      } else if (inf.nativeClass=&quot;Object&quot;) {
        var subprops = getObjectProperties(s);
        for(var j in subprops) {
          var subs = subprops[j];
          var subinf = getObjectInfo(subs);
          if (!subinf) continue;
          if (subinf.nativeClass==&quot;Function&quot; &amp;&amp; subinf.filename) {
            filename = subinf.filename;
            break;
          }
        }
        if (filename) break;
      }
    }
    if (!filename) {
      // Unable to found a function in exported_symbols objects
      // now try to find a function defined in global context
      var table = getObjectTable();
      var count=0;
      for (var subid in table) {
        var subinf = getObjectInfo(parseInt(subid));
        if (subinf &amp;&amp; subinf.parent == id &amp;&amp; subinf.nativeClass==&quot;Function&quot; &amp;&amp; subinf.filename) {
          filename = subinf.filename;
          break;
        }
      }
    }
    if (filename) {
      var file = filename;
      var res = filename.match(/\/([^\/]+\/[^\/]+\/[^\/]+\.\w+)$/);
      if (res)
        file = decodeURIComponent(res[1]);
      jsmodules.push({
        type  : &quot;jsmodule&quot;,
        name  : file,
        file  : filename,
        object: id
      });
    } else {
      // we were unable to find any function, we may try to search deeper
    }
  }
  
  return JSON.stringify(jsmodules);
}

function getAllJSModules() {
  var factory = Components.classes[&quot;@labs.mozilla.com/jetpackdi;1&quot;]
               .createInstance(Components.interfaces.nsIJetpack);
  var endpoint = factory.get();
  var json = endpoint.profileMemory(searchJSModules.toSource()+&quot;
searchJSModules()&quot;, &quot;find-jsmodules.js&quot;, 1, null);
  return JSON.parse(json);
}
</pre>
<br />
<br />
Finally, here is the function which retrieve objects counts for one parent. It
use the Jetpack memory profiler XPCOM.
<pre>
function profileFunction() {
  var namedObjects=getNamedObjects();
  
  // namedObjects[&quot;parent&quot;] is null ... why ?!
  var parent;
  for(var i in namedObjects) {
    if (i==&quot;parent&quot;) {
      parent = parseInt(namedObjects[i]);
    }
  }
  
  // Remove web content windows js wrapper
  var inf = getObjectInfo(parent);
  if (inf &amp;&amp; inf.nativeClass==&quot;XPCSafeJSObjectWrapper&quot;) {
    parent = inf.wrappedObject;
  }
  
  var children = {};
  
  // Check every JS object
  var table = getObjectTable();
  for(var i in table) {
    var info = getObjectInfo(parseInt(i));
    
    // Search if this one is related to the selected parent
    // ie walk throught all parents in order to find if the current object is a descendant of selected parent
    if ( info.parent != parent ) {
      var parentMatch = false;
      var p = info.parent;
      while(true) {
        var subinfo = getObjectInfo(p);
        if (!subinfo) break;
        
        if ( subinfo.id == parent || subinfo.parent == parent ) {
          // Answer= Yes
          parentMatch = true;
          break;
        }
        
        // Walk throught encapsulated objects
        if (subinfo.outerObject &amp;&amp; subinfo.outerObject!=p) {
          p = subinfo.outerObject;
          continue;
        }
        
        p = subinfo.parent;
      }
      // Answer= Yes
      if (!parentMatch) continue;
    }
    
    if (!children[info.nativeClass])
      children[info.nativeClass] = 0;
    children[info.nativeClass]++;
  }
  
  return JSON.stringify(children);
}
function profileParent(parent) {
  var factory = Components.classes[&quot;@labs.mozilla.com/jetpackdi;1&quot;]
               .createInstance(Components.interfaces.nsIJetpack);
  var endpoint = factory.get();
  var json = endpoint.profileMemory(profileFunction.toSource()+&quot;
profileFunction()&quot;, &quot;profile.js&quot;, 1, {parent: parent});
  return JSON.parse(json);
}
</pre>
<p style="text-align: right"><a href="https://wiki.mozilla.org/Labs/Jetpack/Binary_Components#Memory_Profiling">More
information</a></p>
<br />
Come back for the next blog post to get the 2.0 version :)