"""Builds the students' phone playground from template.html and petclinic.json.

Outputs: cut-the-monolith.html (body only, for the Artifact wrapper), site/index.html (the playground) and
site/board.html (the class board to project) for the GitHub Pages repository sambuaneesh/cut-the-monolith.
board.json holds the board Worker's URL and the class room name.

petclinic.json comes from the tse-2026-paper deck's data (ext/data/systems.js): the benchmark's class inventory,
weighted dependency graph, reference decomposition, table and use-case labels, and one agentic-workflow run.
The page's metrics follow that deck's ext/metrics.js, which is checked against recorded run values.
"""
from pathlib import Path

here = Path(__file__).parent
import json
cfg = json.loads((here / "board.json").read_text()) if (here / "board.json").exists() else {"url": "", "room": "class"}
body = ((here / "template.html").read_text().replace("__DATA__", (here / "petclinic.json").read_text())
        .replace("__BOARD__", cfg["url"]).replace("__ROOM__", cfg["room"]))
(here / "cut-the-monolith.html").write_text(body)
head = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
        'body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style>\n')
# the template opens with <title>, meta, links and <style>: they belong in <head>; the rest is the body
split = body.index("</style>") + len("</style>")
page = head + body[:split] + "\n</head>\n<body>\n" + body[split:] + "\n</body>\n</html>\n"
(here / "site").mkdir(exist_ok=True)
(here / "site" / "index.html").write_text(page)
board = (here / "board-template.html").read_text().replace("__BOARD__", cfg["url"]).replace("__ROOM__", cfg["room"])
(here / "site" / "board.html").write_text(board)
print("wrote", here / "cut-the-monolith.html", ",", here / "site" / "index.html", "and", here / "site" / "board.html")
