---
layout: post
title: "OCaml est l&#224;"
date: 2008-01-07 21:16:26
comments: true
categories: [ocaml]
---
<p><a href="/tag/Ocaml">Ocaml</a> et la <a href="/tag/programmation%20fonctionnelle">programmation fonctionnelle</a> sont d&#233;j&#224;
parmis nous!</p>
<ul>
<li><a href="http://fr.wikipedia.org/wiki/MediaWiki#Le_contenu_.C3.A9labor.C3.A9" hreflang="fr">MediaWiki</a> (le logiciel faisant tourner wikipedia) utilise ocaml pour
afficher ses formules math&#233;matiques!</li>
</ul>
<ul>
<li>KDE fait de m&#234;me avec son application de tableau p&#233;riodique des elements
chimiques&#160;: <a href="http://www.framasoft.net/article4052.html" hreflang="fr">kalzium</a>, pour r&#233;soudre des &#233;quations chimiques!</li>
</ul>
<blockquote>
<p>a CH3CH2OH + b O2 -&gt; c H2O + d CO2 =&gt; 1 CH3CH2OH + 3 O2 -&gt; 3 H2O +
2 CO2<br />
<a href="http://websvn.kde.org/trunk/KDE/kdeedu/kalzium/src/solver/README?revision=437725&amp;view=markup" hreflang="en">Code sources</a></p>
</blockquote>
<ul>
<li><a href="http://fr.wikipedia.org/wiki/XSLT" hreflang="fr">XSLT</a>
<strong>est</strong> une langage fonctionnel d&#233;crit en XML!</li>
</ul>
<ul>
<li>Enfin, un ph&#233;nom&#232;ne majeur est l'adoption massive des libraries
<em>ajax</em> comme <a href="http://jquery.com/" hreflang="en">jQuery</a>.</li>
</ul>
<p>Figurez vous que ces libraries utilisent fortement les aspects fonctionnels
de javascript.<br />
Examples avec jQuery&#160;:</p>
<pre>
     $('#myButton').bind('click', function() {
         // 'this' is the DOM element that triggered the event
         alert(this.id == 'myButton');
     });
</pre>
<pre>
     $('div').each(function() {
         // 'this' is a DOM element
         alert(this.tagName.toLowerCase() == 'div');
     });
</pre>