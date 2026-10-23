#!/bin/sh
# Ставит метку версии: ?v=… на свои скрипты и стили (телефон не возьмёт старые из кэша) и подпись на титуле.
V=$(date +%y%m%d%H%M)
sed -i -E "s#(src=\"(js/[^\"?]+|three.min.js)|href=\"css/[^\"?]+)(\?v=[0-9]+)?\"#\1?v=$V\"#g; s#<p class=\"small\" id=\"ver\">[^<]*</p>#<p class=\"small\" id=\"ver\">версия $V</p>#" index.html
echo "$V"
