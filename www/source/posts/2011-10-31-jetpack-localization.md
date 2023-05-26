---
layout: post
title: "Jetpack localization"
date: 2011-10-31
categories: [mozilla, jetpack, pm]
mastodon-comments: https://piaille.fr/@technobarje/110443205487810196
---
I'm going to describe the first proposal of localization support for Jetpack. 
This approach uses gettext pattern and json files for locales.
It is the first step of multiple iterations. This one only allows retrieving localized string in javascript code.
We are going to give ways to translate files, mainly HTML files, through another iteration.
And we are about to offer an online tool to ease addon localization (like babelzilla website).

Let's start by looking at a concrete example, then I'll justify our different choices.

``` javascript French locale file
{
  "Hello %s": "Bonjour %s",
  "hello_user": "Bonjour %s"
}
```

``` javascript Addon code
// Retrieve a dynamic reference to `_` gettext method with:
const _ = require("l10n").get;

// Then print to the console a localized string:
console.log(_("Hello %s", "alex"));
// => Prints "Bonjour alex" in french.

// Or, if we don't want to use localized string in addon code:
console.log(_("hello_user", "alex"));
```

Why gettext?
------------
1. It gives a way to automatically fetch localizable strings or ids from source code
by searching for `_(  )` pattern. 
2. It allows to use either strings or IDs as value to translate. 
It is obviously better to use IDs. Because locales will broke
each time addon developer fix a typo in the main language hard coded in the code.

But we should not forget that the high level APIs is trying to
simplify addon development. So that it has to be really easy to translate a simple
addon that has only 2 JS files and less than 50 lines of code!
And the simple fact to mandatory require a locale file for the default language
appears like a big burden for such small addon.

Having said that, I'm really happy that gettext approach doesn't discourage, nor
makes it harder to use IDs, and so, if an addon developer build a big addon
or just want to take more time to use better pratice, he still can do it, easily!

Why JSON for locales?
---------------------
We could have used properties files, like XUL addons. But this format has some 
limitations that are not compatible with gettext pattern. Keys can't contain spaces
and are limited to ASCII or something alike, so that we can't put text in a key.

So instead of using yet another specific format, I'm suggesting here to use JSON.
JSON is really easy to parse and generate from both client and server side,
and I'm convinced that it is simple enough to be edited with a text editor.
On top of that we can build a small web application to ease localization.

In my very first proposal, I used a complex JSON object with nested attributes.
But it ends up complexifying the whole story without real advantage.
So I'm suggesting now to use the most simple JSON file we can require: 
one big object with keys being strings or id to translate and values being translated strings.
Then we will be able to use JSON features to implement complex localization features,
like plurals handling. So that values may be an array of plurals forms.

The big picture
---------------
Everything starts with one addon developer or one of its contributor.
If one of them want to make the addon localizable, they have to use this new localization module.
```  js
const _ = require("l10n").get;
```

There is already multiple choices that has been made here:

 - `_` is not a _magic global_. We need to explicitely require it. 
This choice will simplify compatibility with other CommonJS environnements, like NodeJS.
 - The name of the module itself is `l10n` instead of `localization` in order to ease the use of it.
 - This module expose `_` function on `get` attribute in order to be able to 
expose another methods. I'm quite confident we will need some functions for plurals or files localization.

Then, they need to use `_` on localizable strings:
```  js
var cm = require("context-menu");
cm.Item({
  label: _("My Menu Item"),
  context: cm.URLContext("*.mozilla.org")
});
```

Now, they have two choices:

 * use a string written in their prefered language, like here. 
So that they don't have to create a locale file.
 * use an ID. Instead of `_("My Menu Item")`, we will use: `_("contextMenuLabel")`.
But it forces to create a localization file in order to map `contextMenuLabel` to `My Menu Item`.

Then, either a developer or a localizer can generate or modify locales files.
Each jetpack package can have its own `locale` folder. 
This folder contains one JSON file per supported language.
Here is how looks like a jetpack addon:

    * my-addon/
      * package.json   # manifest file with addon name, description, version, ...
      * data/          # folder for all static files
        * images, 
        * html files, 
        * ...
      * lib /          # folder that contains all JS modules:
        * main.js      # main module to execute on startup
        * my-module.js # custom module that may use localization module
        * ...
      * locale/       # our main interest!
        * en-US.json
        * fr-FR.json
        * en-GB.json
        * ...

The next iteration will add a new feature to our command line tool,
that is going to generate or update a locale file for a given language by fetching localization strings from source code.
For example, the following command will generate `my-addon/locale/fr-FR.json` file:

``` sh
$ cfx fetch-locales fr-FR
```

``` javascript my-addon/locale/fr-FR.json
{
  "My Menu Item": "My Menu Item"
}
```

Finally, we need to replace right side values with the localized strings:
``` javascript
{
  "My Menu Item": "Mon menu"
}
```
And build the final addon XPI file with:

``` sh
    $ cfx xpi
```

Any kind of feedback would be highly appreciated on [this group thread](https://groups.google.com/group/mozilla-labs-jetpack/t/da50c6dac33b445b).

If you want to follow this work, 
subscribe to [bug 691782](https://bugzilla.mozilla.org/show_bug.cgi?id=691782).

