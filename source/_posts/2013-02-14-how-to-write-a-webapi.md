---
layout: post
title: "Firefox OS Bootstrap: How to Build It on a VM"
title: "How to write a new WebAPI in Firefox Desktop, mobile, OS - part 1 ?"
date: 2013-02-14
comments: true
categories: [mozilla, firefox-os, webapi, pm]
---

Mozilla teams recently wrote [tons of new API](https://wiki.mozilla.org/WebAPI)
in a very short period of time, mostly for Firefox OS, but not only.
As Firefox Desktop, Firefox Mobile and Firefox OS are based on the same source
code, some of these API can easily be enabled on Desktop and mobile.

Writing a new API can be seen as both complicated and simple. Depending on the 
one you want to write, you don't necessary need to write anything else than
Javascript code (for example the [settings API](https://wiki.mozilla.org/WebAPI/SettingsAPI)).
That makes such task much more accessible and easier to prototype as you do 
not enter in compile/run development cycles, nor have to build firefox before even trying to experiment. But there is a significant number of
mozilla specific knowledges to have before being able to write your API code.

The aim of this article is to write down a simple API example from ground
and try to explain all necessary things you need to know before writing an API
with the same level of expertise than what did Firefox OS engineers.

# The example API: &laquo; CommonJS require &raquo;

Let's say we would like to expose to websites a `require()` method that act like
the nodejs/commonjs method with the same name. This function allows you to load
javascript files exposing a precise interface, without polluting your current javascript scope.

So given the following javascript file:
{% codeblock http://blog.techno-barje.fr/public/webapi/module.js lang:js %}
// All properties set to `exports` variable will be returned to the requirer
exports.hello = function () {
  return "World";
};
{% endcodeblock %}

Any webpage will be able to use its `hello` function like this:
{% codeblock the web lang:js %}
var module = navigator.webapi.require("http://blog.techno-barje.fr/public/webapi/module.js");
alert(module.hello()); // >> Display "World"
{% endcodeblock %}

# Simpliest implementation possible

In this first example I stripped various advanced features in order to ease 
jumping into Firefox internal code. I bundled this example as a Firefox addon
so that you can easily see it running and also hack it.
You can download it [here](/public/webapi/api-without-idl.xpi). Once installed, you will have to relaunch Firefox,
open any webpage, then open a Web console and finally execute the
`navigator.webapi.require` code I just gave.

Now let's see what's inside. 
This .xpi file is just a zip file so you can
open it and see three files:

  * __install.rdf__:

  A really boring file describing our addon. The only two important
  fields in this file are: `<em:bootstrap>false</em:bootstrap>` and
  `<em:unpack>true</em:unpack>` required when you need to register a XPCOM file.
  More info [here](https://developer.mozilla.org/en-US/docs/Install_Manifests#bootstrap).

  * __chrome.manifest__:

```
# Those two lines allow to register the Javascript xpcom component defined in
# `web-api.js`
component {20bf1550-64b8-11e2-bcfd-0800200c9a77} web-api.js
contract @mozilla.org/webapi-example;1 {20bf1550-64b8-11e2-bcfd-0800200c9a77}

# That line registers the xpcom component in the "JavaScript-navigator-property"
# category which add it to the list of components that inject a new property in
# `navigator` web pages global object. The second argument defines the name of
# the property we would like to set.
category JavaScript-navigator-property webapi @mozilla.org/webapi-example;1
```

  * __web-api.js__:

And last but not least. The Javascript XPCOM file. XPCOM is a component object
model overused in Mozilla codebase.
More info [here](https://developer.mozilla.org/en/docs/XPCOM)
Let's analyse its content by pieces:

{% codeblock lang:js %}
function WebAPI() {}

WebAPI.prototype = {
  // Define the XPCOM component id, that has to match the one given in
  // chrome.manifest file
  classID: Components.ID("{20bf1550-64b8-11e2-bcfd-0800200c9a77}"),

  // Mandatory XPCOM method, that defines which interfaces
  // an object exposes.
  // * nsIDOMGlobalPropertyInitializer:
  // https://developer.mozilla.org/fr/docs/XPCOM_Interface_Reference/nsIDOMGlobalPropertyInitializer
  // This interface is related to the XPCOM category "JavaScript-navigator-property"
  // declared in the chrome.manifest file and this interface defines the `init`
  // method that is called when a webpage try to access navigator.webapi property.
  QueryInterface: XPCOMUtils.generateQI([
    Ci.nsIDOMGlobalPropertyInitializer
  ]),

  // nsIDOMGlobalPropertyInitializer:init
  init: function init(win) {
    // The `init` method can return an object that will be the one exposed as
    // `navigator.webapi`. This object will be created for each web document.
    return {
      require: function (url) {
        return require(win, url);
      },
      // Special internal attribute used to define which property the website
      // will be able to access. Only attribute whose name is specified here
      // are going to be accessible by the page.
      // https://wiki.mozilla.org/XPConnect_Chrome_Object_Wrappers
      __exposedProps__: {
        require: 'r'
      }
    };
  }
};

// Last XPCOM thingy that allows to expose our WebAPI Component to the system
// More info here: https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/XPCOMUtils.jsm
const NSGetFactory = XPCOMUtils.generateNSGetFactory([WebAPI]);
{% endcodeblock %}

I let you discover the implementation of the `require` method, but it will
be your job to implement such method. Now, you have the very minimal set where 
you can tweak the returned value of the `init` method and expose your own
API to webpages.

Now note that this is a very minimal example. I'll try to continue blogging
about that and eventually talk about:

  * interfaces definition,
  * custom event implementation,
  * other XPCOM categories (in order to inject on other object than navigator),
  * how to implement a cross process API (mandatory for Firefox OS),
  * prototyping via the Addon SDK,
  * ...

