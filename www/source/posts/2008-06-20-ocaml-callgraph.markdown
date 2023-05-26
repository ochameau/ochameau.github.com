---
layout: post
title: "ocaml callgraph"
date: 2008-06-20
comments: true
categories: [ocaml]
mastodon-comments: https://piaille.fr/@technobarje/110443212817311630
---
<p><a href="http://kcachegrind.sourceforge.net/" hreflang="en">KCacheGrind</a>&#160;: un outil simple mais diablement efficace pour
analyser les callgraph de programmes en C (ou python, php, perl, ...) afin de
faire du d&#233;bogage ou encore de l'analyse de performance.</p>
<h3>Situation actuelle avec un programme caml simple</h3>
<p><strong>Exemple utilis&#233; :</strong></p>
<pre>
let bar i =
        1+i
;;

let foo i  =
        2+(bar i )
;;

let () = 
        print_int ( foo 3 )
;;
</pre>
<ul>
<li>D'abord nous compilons en d&#233;sactivant les optimisations qui pourraient
&#233;liminer ces fonctions triviales</li>
</ul>
<pre>
$ ocamlopt -inline 0 -o foo t.ml
</pre>
<ul>
<li>Puis nous ex&#233;cutons ce test via <a href="http://valgrind.org/" hreflang="en">valgrind</a> qui g&#233;n&#232;re un fichier au format &quot;callgrind&quot;, contenant
l'ordre d'appel des fonctions ainsi que les estimations du temps pass&#233; dans
chacune d'entre elles&#160;:</li>
</ul>
<pre>
$ valgrind --tool=callgrind ./foo
</pre>
<ul>
<li>Enfin, on regarde le r&#233;sultat sous kcachegrind</li>
</ul>
<pre>
$ kcachegrind callgrind.out.10624
</pre>
<p><img src="/public/t-caml-without-patch-callgr.png" alt="t-caml-without-patch-callgr.png" style="display:block; margin:0 auto;" /></p>
<p>Mais voil&#224;, l'assembleur g&#233;n&#233;r&#233; par le compilateur caml ne contient pas
toutes les instructions utilis&#233;es par valgrind lors de l'analyse du programme.
Ainsi, aucun label de fonction n'apparait et nous n'avons le droit qu'&#224; des
adresses m&#233;moire en hexad&#233;cimal :(</p>
<p><strong>/!\ Probl&#232;me corrig&#233; pour la version 3.11&#160;: <a href="http://caml.inria.fr/mantis/bug_view_page.php?bug_id=4642" hreflang="en">d&#233;tails</a></strong></p>
<h3>Exemple du fonctionnement normal en C</h3>
<p>Voyons comment valgrind fonctionne avec du C&#160;:</p>
<pre>
int bar(int a) {
        return 1+a;
}

int foo(int a) {
        return 2+bar(a);
}

int main() {
        foo(3);
}
</pre>
<pre>
$ gcc -O0 -o foo t.c
$ valgrind --tool=callgrind ./foo
$ kcachegrind callgrind.out.10719
</pre>
<p><img src="/public/t-c-callgraph.png" alt="t-c-callgraph.png" style="display:block; margin:0 auto;" /></p>
<p>Cette fois-ci, nous obtenons un graphe correct avec le nom des fonctions;
Regardons maintenant l'assembleur g&#233;n&#233;r&#233; par gcc</p>
<pre>
 $gcc -O0 -S t.c
</pre>
<p><strong>Assembleur de GCC :</strong></p>
<pre>
        .file   &quot;t.c&quot;
        .text
.globl bar
        .type   bar, @function
bar:
        pushl   %ebp
        movl    %esp, %ebp
        movl    8(%ebp), %eax
        incl    %eax
        popl    %ebp
        ret
        .size   bar, .-bar
.globl foo
        .type   foo, @function
foo:
        pushl   %ebp
        movl    %esp, %ebp
        subl    $4, %esp
        movl    8(%ebp), %eax
        movl    %eax, (%esp)
        call    bar
        addl    $2, %eax
        leave
        ret
        .size   foo, .-foo
</pre>
<p>Comparons maintenant celui-ci &#224; l'assembleur g&#233;n&#233;r&#233; par le compilateur
ocaml&#160;: <strong>Assembleur OCaml</strong></p>
<pre>
        .text
        .align  16
     .globl     camlT__bar_58
        .type   camlT__bar_58,@function
camlT__bar_58:
.L100:
        addl    $2, %eax
        ret
        .text
        .align  16
     .globl     camlT__foo_60
        .type   camlT__foo_60,@function
camlT__foo_60:
.L101:
        call    camlT__bar_58
.L102:
        addl    $4, %eax
        ret
</pre>
<p>Dans les deux cas, nous retrouvons bien nos deux fonctions foo et bar avec
les instructions&#160;: .globl, .type mais il manque .size &#224; la fin des
fonctions caml! Ceci est la source du probl&#232;me pour valgrind, car apr&#232;s analyse
de son code source, il ignore les fonctions de taille nulle ...</p>
<h3>Solution</h3>
<p>Il suffit d'appliquer ce minuscule patch sur le compilateur ocaml pour
g&#233;n&#233;rer des ex&#233;cutables ELF valides aux yeux de valgrind&#160;: <a href="/public/patch-alter_elf_for_valgrind-cvs-080620.patch">patch-alter_elf_for_valgrind-cvs-080620</a><br />

(Patch r&#233;alis&#233; sur la version CVS, qui correspond &#224; la futur version 3.11)</p>
<p>Nous obtenons alors le callgraph suivant sur le premier exemple&#160;:
<img src="/public/t-caml-valid-callgraph.png" alt="t-caml-valid-callgraph.png" style="display:block; margin:0 auto;" /></p>
<h3>Exemple sur un vrai projet utilisant ocamlnet&#160;:</h3>
<p><a href="/public/callgraph-with-patch2.png"><img src="/public/./.callgraph-with-patch2_m.jpg" alt="callgraph-with-patch2.png" style="display:block; margin:0 auto;" /></a></p>
