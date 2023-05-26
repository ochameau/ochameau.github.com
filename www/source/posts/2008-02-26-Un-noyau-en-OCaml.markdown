---
layout: post
title: "Un noyau en OCaml"
date: 2008-02-26
comments: true
categories: [ocaml]
---
<p>Cette id&#233;e doit souvent revenir dans l'esprit des d&#233;veloppeurs Haskell ou
OCaml&#160;: Pourquoi n'entendons-nous pas parler d'exp&#233;riences de noyaux &#233;cris
avec un langage fonctionnel&#160;?</p>
<p>En effet, le fait de ne jamais avoir de segfault ou de null pointer
exception est tout de m&#234;me un sacr&#233; avantage dans un noyau!!! Alors oui, il y a
&#224; coup s&#251;r d'&#233;normes probl&#232;mes comme le garbage collector, on perdrait surement
en contr&#244;le et en efficacit&#233;. Mais je reste convaincu que des fonctions en
fonctionnel pur (donc sans effets de bords) seraient une sacr&#233;e avanc&#233;e dans le
d&#233;veloppement kernel o&#249; l'on manipule plusieurs threads et plusieurs coeurs
d'ex&#233;cution en m&#234;me temps!</p>
<p>Et bien apr&#232;s une longue recherche, on peut trouver deux projets en
OCaml&#160;:</p>
<ul>
<li><a href="http://mynos.sourceforge.net/" hreflang="en">MyNOS</a></li>
<li><a href="http://home.gna.org/funk/" hreflang="en">Funk</a></li>
</ul>
<p>Malheureusement, ces projets n'ont plus d'activit&#233; notable depuis 2005
:(</p>