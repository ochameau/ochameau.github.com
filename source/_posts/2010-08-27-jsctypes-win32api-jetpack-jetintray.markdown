---
layout: post
title: "jsctypes + win32api + jetpack = jetintray"
date: 2010-08-26 23:04:20
comments: true
categories: [mozilla]
---
<a href="https://wiki.mozilla.org/Jsctypes/api">JSCtypes</a>! What a powerfull
tool, that allows to call native libraries with our simple Javascript.<br />
<a href="https://jetpack.mozillalabs.com/">Jetpack</a>! What a powerfull tool,
that allows to build reliably javascript applications, with unittests, memory
profiling, web IDE, ...<br />
And <a href="http://en.wikipedia.org/wiki/Windows_API">WinAPI</a> ... a giant C
library still in production in 2010 that allows to do very various things on
Windows platform.<br />
<br />
Mix all that and you get:
<p style="text-align: center"><a href="http://github.com/ochameau/jetintray" style="font-size: 2em;">JetInTray</a></p>
A jetpack API for adding Tray icons on windows via jsctypes and on linux with a
binary xpcom component (I didn't had time to work on a jsctypes version).<br />
You may checkout this jetpack package directly from <a href="http://github.com/ochameau/jetintray">github</a>.<br />
Or if you want to learn jsctypes I suggest you to look at files in <em>lib</em>
directory and to read my two previous posts on jsctypes.
<ul>
<li>I explained on the <a href="http://blog.techno-barje.fr/post/2010/08/06/JSctypes-reboot">first one</a> how
to start playing with jsctypes, how to create C-structures and call
functions.</li>
<li>Then I showed in the <a href="http://blog.techno-barje.fr/post/2010/08/24/jsctypes-unleashed">second
post</a>, how to create a JS callback passed to the native library as a
function pointer.</li>
</ul>
<br />
<br />
That said, I wanted to highlight some underground hacks around win32api! In
WinAPI, there is no addEventListener/setEventCallback/addActionListener/... In
fact, there is the well known <a href="http://www.toymaker.info/Games/html/wndproc.html">WndProc messages
function</a>, that receives absolutely all event of the application!! (Yes for
real!) We define this function as a static function named <em>WndProc</em>. But
in Jsctypes case, that's impossible to define a static function, we can only
create function pointers. That's where comes <strong>the</strong> not so known
hack which allow to register dynamically such event listener.<br />
<ul>
<li>First we have to define our listener function following the <a href="http://msdn.microsoft.com/en-us/library/ms633573.aspx">WinAPI datatypes</a>
<pre>
Components.utils.import(&quot;resource://gre/modules/ctypes.jsm&quot;);
var libs = {};
libs.user32 = ctypes.open(&quot;user32.dll&quot;);

// Define the function pointer type
var WindowProcType = 
  ctypes.FunctionType(ctypes.stdcall_abi, ctypes.int,
    [ctypes.voidptr_t, ctypes.int32_t, ctypes.int32_t, ctypes.int32_t]).ptr;

// Bind a usefull API function
var DefWindowProc = libs.user32.declare(&quot;DefWindowProcA&quot;, ctypes.winapi_abi, ctypes.int,
    ctypes.voidptr_t, ctypes.int32_t, ctypes.int32_t, ctypes.int32_t);

// Set our javascript callback
function windowProcJSCallback(hWnd, uMsg, wParam, lParam) {
  
  // ... do something smart with this event!
  
  // You HAVE TO call this api function when you don't known how to handle an event
  // or your apply is going to crash or do nothing
  return DefWindowProc(hWnd, uMsg, wParam, lParam);
}

// Retrieve a C function pointer for our Javascript callback
var WindowProcPointer = WindowProcType(windowProcJSCallback);
</pre></li>
<li>Then we may fill a WNDCLASS structure with our fresh function pointer. This
structure is used to create a new <em>window class</em> that use it own WndProc
(not the default static function). See <a href="http://msdn.microsoft.com/en-us/library/ms633586%28VS.85%29.aspx">msdn doc</a>
for more information.
<pre>
var WNDCLASS = 
  ctypes.StructType(&quot;WNDCLASS&quot;,
    [
      { style  : ctypes.uint32_t },
      { lpfnWndProc  : WindowProcType }, // here is our function pointer!
      { cbClsExtra  : ctypes.int32_t },
      { cbWndExtra  : ctypes.int32_t },
      { hInstance  : ctypes.voidptr_t },
      { hIcon  : ctypes.voidptr_t },
      { hCursor  : ctypes.voidptr_t },
      { hbrBackground  : ctypes.voidptr_t },
      { lpszMenuName  : ctypes.char.ptr },
      { lpszClassName  : ctypes.char.ptr }
    ]);
var wndclass = WNDCLASS();
wndclass.lpszClassName = ctypes.char.array()(&quot;class-custom-wndproc&quot;);
wndclass.lpfnWndProc = WindowProcType(windowProcCallback);   // &lt;---- here it is!
RegisterClass(wndclass.address());
</pre></li>
<li>After that we may create a hidden window that is created only to catch
events.
<pre>
var CreateWindowEx = 
  libs.user32.declare( &quot;CreateWindowExA&quot;, ctypes.winapi_abi, ctypes.voidptr_t,
      ctypes.long,
      ctypes.char.ptr,
      ctypes.char.ptr,
      ctypes.int,
      ctypes.int,
      ctypes.int,
      ctypes.int,
      ctypes.int,
      ctypes.voidptr_t,
      ctypes.voidptr_t,
      ctypes.voidptr_t,
      ctypes.voidptr_t
    );
var HWND_MESSAGE = -3; // This is the code for message-only window
                      // http://msdn.microsoft.com/en-us/library/ms632599%28VS.85%29.aspx#message_only
var win = CreateWindowEx(
    0, wndclass.lpszClassName,
    ctypes.char.array()(&quot;messages-only-window&quot;),
    0, 0, 0, 0, 0,
    ctypes.voidptr_t(HWND_MESSAGE), null, null, null);
</pre></li>
<li>Finally, we only have to bind this window to any component which dispatch
messages/events in order to receive them in our <em>windowProcJSCallback</em>
callback. That's it!</li>
</ul>