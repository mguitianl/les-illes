#!/bin/bash
# Genera los clips PROVISIONALES con la voz catalana de macOS (Montse).
# No es la locución final: antes de probar con Nicole se decidirá la voz definitiva.
set -e
cd "$(dirname "$0")/../app/public/audio"
gen() { say -v Montse -r "${3:-165}" -o "/tmp/nicole_$1.aiff" "$2"; afconvert -f m4af -d aac -b 64000 "/tmp/nicole_$1.aiff" "$1.m4a"; rm "/tmp/nicole_$1.aiff"; }
gen port "Preparem el berenar? Toca la cistella."
gen continuem "Continuem el berenar? Toca la cistella."
gen final "El berenar està a punt. Fins aviat!"
gen recull "Posa tres pomes a la cistella."
gen afegeix "En tenim tres. N'hem trobat una més. Posa-la a la cistella."
gen total "Quantes pomes tenim ara?"
gen dona "Dona dues pomes al mariner."
gen queden "Quantes pomes queden a la cistella?"
gen banderi "El berenar està a punt. Tria una bandera per al vaixell."
gen demo-cistella "Mira. Agafa una poma i porta-la a la cistella. Si vols, la pots tornar."
gen demo-safata "Mira. Agafa una poma i porta-la a la safata. Si vols, la pots tornar."
gen ok-recull "Has posat tres pomes a la cistella."
gen ok-afegeix "Has posat la poma a la cistella."
gen ok-total "Sí. Tres i una, quatre. Ara en tenim quatre."
gen ok-dona "N'has donat dues al mariner."
gen ok-queden "Sí. A la cistella en queden dues."
gen ok-banderi "Que bonica! La posem al vaixell."
gen a-port "Toca la cistella."
gen a-recull "Volem tres pomes. Mira la cistella."
gen a-afegeix "Posa la poma a la cistella."
gen a-dona "Volem donar dues pomes. Mira la safata."
gen a-mira "Mira la cistella."
gen a-banderi "Toca una bandera."
gen comptem "Comptem-les."
gen n1 "Una." 140; gen n2 "Dues." 140; gen n3 "Tres." 140; gen n4 "Quatre." 140; gen n5 "Cinc." 140
say -v Montse -o /tmp/nicole_s.aiff "[[slnc 150]]"; afconvert -f m4af -d aac /tmp/nicole_s.aiff silenci.m4a; rm /tmp/nicole_s.aiff
