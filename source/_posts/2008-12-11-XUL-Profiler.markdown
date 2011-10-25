---
layout: post
title: "XUL Profiler"
date: 2008-12-11 18:51:59
comments: true
categories: [mozilla]
---
<p><img src="/public/addon_thumb.png" alt="addon_thumb.png" style="margin: 0 0 1em 1em; float: right;" title="addon_thumb.png, dec 2008" /> XUL
Profiler&#160;? Qu'est-ce donc&#160;? Et bien c'est l'extension Firefox que
j'ai pu d&#233;velopper chez <a href="http://www.yoono.com">Yoono</a>. Elle a pour
but de donner des pistes aux d&#233;veloppeurs XUL (mais aussi aux d&#233;veloppeurs Web)
pour optimiser les performances de leurs applications.</p>
<p>Pour l'instant, cette extension permet de r&#233;colter deux
informations&#160;:</p>
<ul>
<li>un callgraph Javascript&#160;: Chaque appel de fonction est consign&#233; dans
un arbre et class&#233; par son temps d'ex&#233;cution. On peut ainsi rapidement rep&#233;rer
les fonctions qui ralentissent le navigateur.</li>
<li>une vid&#233;o des rafraichissements de Firefox&#160;: Toutes les op&#233;rations de
mise &#224; jour graphique de firefox sont enregistr&#233;es dans une vid&#233;o qui nous
permet d'apprendre &#224; optimiser notre Javascript ainsi que les CSS afin de
soulager Firefox dans son travail de layout.</li>
</ul>
<p>L'extension est disponible sur <a href="https://addons.mozilla.org/fr/firefox/addon/9954">Mozilla addons</a></p>
<p>Voici quelques r&#233;sultats sur des exemples simples.</p>
<h2>Callgraph Javascript</h2>
<p>(<a href="/public/test-xulprofiler-callgraph.html">Fichier html de
test</a>)</p>
<pre>
function fun_root() {
  fun_A();
  fun_B();
  fun_C();
}
function fun_A() {
  dump(&quot;fun A&quot;);
}
function fun_B() {
  dump(&quot;fun B&quot;);
  var s=&quot;&quot;;
  fun_D();
  for(var i=0; i&lt;1000; i++) {
    s+=&quot;CPU INTENSIVE FUNCTION&quot;;
    fun_D();
  }
  fun_D();
}
function fun_C() {
  dump(&quot;fun C&quot;);
}
function fun_D() {
  dump(&quot;fun D&quot;);
}
</pre>
<p><img src="/public/test-xulprofiler-callgraph.png" alt="test-xulprofiler-callgraph.png" style="margin: 0 auto; display: block;" title="test-xulprofiler-callgraph.png, dec 2008" /></p>
<p>On voit ici la hi&#233;rarchie des appels entre les fonction gr&#226;ce &#224; la
pr&#233;sentation sous forme d'arbre, et l'on peut conclure que la majorit&#233; du temps
de calcul de ce script est effectu&#233; dans la fonction &quot;fun_B&quot;.</p>
<h2>Paint events</h2>
<p>(<a href="/public/test-xulprofiler-paint.html">Fichier html de test</a>)</p>
<pre>
function delayEachInserts() {
  for(var i=0;i&lt;20;i++) {
    window.setTimeout(insertItem,100*i,i);
  }
}
function insertItem(i) {
  var container=document.getElementById(&quot;container&quot;);
  var item=document.createElement(&quot;div&quot;);
  item.setAttribute(&quot;class&quot;,&quot;item&quot;);
  item.textContent=&quot;Item &quot;+i;
  container.appendChild(item);
}
window.addEventListener(&quot;load&quot;,delayEachInserts,false);
</pre>
<p>&#160; <strong>=&gt;</strong> <a style="font-weight: bold;" href="/public/test-xulprofiler-paint-result.html">R&#233;sutat</a></p>
<p>Cet exemple montre que lorsqu'on ajoute un &#233;lement DOM, Firefox est oblig&#233;
de rafraichir son conteneur &#224; chaque ajout.</p>