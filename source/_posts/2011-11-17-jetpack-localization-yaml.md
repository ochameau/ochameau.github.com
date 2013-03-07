---
layout: post
title: "Jetpack localization using YAML format"
date: 2011-11-17
comments: true
categories: [mozilla, jetpack, pm]
---
In [a previous post](/post/2011/10/31/jetpack-localization/), I've described my first proposal for localization support in jetpack addons. I've decided to change locale files format for [YAML](http://en.wikipedia.org/wiki/YAML) instead of JSON. During MozCamp event, folks helped me identifying some pitfalls with JSON:

 - **No multiline string support.** Firefox parser allows multiline but it is not officialy supported! So that it will disallow third party tools to work properly.
 - **No easy way to add comments.** It is mandatory for localizers to have context description in comments next to keys to translate. As there is no way to add comments in JSON, it will end up complexifying a lot locale format.

Example
=======

``` yaml French locale file in YAML format

# You can add comments with `#`...
Hello %s: Bonjour %s         # almost ...
hello_key: Bonjour %s        # wherever you want!

# For multiline, you need to indent your string with spaces
multiline:
  "Bonjour
   %s"

# Plural forms.
# we use a nested object with attributes that depends on the target language
# in english, we only have 'one' (for 1) and 'other' (for everything but 1)
# in french, it is the same except that 'one' match 0 and 1
# in some language like Polish, there is 4 forms and 6 in arabic
#
# So that having a structured format like YAML,
# help us writing these translations!
pluralString:
  one: "%s telechargement"
  other: "%s telechargements"

# I need to enclode these strings with `"` because of %. See note after.
```

``` javascript Addon code

// Get a reference to `_` gettext method with:
const _ = require("l10n").get;

// These three forms end up returning the same string.
// We can still use a locale string in code, or use a key.
// And multiline string gets its `\n` removed. (there is a way to keep them)
_("Hello %s", "alex") == _("hello_key", "alex") == _("multiline", "alex")

// Example of non-naive l10n feature, plurals:
_("pluralString", 0) == "0 telechargement"
_("pluralString", 1) == "1 telechargement"
_("pluralString", 10) == "10 telechargements"

```

Advantages of YAML
==================

- **Multiline strings are supported nicely / easy to read.** You do not need to add a final `\` on all lines. As mulitiline is easier, localizers can use them more often and it will surely improve readability of locale files!
- **Structured data format.** we can use this power whenever it is needed. For example, when we need to implement complex l10n features like plural forms or any feature that goes beyond simple 1-1 localization. The cool thing if we compare to JSON is that even if we define structures, we keep a really simple format with no noise (like {, }, ", ...).

<br/> 

As nothing comes without any issues, here is what I've found around YAML:

 - This format is not a Web standard. I don't think it makes much sense to avoid using it because of that. We are clearly missing a standardized format for localization in the web world.
 - You may hit some issues when you do not enclose your strings with `"` or `'`. For example, you can't start a string with `%`, nor having a `:` in middle of your string without enclosing it.
 - Even if YAML is not a web standard, it has been formaly specified. And unfortunately, a handy feature becomes a pitfall for our purpose! Some strings are automatically converted. `Yes`, `True`, `False`, ... are automatically converted to a boolean value. We can work around this in multiple ways, either by documenting it, or modifying the parser. The same solution apply here, you need to enclose your string with quotes.

<br/><br/>

Again, feedback is welcomed on [this group thread](https://groups.google.com/group/mozilla-labs-jetpack/t/da50c6dac33b445b) and you can follow this work in [bug 691782](https://bugzilla.mozilla.org/show_bug.cgi?id=691782).

