#!/usr/bin/env python3
"""Cambia el dominio en las etiquetas para compartir (og:image, og:url, canonical),
robots.txt y sitemap.xml.  Uso:  python3 tools/cambiar_dominio.py https://www.lacapitaldelcielo.com"""
import sys, glob, re
nuevo = sys.argv[1].rstrip('/') + '/'
viejos = ['https://la-capital-del-cielo.vercel.app/', 'https://danielsalasarcay-boop.github.io/la-capital-del-cielo/']
for f in glob.glob('*.html') + ['robots.txt', 'sitemap.xml']:
    s = open(f).read(); s2 = s
    for v in viejos: s2 = s2.replace(v, nuevo)
    if s2 != s: open(f, 'w').write(s2); print('actualizado', f)
