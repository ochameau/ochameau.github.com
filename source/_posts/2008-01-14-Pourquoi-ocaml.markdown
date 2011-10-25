---
layout: post
title: "Mais pourquoi ocaml ?"
date: 2008-01-14 21:24:50
comments: true
categories: [ocaml]
---
<h2>Ses performances</h2>
<p>C'est un des langages les plus performant avec un garbage collector&#160;:
<a href="http://shootout.alioth.debian.org/gp4sandbox/benchmark.php?test=all&amp;lang=all&amp;calc=Calculate&amp;xfullcpu=1&amp;xmem=1&amp;xloc=0&amp;binarytrees=1&amp;chameneosredux=0&amp;fannkuch=1&amp;fasta=1&amp;knucleotide=1&amp;mandelbrot=1&amp;meteor=0&amp;nbody=0&amp;nsieve=1&amp;nsievebits=1&amp;partialsums=1&amp;pidigits=0&amp;recursive=1&amp;regexdna=1&amp;revcomp=1&amp;spectralnorm=1&amp;hello=0&amp;sumcol=1&amp;threadring=0">
Benchmark avec comme crit&#232;re&#160;: vitesse et consommation m&#233;moire</a><br />
Au final OCaml consomme peu de m&#233;moire tout en restant dans les plus rapides et
tout cela sans demander au d&#233;veloppeur de g&#233;rer la m&#233;moire!</p>
<h2>L'environnement par d&#233;faut, ses outils&#160;:</h2>
<p>Mine de rien, lorsque vous t&#233;l&#233;charger les sources
<em>ocaml-3.10.1.tar.bz2</em> de 2.2 Mo, vous aller avoir acc&#232;s &#224; un nombre
important d'outils avanc&#233;s&#160;:</p>
<ul>
<li>un compilateur en <strong>code natif</strong> (x86, amd64, power pc, alpha,
mips, sparc, ...),</li>
<li>un compilateur qui g&#233;n&#232;re du <strong>bytecode</strong> caml. Le programme
pourra int&#233;grer l'interpr&#233;teur de bytecode afin d'&#234;tre ex&#233;cutable n'importe o&#249;.
L'application peut aussi int&#233;grer un toplevel afin de pouvoir ex&#233;cuter des
commandes <strong>dans</strong> le programme.(une sorte de shell),</li>
<li>Un <strong>d&#233;bugueur pas &#224; pas</strong> permettant de revenir en arri&#232;re!
(uniquement en bytecode),</li>
<li>Un toplevel ind&#233;pendant permettant d'apprendre facilement le langage en
ex&#233;cutant des instruction caml comme dans une ligne de commande,</li>
<li>camlp4, un preprocesseur permettant d'&#233;tendre le langage en fonction du
domaine de notre programme,</li>
<li>des g&#233;n&#233;rateurs de parser lex/yacc,</li>
<li>un outil de cr&#233;ation automatique de documentation &#224; partir de code source
.ml,</li>
<li>ocamlbuild, un assistant de compilation, comme make, mais sp&#233;cialis&#233; pour
OCaml et tr&#232;s simple,</li>
<li>et enfin, des outils de profiling.</li>
</ul>
<h2>Sa richesse</h2>
<p>C'est &#224; coup s&#251;r un des seuls langage &#224; permettre de choisir le paradigme le
plus adapt&#233; pour chaque partie de son programme!<br />
Nous pouvons ainsi utiliser selon le contexte du <strong>fonctionnel, de
l'imp&#233;ratif ou de l'objet</strong>.<br />
Mais ce langage va encore plus loin, et int&#232;gre des concepts de programmation
que tout langage digne de ce nom devrait int&#233;grer:</p>
<ul>
<li>polymorphisme param&#233;tr&#233; (ie generics de java et templates de C++),</li>
<li><a href="http://fr.wikipedia.org/wiki/Fonction_d%27ordre_sup%C3%A9rieur">fonctions
d'ordre sup&#233;rieur</a> (une fonction peut prendre en param&#232;tre ou retourner une
fonction, et ce de mani&#232;re tr&#232;s naturelle),</li>
<li><a href="http://fr.wikipedia.org/wiki/Fermeture_%28informatique%29">fermetures</a>
(closure in english, difficile &#224; r&#233;sumer!),</li>
<li>prise en charge des exceptions,</li>
<li><a href="http://fr.wikipedia.org/wiki/Filtrage_par_motif">filtrage par
motifs</a> (pattern matching in english),</li>
<li><a href="http://fr.wikipedia.org/wiki/Inf%C3%A9rence_de_types">l'inf&#233;rance
de types</a></li>
<li>...</li>
</ul>
<p>Voici comment obtenir un quicksort clair et simple avec du filtrage par
motif, du fonctionnel, des types inf&#233;r&#233;s ainsi que des fermetures et une
fonction d'ordre sup&#233;rieur&#160;:</p>
<pre>
 let rec quicksort = function                     (* filtrage par motif du param&#232;tre d'entr&#233;e qui est la liste &#224; trier *)
    | [] -&gt; []                                                     (* [] est une liste vide *)
    | pivot :: rest -&gt;                                       (* pivot = premier element, rest = le reste de la liste *)
        let is_less x = x &lt; pivot in                 (* fermeture, car nous utilisons la variable pivot *)
        let left, right = List.partition is_less rest in       (* partition est une fonction d'ordre sup&#233;rieur car is_less est une fonction *)
        (quicksort left) @ [pivot] @ (quicksort right)     (* @ permet de concat&#233;ner des listes *)
(* le tout sans avoir &#224; pr&#233;ciser les types ... *)
(* List.partition p l returns a pair of lists (l1, l2), where l1 is the list of all the elements of l that satisfy the predicate p, and l2 is the list of all the elements of l that do not satisfy p. *)
</pre>