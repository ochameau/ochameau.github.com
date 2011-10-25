---
layout: post
title: "dynamique vs statique"
date: 2008-02-21
comments: true
categories: [ocaml]
---
<p>Les langages dynamiques comme Python, PHP, Ruby ou encore Javascript ont le
vent en poupe, car ils apportent un net gain en <em>productivit&#233;
<del>&#233;ph&#233;m&#232;re</del> instantan&#233;e</em>.<br />
Lorsque l'on d&#233;veloppe dans ces langages, on boucle sur des cycles&#160;:
<strong>coder puis regarder</strong>&#160;:</p>
<ul>
<li>on modifie le code source du programme, et,</li>
<li>on va directement voir le r&#233;sultat en ex&#233;cutant l'application ...</li>
</ul>
<p>Dans le cas des langages &#224; typage statique, nous sommes oblig&#233;s de rajouter
une &#233;tape interm&#233;diaire&#160;: <strong>coder, compiler et &#233;ventuellement
regarder</strong>&#160;:</p>
<ul>
<li>on commence toujours pas modifier notre code source, puis,</li>
<li>nous sommes oblig&#233;s de cliquer sur un bouton ou de lancer un make pour la
compilation, et enfin,</li>
<li>suivant le r&#233;sultat de la compilation, soit on se lance dans un nouveau
cycle en cas d'erreur, ou alors, on ex&#233;cute l'application pour valider des
besoins fonctionnels ou visuels.<br /></li>
</ul>
<p>Donc oui, un programme d&#233;velopp&#233; &#224; l'aide d'un langage statique prendra plus
de temps car l'&#233;tape de compilation nous oblige &#224; supprimer toute erreur de
typage, de syntaxe et souvent bon nombre d'erreurs d'inattention. De plus cette
&#233;tape de compilation ne supprime pas l'&#233;tape &quot;lancer le programme&quot;, que nous
devons toujours effectuer afin de valider les specs fonctionnelles ou
graphiques.<br /></p>
<p>Mais ce temps pass&#233; &#224; faire valider notre code par le compilateur n'est pas
sans b&#233;n&#233;fices, puisque notre programme sera plus fiable et n'&#233;mettra aucune
erreur purement informatique&#160;: typage, syntaxe, ...<br />
Ainsi, <strong>les erreurs sont pr&#233;sent&#233;es au d&#233;veloppeur et en aucun cas &#224;
l'utilisateur</strong> qui ne devrait en aucun cas avoir &#224; g&#233;rer, ni
comprendre, ni m&#234;me voir une telle erreur! <sup>[<a href="#pnote-212155-1" id="rev-pnote-212155-1" name="rev-pnote-212155-1">1</a>]</sup></p>
<h3>Tests unitaires</h3>
<p>Oui mais certains diront&#160;: on peut d&#233;velopper en mode <em><a href="http://fr.wikipedia.org/wiki/Extreme_programming" hreflang="fr">Extreme
programming</a></em> ou encore <em>Programmation agile</em> en agr&#233;mentant une
base de tests unitaires tout au long du d&#233;veloppement. Cela se tient si l'on
fait des tests unitaires doubl&#233;s de <a href="http://fr.wikipedia.org/wiki/Couverture_de_code" hreflang="fr">couverture de
code</a> maintenue &#224; 100% afin de s'assurer d'ex&#233;cuter l'int&#233;gralit&#233; du code
source par les tests et ainsi &#233;viter l'affichage de moultes erreurs aux yeux
&#233;bahis de nos utilisateurs.<br />
Mais cela engendre un volume de travail suppl&#233;mentaire loin d'&#234;tre n&#233;gligeable!
On peut m&#234;me se demander si les tests ne font pas que reproduire l'action d'un
compilateur analysant notre programme ?<br />
Pour rester objectif, je dirais que de tels tests vont plus loin et permettent
par exemple de valider des specs fonctionelles et nous obtenons au final un
logiciel modulaire, <ins>sp&#233;cifi&#233;</ins> et solide.<sup>[<a href="#pnote-212155-2" id="rev-pnote-212155-2" name="rev-pnote-212155-2">2</a>]</sup>'<br />
Mais je reste perplexe quand au temps de d&#233;veloppement n&#233;cessaire si l'on
compare &#224; n'importe quel langage statique agr&#233;ment&#233; de quelques tests
unitaires/fonctionnels (naturellement plus succincts).<br />
D'autre part, il ne faut pas oublier que la <a href="http://fr.wikipedia.org/wiki/Loi_de_Pareto" hreflang="fr">r&#232;gle des 80/20</a>
s'applique &#224; tout, y compris &#224; l'informatique et &#224; notre sujet de
discussion&#160;: on peut souvent r&#233;aliser une application fonctionnelle &#224; 80%
avec 20% du temps n&#233;cessaire pour faire l'application finale&#160;: fiable et
maintenable par d'autres d&#233;veloppeurs.</p>
<h3>Refactoring et &#233;volution <sup>[<a href="#pnote-212155-3" id="rev-pnote-212155-3" name="rev-pnote-212155-3">3</a>]</sup></h3>
<p>Enfin, je tiens &#224; mettre en avant un probl&#232;me s&#233;rieux lorsque l'on doit
faire &#233;voluer une application &#233;crite &#224; l'aide d'un langage dynamique. En effet,
dans ce cas de figure, nous devons &#224; coup s&#251;r modifier des structures de
donn&#233;es&#160;: faire &#233;voluer un attribut entier vers un objet plus complexe, ou
encore modifier le nom d'une fonction ou ses param&#232;tres, ou pire encore&#160;:
changer le type de sortie d'une fonction! Et &#224; moins d'utiliser des outils
avanc&#233;s comme IntelliJ ou Eclipse, <strong>les &#233;tapes de refactoring(r&#233;&#233;criture
de code) seront laborieuses, incompl&#232;tes et vont d&#233;cupler le nombre d'erreur
signal&#233;es &#224; l'ex&#233;cution</strong> ...<br />
Enfin, il faut rester conscient que ces outils ne pourront jamais rejoindre le
niveau de v&#233;rification effectu&#233; par le compilateur d'un langage typ&#233;
statiquement, et ce, &#224; cause de la nature dynamique du langage.</p>
<div class="footnotes">
<h4>Notes</h4>
<p>[<a href="#rev-pnote-212155-1" id="pnote-212155-1" name="pnote-212155-1">1</a>] <a href="http://pinderkent.blogsavy.com/archives/157" hreflang="en">Billet sur les erreurs &#224; l'ex&#233;cution</a></p>
<p>[<a href="#rev-pnote-212155-2" id="pnote-212155-2" name="pnote-212155-2">2</a>] les tests unitaires sont une bonne chose et je
reviendrais la dessus</p>
<p>[<a href="#rev-pnote-212155-3" id="pnote-212155-3" name="pnote-212155-3">3</a>] <a href="http://blogs.tedneward.com/2008/01/24/Can+Dynamic+Languages+Scale.aspx" hreflang="en">Billet sur l'&#233;volutivit&#233; du dynamique</a></p>
</div>