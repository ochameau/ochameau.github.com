---
layout: post
title: "jsctypes unleashed"
date: 2010-08-24
comments: true
categories: [mozilla]
mastodon-comments: https://piaille.fr/@technobarje/110443211651094936
---
As bugs <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=573066" hreflang="en">573066</a> and <a href="https://bugzilla.mozilla.org/show_bug.cgi?id=585175" hreflang="en">585175</a>
are fixed and available in last Firefox <a href="http://nightly.mozilla.org/" hreflang="en">nightlies</a>, we can now use JSCtypes at full power!<br />
<p style="text-align: right"><em>Thanks to <a href="http://blog.mozilla.com/dwitte/" hreflang="en">dwitte</a> for quick
fixes!</em></p>
That means :
<ul>
<li>Complex C-struct usage,</li>
<li>The possibility to define a JS callback seen by C library as a function
pointer, and,</li>
<li>Full Win32 API (also called MFC) supports!</li>
</ul>
Lets see how to practice all that on our previous example: TrayIcon via
Win32api. We were able to <em>just</em> display an icon in the <a href="/post/2010/08/06/JSctypes-reboot">previous blogpost</a>. Now we are able to
intercept events from win32api thanks to ctypes.FunctionType. First we define a
plain old javascript function like this one:
<pre>
function windowProcCallback(hWnd, uMsg, wParam, lParam) {
  if (lParam == WM_LBUTTONDOWN) {
    Components.utils.reportError(&quot;Left click!&quot;);
    /* 0 means that we handle this event */
    return 0; 
  }
  else if (lParam == WM_RBUTTONDOWN) {
    Components.utils.reportError(&quot;Right click!&quot;);
    return 0;
  }
  /* Mandatory use default win32 procedure! */
  return DefWindowProc(hWnd, uMsg, wParam, lParam);
};
</pre>
This <em>windowProcCallback</em> is a javascript implementation for a WNDPROC
callback as <a href="http://msdn.microsoft.com/en-us/library/ms633573%28VS.85%29.aspx" hreflang="en">defined in MSDN</a>. WNDPROC is a key part of Win32Api. These functions
receive all kind of events. They are similar to differents listeners existing
in Javascript/web world, but here in win32api, we often have only one super big
listener which receive all events :/<br />
Next, we have to define this WNDPROC data type with jsctypes, like this:
<pre>
var WindowProcType =
  ctypes.FunctionType(ctypes.stdcall_abi, ctypes.int,
    [ctypes.voidptr_t, ctypes.int32_t, ctypes.int32_t, ctypes.int32_t]).ptr;
</pre>
We simply describe a function pointer type, for a function which return an int
and accept 4 arguments: hWnd as pointer, uMsg as int, wParam as int and lParam
as int. Then, in our case, we give this function pointer via a structure. So we
may first describe this C-structure, and simply use our previous data type as
type of a structure attribute:
<pre>
var WNDCLASS =
  ctypes.StructType(&quot;WNDCLASS&quot;,
    [
      { style : ctypes.uint32_t },
      { lpfnWndProc : WindowProcType}, // &lt;-- Here is the function pointer attribute
      { cbClsExtra : ctypes.int32_t },
      { cbWndExtra : ctypes.int32_t },
      { hInstance : ctypes.voidptr_t },
      { hIcon : ctypes.voidptr_t },
      { hCursor : ctypes.voidptr_t },
      { hbrBackground : ctypes.voidptr_t },
      { lpszMenuName : ctypes.char.ptr },
      { lpszClassName : ctypes.char.ptr }
    ]);
</pre>
And finally, we convert our Javascript function to a C-Function pointer by
using the datatype as a function and giving our callback as an argument.
<pre>
var wndclass = WNDCLASS();
wndclass.lpszClassName = ctypes.char.array()(&quot;class-trayicon&quot;);
wndclass.lpfnWndProc = WindowProcType(windowProcCallback);   // &lt;---- here it is!
RegisterClass(wndclass.address());
</pre>
All this hard work to be able to detect clicks on our tray icon! I've built a
full example file <a href="/public/demo/jsctypes/example-jsctypes-full-power.txt">right here</a> (with a
lot of comments). And here is one hack that allow you to test it remotly in
your Javascript Console. You just have to copy an icon in c:\default.ico. Here
is a sample <a href="/public/demo/jsctypes/default.ico">ico file</a>.
<pre>
  var x=new XMLHttpRequest(); x.open(&quot;GET&quot;,&quot;http://blog.techno-barje.fr/public/demo/jsctypes/example-jsctypes-full-power.txt&quot;,false); x.send(null); window.parent.eval(x.responseText);
</pre>
Or if you want to play with this script locally, here is another magic code:
<pre>
  var x=new XMLHttpRequest(); x.open(&quot;GET&quot;,&quot;file://C:/Users/YourUsername/Downloads/example-jsctypes-full-power.txt&quot;,false); x.send(null); window.parent.eval(x.responseText);
</pre>
