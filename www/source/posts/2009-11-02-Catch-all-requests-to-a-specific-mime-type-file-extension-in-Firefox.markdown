---
layout: post
title: "Catch all requests to a specific mime type/file extension in Firefox"
date: 2009-11-02
comments: true
categories: [mozilla]
---
Here is a Mozilla Javascript Module which allow to catch <ins>absolutely</ins>
all requests based on their Content-Type Http header (ie Mime type) or their
filename.
<p style="text-align:center"><strong><a href="/public/contentTypeObserver.js">contentTypeObserver.js</a></strong><br />
(under LGPL License)</p>
Normally, it would be simple to catch all firefox request by adding a
nsIURIContentListener like this :
<pre>
Components.classes[&quot;@mozilla.org/uriloader;1&quot;].getService(Components.interfaces.nsIURILoader).registerContentListener( ...nsIURIContentListener... );
</pre>
But for some reason, this listener is bypassed <a href="http://mxr.mozilla.org/mozilla-central/source/uriloader/base/nsURILoader.cpp#403">
here</a> when the HTTP request contains a Content-Disposition header :(<br />
So I give you there all Mozilla black magic needed to catch really all
requests.<br />
<p style="font-weight: bold; text-align: center">Hello world</p>
<pre>
Components.utils.import(&quot;resource://your-extension/contentTypeObserver.js&quot;); 
var contentTypeObserver = {};

// Tell if we must catch requests with this content-type
// requestInfo is an object with 3 attributes : contentType, contentLength and fileName.
contentTypeObserver.getRequestListener = function (requestInfo) {
  // Return a new instance of nsIWebProgressListener
  // (a new instance to avoid conflicts with multiple simultaneous downloads)
  return {
    onStartRequest : function (request, context) {

    },
    onStopRequest : function (request, context, statusCode) {

    },
    onDataAvailable : function (request, context, inputStream, offset, count) {

    }
  };
  // There is an helper function that allow to automatically save this request to a file,
  // you just have to pass destinationFile argument which hold a nsIFile instance :
  return createSaveToFileRequestListener(requestInfo, destinationFile, function () { dump(&quot;file : &quot;+destinationFile.spec+&quot; downloaded!
&quot;); }
}

addContentTypeObserver(contentTypeObserver);
</pre>