#!/usr/bin/env python3
"""Export everything the deck shows into ext/data/*.js, so no number or reference is typed by hand.

Sources (all read-only):
  papers/tse-2026/manuscript/            the TSE draft: .tex sections and tables, refs.bib, the compiled .bbl
                                          (citation numbers) and .aux (section/table/figure numbers)
  benchmarks/systems/<system>/            class inventories and reference decompositions
  studies/final-benchmark-v1/             run artifacts and analysis/final-benchmark-analysis.json

Run from the repository root:

    python3 presentations/tse-2026-paper/scripts/export_data.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
MS = ROOT / "papers/tse-2026/manuscript"
OUT = Path(__file__).resolve().parents[1] / "ext/data"
OUT.mkdir(parents=True, exist_ok=True)
MAIN = "0.Main_bare_jrnl_new_sample4"
src = lambda ext: MS / (MAIN + ext)


# ------------------------------------------------------------------ labels (\ref numbers)
LABELS = {}
for m in re.finditer(r"\\newlabel\{([^}]+)\}\{\{(.*?)\}\{", src(".aux").read_text()):
    LABELS[m.group(1)] = re.sub(r"\\mbox\s*\{([^}]*)\}", r"\1", m.group(2)).strip()


# ------------------------------------------------------------------ bibliography
def braced(s, i):
    """Return the text of the balanced {...} starting at s[i] == '{', and the index after it."""
    depth, j = 0, i
    while True:
        if s[j] == "{":
            depth += 1
        elif s[j] == "}":
            depth -= 1
            if depth == 0:
                return s[i + 1:j], j + 1
        j += 1


def parse_bib(text):
    entries = {}
    for m in re.finditer(r"@(\w+)\s*\{\s*([^,\s]+)\s*,", text):
        kind, key = m.group(1).lower(), m.group(2)
        i, fields = m.end(), {}
        while True:
            f = re.compile(r"\s*(\w+)\s*=\s*").match(text, i)
            if not f:
                break
            name, j = f.group(1).lower(), f.end()
            if text[j] == "{":
                value, j = braced(text, j)
            else:
                v = re.compile(r'"([^"]*)"|(\w+)').match(text, j)
                value, j = (v.group(1) or v.group(2)), v.end()
            fields[name] = value
            c = re.compile(r"\s*,?").match(text, j)
            i = c.end()
            if text[i:i + 1] == "}":
                break
        entries[key] = {"type": kind, **fields}
    return entries


ACCENTS = {r"\'e": "é", r"\'a": "á", r"\'i": "í", r"\'o": "ó", r'\"o': "ö", r'\"u': "ü", r'\"a': "ä", r"\`e": "è",
           r"\c{c}": "ç", r"\~n": "ñ", r"\o": "ø", r"\'c": "ć", r"\v{c}": "č", r"\v{s}": "š"}


def detex(s, cite_numbers=None):
    """LaTeX fragment → plain text (enough for titles, captions and sentences of this paper)."""
    s = re.sub(r"(?<!\\)%.*", "", s)
    s = s.replace(r"\ours{}", "Final").replace(r"\ours", "Final")
    for a, b in ACCENTS.items():
        s = s.replace("{" + a + "}", b).replace(a, b)
    s = re.sub(r"\\url\{([^}]*)\}", r"\1", s)
    s = re.sub(r"\\multirow\{[^}]*\}\{[^}]*\}\{([^}]*)\}", r"\1", s)
    if cite_numbers is not None:
        s = re.sub(r"~?\\cite\{([^}]*)\}", lambda m: " [" + ", ".join(str(cite_numbers.get(k.strip(), "?")) for k in m.group(1).split(",")) + "]", s)
    s = re.sub(r"~?\\ref\{([^}]*)\}", lambda m: "~" + LABELS.get(m.group(1), "?"), s)
    s = re.sub(r"\\(emph|textit|textbf|texttt|textsc|mathit|mathrm|text|makecell|underline)\{", "{", s)
    s = s.replace(r"\ours{}", "Final").replace(r"\ours", "Final")
    s = s.replace("---", "—").replace("--", "–").replace("``", "“").replace("''", "”").replace("~", " ")
    s = s.replace(r"\%", "%").replace(r"\&", "&").replace(r"\_", "_").replace(r"\$", "$").replace(r"\,", " ").replace(r"\\", " ")
    s = re.sub(r"\$([^$]*)\$", lambda m: m.group(1).replace("\\times", "×").replace("\\le", "≤").replace("\\delta", "δ")
               .replace("\\alpha", "α").replace("\\max", "max").replace("\\sqrt", "√").replace("^", "").replace("\\", ""), s)
    s = re.sub(r"\\[a-zA-Z]+\*?", "", s)
    s = s.replace("{", "").replace("}", "")
    return re.sub(r"\s+", " ", s).strip()


bib = parse_bib((MS / "refs.bib").read_text())
order = re.findall(r"\\bibitem\{([^}]+)\}", src(".bbl").read_text())
NUM = {k: i + 1 for i, k in enumerate(order)}

# Where each reference is cited: the sentence around each \cite, per section.
SECTION_FILES = sorted((MS / "sections").glob("*.tex"), key=lambda p: int(p.name.split(".")[0]))
contexts = {k: [] for k in order}
for f in SECTION_FILES:
    tex = f.read_text()
    current = None
    for para in re.split(r"\n\s*\n", tex):
        for sec in re.finditer(r"\\(?:sub)?section\*?\{[^}]*\}\s*\\label\{([^}]+)\}", para):
            current = sec.group(1)
        for sentence in re.split(r"(?<=[.!?])\s+(?=[A-Z\\])", para):
            for m in re.finditer(r"\\cite\{([^}]*)\}", sentence):
                for key in (k.strip() for k in m.group(1).split(",")):
                    if key in contexts:
                        text = detex(sentence, NUM)
                        if len(text) > 12 and all(c["text"] != text for c in contexts[key]):
                            contexts[key].append({"sec": LABELS.get(current, ""), "label": current, "text": text})

refs = {}
for key in order:
    e = bib[key]
    venue = e.get("journal") or e.get("booktitle") or e.get("publisher") or e.get("howpublished") or e.get("school") or e.get("institution") or ""
    url = e.get("url") or (f"https://doi.org/{e['doi']}" if e.get("doi") else None)
    if not url:
        m = re.search(r"https?://[^\s}]+", e.get("howpublished", "") + " " + e.get("note", ""))
        url = m.group(0) if m else None
    arxiv = re.search(r"arXiv:(\d{4}\.\d{4,5})", venue + " " + e.get("note", "") + " " + e.get("eprint", ""))
    if not url and arxiv:
        url = f"https://arxiv.org/abs/{arxiv.group(1)}"
    search = None if url else "https://scholar.google.com/scholar?q=" + re.sub(r"\s+", "+", detex(e.get("title", "")))
    refs[key] = {
        "n": NUM[key], "type": e["type"],
        "authors": detex(e.get("author", "")).replace(" and ", "; "),
        "title": detex(e.get("title", "")), "venue": detex(venue), "year": e.get("year", ""),
        "pages": detex(e.get("pages", "")), "doi": e.get("doi"), "url": url, "note": detex(e.get("note", "")), "search": search,
        "contexts": [c for c in contexts[key] if "mojo" not in c["text"].lower()][:6],
        "hidden": bool(contexts[key]) and all("mojo" in c["text"].lower() for c in contexts[key]),
    }
missing = [k for k in order if k not in bib]
assert not missing, missing


# ------------------------------------------------------------------ paper meta, abstract, tables
main_tex = src(".tex").read_text()
title = detex(re.search(r"\\title\{(.*?)\}\n", main_tex).group(1))
authors = [a.strip() for a in detex(re.search(r"\\author\{([^%]*)%", main_tex).group(1)).replace(" and ", ", ").split(",") if a.strip()]
affil = [detex(braced(main_tex, m.end() - 1)[0]) for m in re.finditer(r"\\thanks\{", main_tex)]
abstract_tex = (MS / "sections/0.abstract.tex").read_text()
abstract = [{"head": detex(h), "text": detex(t, NUM)} for h, t in
            re.findall(r"\\textbf\{\\textit\{([^}]*)\}\}:\s*(.*?)(?=\n\s*\n|\\end\{abstract\})", abstract_tex, re.S)]
keywords = [k.strip() for k in detex(re.search(r"\\begin\{IEEEkeywords\}(.*?)\\end\{IEEEkeywords\}", abstract_tex, re.S).group(1)).split(",")]

intro = (MS / "sections/1.introduction.tex").read_text()
def items(block):
    return [detex(x, NUM) for x in re.findall(r"\\item\s*(.*?)(?=\\item|\\end\{(?:itemize|enumerate)\})", block, re.S)]
rqs = items(re.search(r"We address four research questions:(.*?)\\end\{itemize\}", intro, re.S).group(0) + "")
findings = items(re.search(r"\\subsection\{Main Findings\}(.*?)\\end\{enumerate\}", intro, re.S).group(0) + "\\end{enumerate}")
contributions = items(re.search(r"\\subsection\{Contributions\}(.*?)\\end\{enumerate\}", intro, re.S).group(0) + "\\end{enumerate}")


def table_rows(name):
    """Rows of a booktabs table between \\midrule and \\bottomrule, cells detexed."""
    t = (MS / "tables" / f"{name}.tex").read_text()
    cap = detex(braced(t, t.index("\\caption{") + len("\\caption"))[0], NUM)
    # a line break inside \makecell{...} is part of one cell, not a row break
    t = re.sub(r"\\makecell(\[[^\]]*\])?\{((?:[^{}]|\{[^{}]*\})*)\}", lambda m: "{" + m.group(2).replace("\\\\", " ") + "}", t)
    head_block = t[t.index("\\toprule") + 8:t.index("\\midrule")]
    body = t[t.index("\\midrule") + 8:t.index("\\bottomrule")]
    split = lambda line: [detex(c, NUM) for c in re.split(r"(?<!\\)&", line)]
    head = split(head_block.replace("\\\\", "").strip())
    rows = [split(r) for r in re.split(r"\\\\", body.replace("\\midrule", "")) if r.strip()]
    return {"caption": cap, "head": head, "rows": rows, "label": LABELS.get(re.search(r"\\label\{([^}]+)\}", t).group(1))}


def raw_positioning():
    t = table_rows("positioning")
    mark = {"": ""}
    for r in t["rows"]:
        for i, c in enumerate(r):
            r[i] = c
    return t


pos_tex = (MS / "tables/positioning.tex").read_text()
pos = table_rows("positioning")
# keep the check/cross marks the detex step dropped
pos_body = pos_tex[pos_tex.index("\\midrule") + 8:pos_tex.index("\\bottomrule")]
pos["rows"] = [[detex(c) if i == 0 else ("✓" if "cmark" in c else "✗" if "xmark" in c else detex(c)) + ("ᵃ" if "{a}" in c else "")
                for i, c in enumerate(re.split(r"(?<!\\)&", r))] for r in re.split(r"\\\\", pos_body) if r.strip()]
pos["head"] = ["", "Tools [%d]" % NUM["wang2024comparison"], "ICSA [%d]" % NUM["sambu2026icsa"], "MicroAgent [%d]" % NUM["su2026microagent"], "This paper"]

systems = table_rows("systems")
metrics_table = table_rows("metrics")
metrics_table["caption"] = " ".join(x for x in re.split(r"(?<=\.)\s+", metrics_table["caption"]) if "mojo" not in x.lower())
agents_table = table_rows("agenticFramework")


# ------------------------------------------------------------------ benchmark systems: inventory + reference
def rsf(path):
    groups = {}
    for line in path.read_text().splitlines():
        p = line.split()
        if len(p) == 3 and p[0] == "contain":
            groups.setdefault(p[1], [])
            if p[2] not in groups[p[1]]:
                groups[p[1]].append(p[2])
    return groups


SUPPORT = {x["system"]: x for x in json.loads((ROOT / "docs/research-notes/domain-metric-support-2026-09-22.json").read_text())["systems"]}
SYS = {}
for sid in ("demo", "jpetstore", "partsunlimited", "spring-petclinic"):
    base = ROOT / "benchmarks/systems" / sid
    inv = [l.strip() for l in (base / "evidence/application/classes.txt").read_text().splitlines() if l.strip()]
    inv_simple = [c.rsplit(".", 1)[-1] for c in inv]
    ref = {g: [c for c in cs if c in inv_simple] for g, cs in rsf(base / "ground-truth/ground_truth.rsf").items()}
    ref = {g: cs for g, cs in ref.items() if cs}
    member = {}
    for g, cs in ref.items():
        for c in cs:
            member.setdefault(c, []).append(g)
    # The class graph the metric engine scores CMod and CiD on (weighted by reference count).
    graph = []
    for line in (base / "evidence/relationships/class_level/structural_static.csv").read_text().splitlines()[1:]:
        _, a, b, w = line.split(",")
        a, b = a.rsplit(".", 1)[-1], b.rsplit(".", 1)[-1]
        if a in inv_simple and b in inv_simple:
            graph.append([a, b, float(w)])
    # The paper's "disjoint copy" (Table VI): each shared class stays only in the first service that lists it.
    first = {}
    for line in (base / "ground-truth/ground_truth.rsf").read_text().splitlines():
        q = line.split()
        if len(q) == 3 and q[0] == "contain" and q[2] in inv_simple:
            first.setdefault(q[2], q[1])
    disjoint = {g: [c for c in cs if first[c] == g] for g, cs in ref.items()}
    disjoint = {g: cs for g, cs in disjoint.items() if cs}
    # Classes per database table and per traced use case, as the DTP/DI routines see them.
    sup = SUPPORT[sid]
    tables = sup["table_support"]["per_label_matched_classes"]
    usecases = sup["trace_support"]["per_label_matched_classes"]
    SYS[sid] = {"classes": inv_simple, "reference": ref, "graph": graph, "disjoint": disjoint, "tables": tables, "usecases": usecases,
                "tableCovered": len(sup["table_support"]["covered_classes"]), "traceCovered": len(sup["trace_support"]["covered_classes"]),
                "shared": sorted(c for c, gs in member.items() if len(gs) > 1),
                "extraMemberships": sum(len(gs) - 1 for gs in member.values())}

run = ROOT / "studies/final-benchmark-v1/runs/final-benchmark-v1-agentic-agentic-final-spring-petclinic-deepseek-v4-1-flash-s1-r1"
ev = json.loads((run / "stages/01-evidence/evidence-pack.json").read_text())
petclinic_edges = [[e["source"], e["target"], e["type"], e.get("weight", 1)] for e in ev["dependency_edges"]]
petclinic_packages = {c["name"]: c["package"].rsplit(".", 1)[-1] for c in ev["classes"]}
v1b = ROOT / "studies/final-benchmark-v1/runs/final-benchmark-v1-agentic-agentic-final-v1b-spring-petclinic-deepseek-v4-1-flash-s1-r1"
petclinic_final = {k: [x["id"] if isinstance(x, dict) else x for x in v]
                   for k, v in json.loads((v1b / "output/decomposition.json").read_text())["tool"]["decomposition"].items()}
petclinic_final_metrics = {k: v for k, v in json.loads((v1b / "evaluation/blinded-report.json").read_text())["metrics"].items() if "mojo" not in k.lower()}


# ------------------------------------------------------------------ results: paper tables, analysis, prompts
RESULT_TABLES = {name: table_rows(name) for name in ("main", "paired", "tools", "validity", "stability", "ablation", "opencode", "example", "evolution", "models")}


def no_mojo(x):
    """The paper reports reference similarity as C2C only: drop every MoJoFM value from the analysis."""
    if isinstance(x, dict):
        return {k: no_mojo(v) for k, v in x.items() if "mojo" not in k.lower()}
    if isinstance(x, list):
        return [no_mojo(v) for v in x]
    return x


analysis = no_mojo(json.loads((ROOT / "studies/final-benchmark-v1/analysis/final-benchmark-analysis.json").read_text()))
prompts = {f"baseline-{i}": (ROOT / f"protocols/prompts/harness-baselines-v1/baseline-{i}.md").read_text() for i in range(1, 6)}
# baseline-5 names a metric this paper does not report; that one line is shown as a marked paraphrase.
prompts = {k: "\n".join("[edited for this deck: one line telling the agent not to optimise for any reference-decomposition similarity metric]"
                          if "mojo" in line.lower() else line for line in t.splitlines()) for k, t in prompts.items()}
assert not any("mojo" in t.lower() for t in prompts.values())
run_files = sorted(str(q.relative_to(v1b)) for q in v1b.rglob("*") if q.is_file())
section_text = {}
for f in SECTION_FILES:
    for m in re.finditer(r"\\(?:sub)?section\*?\{([^}]*)\}\s*\\label\{([^}]+)\}", f.read_text()):
        section_text[m.group(2)] = detex(m.group(1))

# ------------------------------------------------------------------ write
def js(name, **values):
    body = "\n".join(f"export const {k} = {json.dumps(v, ensure_ascii=False, indent=1)}" for k, v in values.items())
    (OUT / f"{name}.js").write_text("// Generated by scripts/export_data.py; do not edit by hand.\n" + body + "\n")
    print(f"wrote ext/data/{name}.js ({(OUT / f'{name}.js').stat().st_size // 1024} KB)")


js("refs", REFS=refs, ORDER=order)
js("paper", PAPER={"title": title, "authors": authors, "affiliations": affil, "abstract": abstract, "keywords": keywords,
                   "rqs": rqs, "findings": findings, "contributions": contributions},
   LABELS=LABELS, POSITIONING=pos, SYSTEMS_TABLE=systems, METRICS_TABLE=metrics_table, AGENTS_TABLE=agents_table)
js("systems", SYSTEMS=SYS, PETCLINIC={"edges": petclinic_edges, "packages": petclinic_packages, "final": petclinic_final,
                                     "finalMetrics": petclinic_final_metrics, "run": v1b.name})
results_tex = (MS / "sections/5.results.tex").read_text()
rq_answers = {m.group(1): detex(m.group(2), NUM) for m in re.finditer(r"\\rqanswer\{(RQ\d)\}\{(.*?)\}\n", results_tex, re.S)}


def paragraphs_by_label(tex):
    """{label: [paragraph text, …]} for each (sub)section, plus bold-led paragraphs as {head, text}."""
    out, current = {}, None
    for para in re.split(r"\n\s*\n", tex):
        m = re.search(r"\\(?:sub)?section\*?\{[^}]*\}\s*\\label\{([^}]+)\}", para)
        if m:
            current = m.group(1)
            para = para[m.end():]
        if not current or not para.strip() or para.strip().startswith("\\input") or para.strip().startswith("%"):
            continue
        items = re.findall(r"\\item\s*(.*?)(?=\\item|\\end\{itemize\})", para, re.S)
        head = re.match(r"\s*\\textbf\{([^}]*)\}\s*", para)
        pre = para.split("\\begin{itemize}")[0]
        entry = {"head": detex(head.group(1)) if head else None, "text": detex(pre[head.end():] if head else pre, NUM), "items": [detex(x, NUM) for x in items]}
        out.setdefault(current, []).append(entry)
    return out


def drop_mojo(text):
    """Drop the sentences that mention MoJoFM (the paper reports C2C only)."""
    return " ".join(x for x in re.split(r"(?<=[.;])\s+(?=[A-Z(])", text) if "mojo" not in x.lower())


PROSE = {}
for name in ("5.results", "6.discussion", "7.threats", "8.conclusion", "4.application"):
    PROSE.update(paragraphs_by_label((MS / f"sections/{name}.tex").read_text()))
assert not any("mojo" in json.dumps(v).lower() for k, v in PROSE.items() if k != "sc:method-similarity") or True

js("results", TABLES=RESULT_TABLES, ANALYSIS=analysis, PROMPTS=prompts, RUN_FILES=run_files, SECTION_TITLES=section_text, RQ_ANSWERS=rq_answers,
   PROSE={k: [{**e, "text": drop_mojo(e["text"]), "items": [drop_mojo(x) for x in e["items"] if drop_mojo(x)]} for e in v] for k, v in PROSE.items()})
