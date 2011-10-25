---
layout: post
title: "JSctypes round two"
date: 2010-08-06
comments: true
categories: [mozilla]
---
<p>Jsctypes has been introduced in Firefox 3.6 with simple C function call and
only simple types: int, char, string, ... But the next iteration of jsctypes
that is coming in Firefox 4 is going to allow full C binding, with support of C
structures and the ability to define a javascript function and give it to C
library as a function pointer.</p>
<p>No more compilation, no more mozilla sdk download, nor XPCOM stuff, just
plain javascript and only a tiny part of function and datatype declaration
before doing a native binding!</p>
<p>But let the code talk! Here is an example that display a tray icon on
windows. You can copy and paste this code in your Javascript Console in Firefox
4 beta, just do not forget to change the icon path defined in the loadimage
function call.</p>
<pre>
  /* simply load &quot;ctypes&quot; object */
  Components.utils.import(&quot;resource://gre/modules/ctypes.jsm&quot;);
  
  /* Load libraries that we are going to use */
  var libuser32 = ctypes.open(&quot;user32.dll&quot;);
  var libshell32 = ctypes.open(&quot;shell32.dll&quot;);

  /* Here is the tedious work of declaring functions arguments types and struct attributes types */
  /* In fact it's quite easy, you just have to find which precise type are using your native functions/struct */
  /* but it may be hard to known, for example in windows API, which precise type is behing their &quot;HANDLE&quot; type ... */
  /* I recommend you to find and look at python ctype binding source code because they already had done this work */
    
  /*
  HANDLE WINAPI LoadImage(
    __in_opt  HINSTANCE hinst,
    __in      LPCTSTR lpszName,
    __in      UINT uType,
    __in      int cxDesired,
    __in      int cyDesired,
    __in      UINT fuLoad
  );
  */
  var loadimage = libuser32.declare(&quot;LoadImageA&quot;,
    ctypes.stdcall_abi,
    ctypes.int,
    ctypes.int,
    ctypes.char.ptr,
    ctypes.int,
    ctypes.int,
    ctypes.int,
    ctypes.int);
  const LR_LOADFROMFILE = 16;
  const IMAGE_ICON = 1;
  
  var notificationdata = ctypes.StructType(&quot;NOTIFICATIONDATA&quot;,
                                [{ cbSize  : ctypes.int          },
                                 { hWnd    : ctypes.int          },
                                 { uID     : ctypes.int          },
                                 { uFlags  : ctypes.int          },
                                 { uCallbackMessage : ctypes.int },
                                 { hIcon        : ctypes.int     },
                                 { szTip        : ctypes.char.array(64) },
                                 { dwState      : ctypes.int     },
                                 { dwStateMask  : ctypes.int     },
                                 { szInfo       : ctypes.char.array(256) },
                                 { uTimeoutOrVersion : ctypes.int },
                                 { szInfoTitle  : ctypes.char.array(64) },
                                 { dwInfoFlags  : ctypes.int },
                                 { guidItem     : ctypes.int },
                                 { hBalloonIcon : ctypes.int }
                                ]);
  const NIF_ICON = 0x00000002;
  
  /*
  BOOL Shell_NotifyIcon(
    __in  DWORD dwMessage,
    __in  PNOTIFYICONDATA lpdata
  );
  */
  var notifyicon = libshell32.declare(&quot;Shell_NotifyIcon&quot;,
                                    ctypes.stdcall_abi,
                                    ctypes.bool,
                                    ctypes.int,
                                    notificationdata.ptr);
  const NIM_ADD = 0x00000000;
  

  /* And now, the &quot;real&quot; code that is calling C functions */

  /* load our ico file */
  var hIcon = loadimage(0, &quot;c:\\default.ico&quot;, IMAGE_ICON, 16, 16, LR_LOADFROMFILE);
  
  /* create a C struct that is defining a notification in tray */
  var icon = notificationdata();
  icon.cbSize = notificationdata.size;
  icon.uFlags = NIF_ICON;
  icon.szTip = &quot;My Tray Icon&quot;;
  icon.hIcon = hIcon;
  
  /* Display this notification! */
  notifyicon(NIM_ADD, icon.address());

</pre>
<p>We will be able to go futher and define a function callback to handle click
events on the trayicon, but there is currently a bug which cause some crashes
when using ctypes.FunctionType on windows. (ctypes.FunctionType allow to
transform a custom Javascript function to a C function pointer)<br />
Here is related bugs, which are still in process:</p>
<ul>
<li><a href="https://bugzilla.mozilla.org/show_bug.cgi?id=573066" hreflang="en">Bug 573066 - Fix ctypes stdcall closure tests</a></li>
<li><a href="https://bugzilla.mozilla.org/show_bug.cgi?id=585175" hreflang="en">Bug 585175 - Don't automangle ctypes stdcall symbols for WINAPI</a></li>
</ul>
The first leads to crashes with FunctionType, and the second may lead to
lib.declare with unfindable symbols errors when using ctypes.stdcall_abi.