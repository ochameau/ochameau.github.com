---
layout: post
title: "Ocaml native code debugging"
date: 2009-11-02
comments: true
categories: [ocaml]
---
<p>Note: english translation of my <a href="/post/2008/11/09/Ocaml-native-code-debugging">previous post</a></p>
<p><img src="/public/./.t-caml-valid-callgraph_s.jpg" alt="t-caml-valid-callgraph.png" style="float:right; margin: 0 0 1em 1em;" title="t-caml-valid-callgraph.png, juin 2008" /></p>
<p>Now that <a href="http://caml.inria.fr/mantis/bug_view_page.php?bug_id=4642" hreflang="en">Improve gnu ELF</a> bug is commited in ocaml 3.11+, KCachegrind
can generate beautifull callgraphs.</p>
<p>This patch consist in adding .size instructions (in ELF assembly code) in
order to allow valgrind to interpret all symbols (camlT_entry, camlT_foo,
camlT_bar, ..) and it can so display symbols names instead of their hexadecimal
numbers!!!</p>
<h2>ELF instructions for debug</h2>
<p>Now, we may want these tools to be able to display file name and line number
for all functions.(File name is present in symbols name but it doesn't allow
full usage of these tools)</p>
<p>Let's see how's gcc working&#160;:</p>
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
  $ gcc -O0 -g -S t.c
</pre>
<pre>
  .globl bar
        .type   bar, @function
  bar:
  .LFB2:
        .file 1 &quot;t.c&quot;
        .loc 1 1 0
        pushq   %rbp
  .LCFI0:
        movq    %rsp, %rbp
  .LCFI1:
        movl    %edi, -4(%rbp)
        .loc 1 2 0
        movl    -4(%rbp), %eax
        incl    %eax
        .loc 1 3 0
        leave
        ret
  .LFE2:
        .size   bar, .-bar
  .globl foo
        .type   foo, @function
</pre>
<p>Usefull instructions are .file and .loc&#160;:</p>
<ul>
<li>.file define a file path and bind it to an id<br /></li>
</ul>
<p>-&gt; .file $file_id&quot;$file_path&quot;</p>
<ul>
<li>.loc define a file, a line and column number to the next
instructions<br /></li>
</ul>
<p>-&gt; .loc $file_id$ $line$ $column$</p>
<h2>Suggested solution</h2>
<p>The compiler module which emits these instructions is&#160;: <a href="http://camlcvs.inria.fr/cgi-bin/cvsweb/ocaml/asmcomp/i386/emit.mlp?rev=1.41.2.2;only_with_tag=release311" hreflang="en">asmcomp/i386/emit.mlp</a><br />
And especially this &quot;fundecl&quot; function&#160;:</p>
<pre>
  let fundecl fundecl =
    function_name := fundecl.fun_name;
    fastcode_flag := fundecl.fun_fast;
    (* ... *)
    `   .globl  {emit_symbol fundecl.fun_name}
`;
    `{emit_symbol fundecl.fun_name}:
`;
    if !Clflags.gprofile then emit_profile();
    let n = frame_size() - 4 in
    if n &gt; 0 then
      ` subl    ${emit_int n}, %esp
`;
    `{emit_label !tailrec_entry_point}:
`;
    emit_all true fundecl.fun_body;
    List.iter emit_call_gc !call_gc_sites;
    emit_call_bound_errors ();
    List.iter emit_float_constant !float_constants;
    match Config.system with
      &quot;linux_elf&quot; | &quot;bsd_elf&quot; | &quot;gnu&quot; -&gt;
        `       .type   {emit_symbol fundecl.fun_name},@function
`;
        `       .size   {emit_symbol fundecl.fun_name},.-{emit_symbol fundecl.fun_name}
`
    | _ -&gt; ()
</pre>
<p>Except that the only data we have is the fundecl variable&#160;:</p>
<pre>
  type fundecl = 
  { fun_name: string;
    fun_body: instruction;
    fun_fast: bool } 
  type instruction =
  { mutable desc: instruction_desc;
    mutable next: instruction;
    arg: Reg.t array;
    res: Reg.t array;
    dbg: Debuginfo.t;
    live: Reg.Set.t }
</pre>
<p>There is a dbg attribute on instructions but it's rarely set. (One
compilation with -dlinear option allow to see this fact)</p>
<p>I've decided to add a <em>fun_dbg&#160;: Debuginfo.t</em> attribute on
&quot;fundecl&quot; type and fill it in all compilation steps. It may more clever to work
on this (often-empty) &quot;dbg&quot; attribute&#160;? (it would allow to add position
information on all instructions, it can be usefull for valgrind and gdb) This
patch is not optimised because it repeats .file instruction for each .loc and
so it repeats it on each function header.</p>
<p>-&gt; <a href="/public/patch-file-and-loc-v1-cvs-2008-11-11.patch">Patch
based on release311 branch, but works on current trunk</a><br />
<br /></p>
<p>Now let's see what brings this patch</p>
<h2>gdb results</h2>
<pre>
  $ ocamlopt -g -inline 0 t.ml
  $ gdb a.out
  (gdb) break t.ml:6
  Breakpoint 1 at 0x8049940: file t.ml, line 6.
  (gdb) run
  Starting program: /home/alex/callgraph/a.out 
  
  Breakpoint 1, camlT__foo_60 () at t.ml:6
  6       let foo i  =
  Current language:  auto; currently asm

  (gdb) backtrace
  #0  camlT__foo_60 () at t.ml:7
  #1  0x0804c570 in camlT__entry () at t.ml:12
  #2  0x0806e4b7 in caml_start_program ()
  
  (gdb) step 1
  camlT__bar_58 () at t.ml:2
  2       let bar i =
  
  (gdb) list
  1
  2       let bar i =
  3               1+i
  4       ;;
  5
  6       let foo i  =
  7               2+(bar i )
  8       ;;
  9
  10      let () =
</pre>
<h2>gprof results</h2>
<pre>
  $ ocamlopt -g -p -inline 0 t.ml
  $ ./a.out
  $ gprof -A
  *** File /home/alex/callgraph/t.ml:
                  
           1 -&gt; let bar i =
                        Thread.delay 3.0;
                        1+i
                ;;
                
           1 -&gt; let foo i  =
                        2+(bar i )
                ;;
                
                let () =
           1 -&gt;         let closure() = 3 in
                        print_int ( foo (closure()) )
                ;;
                
  Top 10 Lines:

     Line      Count
        2          1
        7          1
       12          1

  Execution Summary:

        3   Executable lines in this file
        3   Lines executed
   100.00   Percent of the file executed

        3   Total number of line executions
     1.00   Average executions per line
</pre>
<h2>valgrind/kcachegrind results</h2>
<pre>
  $ ocamlopt -g -inline 0 t.ml
  $ valgrind --tool=callgrind ./a.out
  $ callgrind_annotate callgrind.out.2152 t.ml
  --------------------------------------------------------------------------------
  -- User-annotated source: t.ml
  --------------------------------------------------------------------------------
  .  
  8  let bar i =
  77,715  =&gt; thread.ml:camlThread__delay_75 (1x)
  .      Thread.delay 3.0;
  .      1+i
  .  ;;
  .  
  3  let foo i  = 
  77,723  =&gt; t.ml:camlT__bar_58 (1x)
  .      2+(bar i )
  .  ;;
  .  
  .  let () =
  13          let closure() = 3 in
  1,692  =&gt; pervasives.ml:camlPervasives__output_string_215 (1x)
  2,312  =&gt; pervasives.ml:camlPervasives__string_of_int_154 (1x)
  77,726  =&gt; t.ml:camlT__foo_60 (1x)
  .      print_int ( foo (closure()) )
  .  ;;
  .  
  $ kcachegrind callgrind.out.2152
</pre>
<p><img src="/public/./.kcachegrind-file-and-line_m.jpg" alt="kcachegrind-file-and-line.png" style="display:block; margin:0 auto;" title="kcachegrind-file-and-line.png, nov 2008" /></p>
<p><br />
<br /></p>
<h2>And next&#160;?</h2>
<p>We first need to wait approval for this new feature by ocaml community, I've
submitted it <a href="http://caml.inria.fr/mantis/view.php?id=4888" hreflang="en">there</a>.<br />
I someone from INRIA read this ... Don't hesitate to contact me, I'm open to
work on a different approach.<br />
After that, we may hope a lot of new features, like&#160;:</p>
<ul>
<li>breakpoints on any caml line (not only function call)</li>
<li>gdb plugin allowing to read value in a breakpoint!</li>
</ul>