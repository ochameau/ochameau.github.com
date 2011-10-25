---
layout: post
title: "UIWebView secrets - part2 - leaks on release"
date: 2010-10-04 16:08:40
comments: true
categories: [iphone-sdk]
---
<p>Continue on iphone with leaks around UIWebView! Here is another big one with
no apparent solution. When we try to release a UIWebView component, very few
memory is freed. So any application using this object to display webpages is
going to crash quickly with Low memory exception :(</p>
<br />
I think this memory usage graph gives an idea on how big is this new king of
leak: <img src="/public/iphone-sdk/profile-uiwebview-leak-onrelease.png" alt="memory usage" style="margin: 0 auto; display: block;" title="memory usage" />
<ol>
<li>Create a UIWebView</li>
<li>Load http://www.google.com/</li>
<li>Release the webview (UIWebView dealloc is correctly called!)<br />
Look how so few memory is freed :/</li>
</ol>
<p style="text-align: center"><a href="/public/iphone-sdk/UIWebViewLeaks2.zip">Test Application</a></p>
<p>The leak is all but tiny! Before the loading of the webpage, the application
was using 630kB of memory, and after the release of the UIWebview, 1150kB! So
we have a 500KB leak in order to simply display the home of Google.com!</p>
<p>This time, I didn't manage to find any hack to solve this bug.<br />
So if you have any tips to fix this, don't hesitate to post a comment!</p>
I've tried a lot of differents hacks to free more memory (or use less), like:
<pre>
  // Setup the webview to disable some fancy effect on phone number, but doesn't change anything on memory released ...
  webview.dataDetectorTypes = UIDataDetectorTypeNone;
  webview.allowsInlineMediaPlayback = NO;
</pre>
or
<pre>
  // Remove and disable all URL Cache, but doesn't seem to affect the memory
  [[NSURLCache sharedURLCache] removeAllCachedResponses];
  [[NSURLCache sharedURLCache] setDiskCapacity:0];
  [[NSURLCache sharedURLCache] setMemoryCapacity:0];
</pre>
or
<pre>
  // Remove all credential on release, but memory used doesn't move!
  NSURLCredentialStorage *credentialsStorage = [NSURLCredentialStorage sharedCredentialStorage];
  NSDictionary *allCredentials = [credentialsStorage allCredentials];
  for (NSURLProtectionSpace *protectionSpace in allCredentials) {
    NSDictionary *credentials = [credentialsStorage credentialsForProtectionSpace:protectionSpace];
    for (NSString *credentialKey in credentials) {
      [credentialsStorage removeCredential:[credentials objectForKey:credentialKey] forProtectionSpace:protectionSpace];
    }
  }
</pre>
or
<pre>
  // Cleanup the HTML document by removing all content
  // This time, this hack free some additional memory on some websites, mainly big ones with a lot of content
  [webview stringByEvaluatingJavaScriptFromString:@&quot;document.body.innerHTML='';&quot;];
</pre>
<br />
<br />
But I never reach complete release of memory used by the web component :(