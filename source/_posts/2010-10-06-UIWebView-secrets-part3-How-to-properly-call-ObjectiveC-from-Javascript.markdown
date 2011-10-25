---
layout: post
title: "UIWebView secrets - part3 - How to properly call ObjectiveC from Javascript"
date: 2010-10-06
comments: true
categories: [iphone-sdk]
---
Let's change the subject: this time no more talks about memory but always on
UIWebView component. When we use this component for something else than just
displaying webpages, like building UI with HTML, Javascript, ... We often want
to call Javascript functions from objective C and the opposite.<br />
<br />
<h2>Call Javascript function from Objective-C:</h2>
The first move is easily done with the following piece of code:
<pre>
  // In your Javascript files:
    function myJavascriptFunction () {
    
      // Do whatever your want!
    
    }
  
  // -----------------------------------
  
  // And in your Objective-C code:
  // Call Javascript function from Objective-C:
    [webview stringByEvaluatingJavaScriptFromString:@&quot;myJavascriptFunction()&quot;];
</pre>
<br />
<br />
<h2>Call Objective-C function from Javascript:</h2>
But calling objective-c from a Javascript function is not easy as Iphone SDK
doesn't offer any native way to do this! So we have to use any king of hack to
do this ...<br />
The most known, used <ins>and buggy</ins>&#160;practice is to register a
<em>UIWebViewDelegate</em> on your web view and &#171; catch-and-immediatly-cancel &#187;
a location change done in javascript.
<p style="text-align:right">(a <a href="http://stackoverflow.com/questions/3275093/call-objective-c-method-from-javascript-with-parameter">
very</a> <a href="http://stackoverflow.com/questions/243459/uiwebview-expose-objective-c-to-javascript">
extremely</a> <a href="http://stackoverflow.com/questions/2767902/what-are-some-methods-to-debug-javascript-inside-of-a-uiwebview">
plenty</a> <a href="http://tetontech.wordpress.com/2008/08/14/calling-objective-c-from-javascript-in-an-iphone-uiwebview/">
much</a> <a href="http://www.iphonedevsdk.com/forum/iphone-sdk-development/14501-javascript-interaction-uiwebview-app.html">
advised</a> practice!)</p>
<pre>
  // In Objective-C
  - someFunctionOnInit {
    
    webView = [[UIWebView alloc] init];
    // Register the UIWebViewDelegate in order to shouldStartLoadWithRequest to be called (next function)
    webView.delegate = self;  
    
  }
  
  // This function is called on all location change :
  - (BOOL)webView:(UIWebView *)webView2 
          shouldStartLoadWithRequest:(NSURLRequest *)request 
          navigationType:(UIWebViewNavigationType)navigationType {
    
    // Intercept custom location change, URL begins with &quot;js-call:&quot;
    if ([[[request URL] absoluteString] hasPrefix:@&quot;js-call:&quot;]) {
      
      // Extract the selector name from the URL
      NSArray *components = [requestString componentsSeparatedByString:@&quot;:&quot;];
      NSString *function = [components objectAtIndex:1];
      
      // Call the given selector
      [self performSelector:NSSelectorFromString(functionName)];
      
      // Cancel the location change
      return NO;
    }
    
    // Accept this location change
    return YES;
    
  }
  
  - (void)myObjectiveCFunction {
    
    // Do whatever you want!
   
  }

  // -----------------------------------
  
  // Now in your javascript simply do this to call your objective-c function:
  // /!\ But for those who just read title and code, take care, this is a buggy practice /!\\n  window.location = &quot;js-call:myObjectiveCFunction&quot;;

</pre>
<br />
<br />
<h2>What's wrong with UIWebViewDelegate, shouldStartLoadWithRequest and
location change ?</h2>
There is weird but apprehensible bugs with this practice:<br />
a lot of javascript/html stuff get broken when we cancel a location change:
<ul>
<li>All setInterval and setTimeout immediatly stop on location change</li>
<li>Every innerHTML won't work after a canceled location change!</li>
<li>You may get other really weird bugs, really hard to diagnose ...</li>
</ul>
<p style="text-align: center"><a href="/public/iphone-sdk/NativeBridge/NativeBridge-bug.zip" style="font-size:2em">Sample application highlighting these bugs</a></p>
Key files of this example:
<ul>
<li><strong>MyWebview.m:</strong> Objective-c part, that inherit from
UIWebView. Set the UIWebViewDelegate and catch requests in
shouldStartLoadWithRequest selector.</li>
<li><strong>NativeBridge.js:</strong> Tiny javascript library in order to
change the location and offer a way to send arguments and receive a
response.</li>
<li><strong>webview-script.js:</strong> Test case script, that highlight these
bugs.</li>
</ul>
In webview-script.js: InnerHTML stop working whereas textContent continues to
...
<pre>
  document.getElementById(&quot;count&quot;).innerHTML = i;
  document.getElementById(&quot;count2&quot;).textContent = i;
</pre>
<br />
But we can't charge Apple on this bug. I mean we try to load another location
in the document we are working on! The webview component may start doing stuff
before the delegate call, which cancel the load ...<br />
We have to find alternative way to communicate with the native code!<br />
<br />
<h2>Better way to call Objective-C</h2>
The only thing we have to change is in Javascript code. Instead of changing the
document location, we create an IFrame and set its location to a value that
trigger the shouldStartLoadWithRequest method.<br />
And voil&#224;!
<pre>
  var iframe = document.createElement(&quot;IFRAME&quot;);
  iframe.setAttribute(&quot;src&quot;, &quot;js-frame:myObjectiveCFunction&quot;;
  document.documentElement.appendChild(iframe);
  iframe.parentNode.removeChild(iframe);
  iframe = null;
</pre>
Here is another sample application, with exactly the same structures and test
file.<br />
But this time you are going to see innerHTML and setTimeout working! Again,
this demo contains a library (NativeBridge.js) that allow to send arguments to
native code and get back a result in javascript asynchronously, with a callback
function.
<p style="text-align: center"><a href="/public/iphone-sdk/NativeBridge/NativeBridge-non-buggy.zip" style="font-size:2em;">Best practice example!</a></p>
<br />
<br />
<h2>Free Objective-C&lt;-&gt;Javascript library</h2>
Finally I provide the communication library under LGPL licence so it can ease
your work on iphone platform! As I know that it's really not easy ;-)<br />
<ul>
<li><a href="http://github.com/ochameau/NativeBridge/blob/master/MyWebView.m" style="font-weight:bold;">MyWebView.m</a>: ObjectiveC part,</li>
<li><a href="http://github.com/ochameau/NativeBridge/blob/master/NativeBridge.js" style="font-weight:bold;">NativeBridge.js</a>: Javascript side.</li>
</ul>
The code is full of comment, so you may easily use and tweak it!
<p style="text-align: center"><a href="http://github.com/ochameau/NativeBridge">Github repo</a></p>