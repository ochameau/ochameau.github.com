---
layout: post
title: "UIWebView secrets - part1 - memory leaks on xmlhttprequest"
date: 2010-10-04
comments: true
categories: [iphone-sdk]
---
<p>My first blog post on iphone subject reveal a big memory bug when using
UIWebView component. This is the (only one) component to display some HTML
content in an iphone interface. UIWebView object has a lot of differents issues
and I'm going to highlight the biggest of them. Actually, all XMLHttpRequests
used in javascript code are fully leaking!!! I mean when you do a request that
retrieve 100ko of data, your memory used grow up for 100ko! This bug is not
always active, but almost always. In fact the trigger to enable it is to simply
open one link in your UIWebView. For example, clicking on a &lt;a&gt; link.</p>
<p>But let's look at a memory usage graph while we execute this <a href="/public/iphone-sdk/UIWebViewLeaks.zip">simple test application</a>: <img src="/public/iphone-sdk/profile-xmlhttprequest-0-then-1-labeled.png" alt="memory usage graph" style="margin: 0 auto; display: block;" title="memory usage graph" /></p>
<ol>
<li>Create the UIWebView object</li>
<li>Load a local HTML test file</li>
<li>Execute 3 XMLHttpRequest to google.com, notice how the memory is freed
three times after each request!</li>
<li>Trigger the leak by opening a page that redirect back to our test file</li>
<li>Execute the same 3 XMLHttpRequest and look how much memory is used and
totally leaked :/</li>
<li>We clean the HTML document with document.body.innerHTML=''; (sometimes free
some memory, when we have a lot of DOM objects)</li>
<li>release the UIWebView (almost no memory freed, next post is going to
analyse that)</li>
</ol>
<p style="text-align: center"><a href="/public/iphone-sdk/UIWebViewLeaks.zip">Test Application</a></p>
<br />
So, to sum up, usually, when you execute this Javascript in a UIWebView:
<pre>
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 &amp;&amp; xmlhttp.status == 200) {
      // Do whatever you want with the result
      
    }
  };
  xmlhttp.open(&quot;GET&quot;, &quot;http://your.domain/your.request/...&quot;, true);
  xmlhttp.send();
</pre>
Your are going to have a big memory usage and leak a lot of data!<br />
<br />
<p>But there is a hack to solve this problem: revert what is done when you open
a link.<br />
In fact, the key property which leads to this leak is the
<em>WebKitCacheModelPreferenceKey</em> application setting. And when you open a
link in a UIWebView, this property is automatically set to the value
<em>&quot;1&quot;</em>. So, the solution is to set it back to <em>0</em> everytime you
open a link. You may easily do this by adding a <em>UIWebViewDelegate</em> to
your UIWebView :</p>
<pre>
- (void)webViewDidFinishLoad:(UIWebView *)webView {
  [[NSUserDefaults standardUserDefaults] setInteger:0 forKey:@&quot;WebKitCacheModelPreferenceKey&quot;];
}
</pre>
So are you going to have much less crash due to &quot;Low Memory&quot; :)