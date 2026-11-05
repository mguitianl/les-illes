/* Les illes de la Nicole · Ilustración original en SVG.
   Paleta: mar petróleo, salvia, arena, madera y acentos coral. */
export const SPRITE = `
<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0;overflow:hidden;pointer-events:none" aria-hidden="true">
<defs>
  <linearGradient id="g-cel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7DFC9"/><stop offset="1" stop-color="#F1E6CD"/></linearGradient>
  <linearGradient id="g-mar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6FA39E"/><stop offset=".3" stop-color="#3F7C80"/><stop offset="1" stop-color="#235058"/></linearGradient>
  <filter id="f-paper" x="-5%" y="-10%" width="110%" height="130%"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-color="#3A2E1F" flood-opacity=".24"/></filter>
  <clipPath id="c-jersei"><rect x="62" y="138" width="96" height="118" rx="44"/></clipPath>
</defs>

<!-- POMA -->
<symbol id="poma" viewBox="0 0 100 100">
  <path d="M51 30C50 22 52 15 57 9" fill="none" stroke="#5A3A25" stroke-width="5" stroke-linecap="round"/>
  <path d="M55 21C62 8 78 7 87 13C81 27 65 30 55 21Z" fill="#6E8F68"/>
  <path d="M58 20C66 17 74 15 82 14" fill="none" stroke="#4C6B57" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M50 31C41 22 23 21 14 35C4 52 13 79 29 90C37 95 44 92 50 90C56 92 63 95 71 90C87 79 96 52 86 35C77 21 59 22 50 31Z" fill="#C4523C"/>
  <path d="M86 35C96 52 87 79 71 90C63 95 56 92 50 90C69 84 80 60 74 26C79 27 83 30 86 35Z" fill="#A23F2D"/>
  <path d="M25 37C18 43 18 56 22 64C27 58 30 44 33 36C31 34 28 34 25 37Z" fill="#DD8C70" opacity=".55"/>
  <path d="M40 30C45 35 55 35 60 30" fill="none" stroke="#8C3525" stroke-width="3" stroke-linecap="round"/>
</symbol>

<!-- CISTELLA: vista alta para que ninguna manzana quede escondida -->
<symbol id="cistella" viewBox="0 0 400 290">
  <path d="M120 72C130 12 270 12 280 72" fill="none" stroke="#6B4329" stroke-width="15" stroke-linecap="round"/>
  <path d="M120 72C130 12 270 12 280 72" fill="none" stroke="#B4834F" stroke-width="7" stroke-linecap="round" stroke-dasharray="11 6"/>
  <ellipse cx="200" cy="184" rx="191" ry="102" fill="#5A3A25"/>
  <ellipse cx="200" cy="172" rx="191" ry="112" fill="#8A5A3A"/>
  <ellipse cx="200" cy="172" rx="176" ry="99" fill="#F0E4C8"/>
  <path d="M60 110C110 85 290 85 340 110C356 145 340 215 300 240C240 262 150 262 100 240C60 215 44 145 60 110Z" fill="#E8D8B5"/>
  <ellipse cx="200" cy="172" rx="182" ry="105" fill="none" stroke="#A8784A" stroke-width="20"/>
  <ellipse cx="200" cy="172" rx="182" ry="105" fill="none" stroke="#C99A62" stroke-width="20" stroke-dasharray="17 11"/>
  <ellipse cx="200" cy="172" rx="172" ry="95" fill="none" stroke="#6B4329" stroke-width="2.5" opacity=".6"/>
</symbol>

<!-- SAFATA del mariner -->
<symbol id="safata" viewBox="0 0 400 290">
  <rect x="6" y="52" width="388" height="232" rx="64" fill="#53331F"/>
  <rect x="6" y="42" width="388" height="232" rx="64" fill="#9A6A42"/>
  <rect x="24" y="60" width="352" height="196" rx="48" fill="#C4976A"/>
  <path d="M26 118H374M24 176H376" stroke="#A67C52" stroke-width="3"/>
  </symbol>

<!-- ARBRE -->
<symbol id="arbre" viewBox="0 0 480 360">
  <path d="M212 360C222 320 222 290 216 262H268C262 290 264 320 276 360Z" fill="#6B4329"/>
  <path d="M250 360C250 325 252 290 252 262H268C262 290 264 320 276 360Z" fill="#53331F"/>
  <path d="M226 270C205 262 186 262 170 268M260 272C282 264 300 264 316 270" fill="none" stroke="#6B4329" stroke-width="12" stroke-linecap="round"/>
  <path d="M86 214C40 196 30 134 72 104C70 56 126 22 176 40C204 6 278 6 306 38C356 22 410 58 408 106C450 138 440 198 394 214C372 260 306 276 262 260C230 278 150 270 128 244C112 240 96 228 86 214Z" fill="#6F8F71"/>
  <path d="M86 214C40 196 30 134 72 104C66 150 86 190 128 200C176 244 280 250 340 212C372 200 402 180 416 156C430 180 420 204 394 214C372 260 306 276 262 260C230 278 150 270 128 244C112 240 96 228 86 214Z" fill="#5D7E62"/>
  <g fill="#86A383" opacity=".8"><path d="M90 128C100 104 124 100 134 112C124 122 106 132 90 128Z"/><path d="M196 46C214 32 240 32 252 44C236 54 212 56 196 46Z"/><path d="M350 112C366 106 386 116 390 134C372 138 356 128 350 112Z"/><path d="M70 176C80 164 96 164 104 172C96 182 80 186 70 176Z"/></g>
</symbol>

<!-- MATA: donde aparece la manzana encontrada -->
<symbol id="mata" viewBox="0 0 320 240">
  <ellipse cx="160" cy="222" rx="140" ry="16" fill="#8B9A70" opacity=".55"/>
  <path d="M30 216C4 180 26 132 66 134C78 84 150 62 190 94C232 74 286 108 280 156C308 172 306 206 288 218Z" fill="#6F8F71"/>
  <path d="M30 216C20 198 20 180 28 164C60 196 128 214 200 206C240 202 276 188 296 174C304 192 300 210 288 218Z" fill="#5D7E62"/>
</symbol>

<!-- GUINEU exploradora (mira a la derecha) -->
<symbol id="guineu" viewBox="0 0 200 250">
  <path d="M72 226C24 238 -6 190 16 138C24 120 34 112 42 110C38 142 56 172 88 186Z" fill="#B96A3A"/>
  <path d="M36 228C14 214 4 176 16 138C24 120 34 112 42 110C34 150 36 176 58 212C52 222 44 228 36 228Z" fill="#9F5730" opacity=".0"/>
  <path d="M42 110C30 118 20 130 16 138C14 152 22 162 34 160C42 158 44 144 42 110Z" fill="#F3E6CF"/>
  <path d="M66 230C50 176 70 128 104 118C140 128 158 176 142 230Z" fill="#BE6F3D"/>
  <path d="M128 132C150 156 156 200 142 230H112C136 200 136 160 128 132Z" fill="#A65D32"/>
  <path d="M84 152C92 138 118 138 126 152C128 182 118 208 105 214C92 208 82 182 84 152Z" fill="#F3E6CF"/>
  <rect x="82" y="182" width="18" height="50" rx="9" fill="#BE6F3D"/>
  <rect x="110" y="182" width="18" height="50" rx="9" fill="#A65D32"/>
  <path d="M82 232C82 222 100 222 100 232C100 240 82 240 82 232ZM110 232C110 222 128 222 128 232C128 240 110 240 110 232Z" fill="#4A352A"/>
  <path d="M86 138L150 202" stroke="#6B4329" stroke-width="7" stroke-linecap="round"/>
  <rect x="134" y="192" width="38" height="34" rx="9" fill="#8A5A3A"/><path d="M134 204H172V200C172 195 168 192 163 192H143C138 192 134 195 134 200Z" fill="#6B4329"/><circle cx="153" cy="207" r="3.5" fill="#E8D8B5"/>
  <path d="M68 128C90 146 122 146 142 126L146 141C122 162 88 162 66 143Z" fill="#2F6B72"/>
  <path d="M124 148L140 180L120 172L112 152Z" fill="#245860"/>
  <path d="M60 62L52 8C70 16 88 28 98 44Z" fill="#BE6F3D"/><path d="M66 52L62 22C72 28 82 36 88 44Z" fill="#4A352A"/>
  <path d="M154 62L162 8C144 16 126 28 116 44Z" fill="#A65D32"/><path d="M148 52L152 22C142 28 132 36 126 44Z" fill="#4A352A"/>
  <path d="M50 78C50 52 72 38 107 38C142 38 164 52 164 78C164 100 134 126 107 132C80 126 50 100 50 78Z" fill="#C5763F"/>
  <path d="M50 78C60 92 84 92 98 108L107 132C80 126 50 100 50 78ZM164 78C154 92 130 92 116 108L107 132C134 126 164 100 164 78Z" fill="#F3E6CF"/>
  <circle cx="84" cy="80" r="5.6" fill="#2A241F"/><circle cx="130" cy="80" r="5.6" fill="#2A241F"/>
  <circle cx="86" cy="78" r="1.7" fill="#F6EDDC"/><circle cx="132" cy="78" r="1.7" fill="#F6EDDC"/>
  <path d="M100 112C100 107 114 107 114 112C114 118 110 121 107 121C104 121 100 118 100 112Z" fill="#2A241F"/>
</symbol>

<symbol id="guineu-assenyala" viewBox="0 0 250 250">
  <use href="#guineu" x="0" y="0" width="200" height="250"/>
  <path d="M128 166C150 158 176 150 206 146" fill="none" stroke="#BE6F3D" stroke-width="18" stroke-linecap="round"/>
  <path d="M198 136C212 132 226 138 226 146C226 154 212 158 200 156C194 150 194 142 198 136Z" fill="#4A352A"/>
</symbol>

<!-- LLÚDRIGA marinera (mira a la derecha) -->
<symbol id="mariner" viewBox="0 0 220 300">
  <path d="M70 240C30 262 6 250 4 226C24 236 44 226 70 206Z" fill="#6A4C3A"/>
  <rect x="74" y="244" width="30" height="46" rx="14" fill="#6A4C3A"/><rect x="118" y="244" width="30" height="46" rx="14" fill="#5A3F30"/>
  <path d="M68 290C68 278 106 278 106 290ZM112 290C112 278 150 278 150 290Z" fill="#3E2B21"/>
  <rect x="62" y="138" width="96" height="118" rx="44" fill="#F1E6CE"/>
  <g clip-path="url(#c-jersei)" fill="#2F6B72">
    <rect x="50" y="160" width="120" height="13"/><rect x="50" y="186" width="120" height="13"/><rect x="50" y="212" width="120" height="13"/><rect x="50" y="238" width="120" height="13"/>
  </g>
  <path d="M146 166C166 176 182 186 198 190" fill="none" stroke="#6A4C3A" stroke-width="19" stroke-linecap="round"/>
  <circle cx="201" cy="191" r="11" fill="#3E2B21"/>
  <path d="M78 166C66 186 66 206 72 222" fill="none" stroke="#5A3F30" stroke-width="18" stroke-linecap="round"/>
  <circle cx="66" cy="66" r="13" fill="#5A3F30"/><circle cx="154" cy="66" r="13" fill="#5A3F30"/>
  <path d="M50 96C50 64 76 50 110 50C144 50 170 64 170 96C170 130 142 150 110 150C78 150 50 130 50 96Z" fill="#7A5A44"/>
  <path d="M74 118C74 98 146 98 146 118C146 136 128 146 110 146C92 146 74 136 74 118Z" fill="#E8D8B5"/>
  <circle cx="86" cy="90" r="5.6" fill="#231C18"/><circle cx="134" cy="90" r="5.6" fill="#231C18"/>
  <circle cx="88" cy="88" r="1.7" fill="#F6EDDC"/><circle cx="136" cy="88" r="1.7" fill="#F6EDDC"/>
  <path d="M100 106C100 101 120 101 120 106C120 112 114 116 110 116C106 116 100 112 100 106Z" fill="#231C18"/>
  <path d="M110 116V124M96 128C102 133 118 133 124 128" fill="none" stroke="#5A3F30" stroke-width="2.6" stroke-linecap="round"/>
  <path d="M72 118L50 112M72 126L50 128M148 118L170 112M148 126L170 128" stroke="#E8D8B5" stroke-width="2" stroke-linecap="round"/>
  <path d="M62 58C62 28 158 28 158 58Z" fill="#F6EDDC"/>
  <rect x="58" y="52" width="104" height="14" rx="7" fill="#2F6B72"/>
</symbol>

<!-- VAIXELL: bergantí de dos pals. El pal major té la driça buida per al banderí que es guanyarà. -->
<symbol id="vaixell" viewBox="0 0 820 640">
 <g filter="url(#f-paper)">
  <path d="M431 34L60 300M431 34L748 372M602 100L800 324M431 130L214 312M602 100L520 380" stroke="#53331F" stroke-width="2.4" opacity=".55"/>
  <rect x="424" y="28" width="14" height="400" rx="5" fill="#53331F"/>
  <rect x="596" y="96" width="12" height="320" rx="5" fill="#53331F"/>
  <path d="M438 36H452V100" fill="none" stroke="#53331F" stroke-width="2.2"/><circle cx="452" cy="102" r="3" fill="none" stroke="#53331F" stroke-width="2"/>
  <path d="M612 112L800 326L626 372Z" fill="#F4ECD9" stroke="#BFAE8B" stroke-width="2.5"/>
  <path d="M338 162H524C532 190 532 216 522 240H340C330 216 330 190 338 162Z" fill="#F8F2E2" stroke="#BFAE8B" stroke-width="2.5"/>
  <path d="M326 252H536C548 292 548 336 532 372H330C314 336 314 292 326 252Z" fill="#F8F2E2" stroke="#BFAE8B" stroke-width="2.5"/>
  <path d="M330 372C314 336 314 300 322 268C336 300 360 330 532 350C530 358 532 366 532 372Z" fill="#E6DBC2"/>
  <use href="#poma" x="398" y="268" width="66" height="66" opacity=".92"/>
  <path d="M534 188H670C676 210 676 230 668 250H536C530 230 530 210 534 188Z" fill="#F8F2E2" stroke="#BFAE8B" stroke-width="2.5"/>
  <path d="M524 264H680C690 296 690 330 678 358H526C514 330 514 296 524 264Z" fill="#F8F2E2" stroke="#BFAE8B" stroke-width="2.5"/>
  <path d="M526 358C514 330 514 300 520 278C534 306 560 330 678 342C678 348 678 354 678 358Z" fill="#E6DBC2"/>
  <path d="M330 160H532M318 250H544M528 186H676M518 262H686" stroke="#53331F" stroke-width="8" stroke-linecap="round"/>
  <path d="M398 116H464L456 146H406Z" fill="#6B4329"/><path d="M396 116H466" stroke="#53331F" stroke-width="6" stroke-linecap="round"/>
  <path d="M30 392V240" stroke="#53331F" stroke-width="5"/><path d="M30 246H54" stroke="#53331F" stroke-width="5"/>
  <rect x="44" y="246" width="22" height="30" rx="5" fill="#F2DFA9" stroke="#53331F" stroke-width="4"/>
  <path d="M40 300H214V420C150 418 90 410 48 402Z" fill="#8A5A3A"/>
  <rect x="30" y="290" width="194" height="14" rx="5" fill="#53331F"/>
  <path d="M66 372V346C66 330 96 330 96 346V372ZM112 374V348C112 332 142 332 142 348V374ZM158 376V350C158 334 188 334 188 350V376Z" fill="#F2DFA9" stroke="#53331F" stroke-width="4"/>
  <path d="M214 396C380 404 560 398 704 370" fill="none" stroke="#53331F" stroke-width="5"/>
  <path d="M260 398V418M330 401V421M400 402V422M470 401V421M540 398V418M610 390V410M670 380V400" stroke="#53331F" stroke-width="4"/>
  <path d="M712 384L814 316" stroke="#53331F" stroke-width="10" stroke-linecap="round"/>
  <path d="M48 402C150 422 520 427 732 370C716 472 650 550 560 568H210C120 554 64 492 48 402Z" fill="#6B4329"/>
  <path d="M48 402C150 422 520 427 732 370L728 394C520 452 150 448 52 426Z" fill="#B47C4C"/>
  <path d="M52 426C150 448 520 452 728 394L722 414C520 472 150 468 58 448Z" fill="#C4523C"/>
  <path d="M74 488C200 512 470 510 690 452M118 528C230 546 450 544 640 504" fill="none" stroke="#53331F" stroke-width="3"/>
  <circle cx="200" cy="482" r="12" fill="#E8D8B5" stroke="#53331F" stroke-width="4"/><circle cx="310" cy="486" r="12" fill="#E8D8B5" stroke="#53331F" stroke-width="4"/><circle cx="420" cy="484" r="12" fill="#E8D8B5" stroke="#53331F" stroke-width="4"/><circle cx="530" cy="476" r="12" fill="#E8D8B5" stroke="#53331F" stroke-width="4"/>
 </g>
</symbol>

<symbol id="palmera" viewBox="0 0 200 260">
  <path d="M92 258C102 200 106 150 122 104L134 108C122 150 116 204 112 258Z" fill="#54705A"/>
  <path d="M126 100C100 72 56 72 24 100C60 92 96 96 126 106ZM126 102C110 62 70 38 36 40C72 54 104 74 124 110ZM128 100C138 60 170 38 196 44C168 58 146 76 132 110ZM128 104C156 88 186 96 198 124C170 110 148 106 128 110ZM124 106C100 116 84 138 84 168C100 142 112 124 130 112Z" fill="#54705A"/>
</symbol>
<symbol id="nuvol" viewBox="0 0 300 80">
  <path d="M10 70C10 52 34 46 54 50C64 24 112 18 132 40C152 16 214 18 226 48C252 42 292 50 292 70Z" fill="#F7F0DE"/>
</symbol>
<symbol id="far" viewBox="0 0 80 200">
  <rect x="16" y="188" width="48" height="10" rx="4" fill="#6B4329"/>
  <path d="M22 190L28 60H52L58 190Z" fill="#F4ECD9"/>
  <path d="M24.300 144L25.700 116H54.300L55.700 144ZM26.900 92L27.700 72H52.300L53.100 92Z" fill="#C4523C"/>
  <rect x="20" y="52" width="40" height="10" rx="3" fill="#53331F"/>
  <rect x="30" y="32" width="20" height="20" fill="#F2DFA9" stroke="#53331F" stroke-width="3"/>
  <path d="M25 34L40 14L55 34Z" fill="#53331F"/>
</symbol>
<symbol id="gavina" viewBox="0 0 40 16"><path d="M2 12C8 4 14 4 20 11C26 4 32 4 38 12" fill="none" stroke="#45585A" stroke-width="2.6" stroke-linecap="round"/></symbol>
<symbol id="bota" viewBox="0 0 80 100">
  <path d="M10 14C4 40 4 60 10 86C30 96 50 96 70 86C76 60 76 40 70 14C50 4 30 4 10 14Z" fill="#9A6A42"/>
  <path d="M40 8C46 30 46 70 40 94" fill="none" stroke="#7A4F30" stroke-width="3"/>
  <path d="M8 28C30 36 50 36 72 28M6 70C30 78 50 78 74 70" fill="none" stroke="#4A352A" stroke-width="6"/>
  <ellipse cx="40" cy="12" rx="30" ry="7" fill="#B88A5C"/>
</symbol>
<symbol id="caixa" viewBox="0 0 100 90">
  <rect x="4" y="4" width="92" height="82" rx="5" fill="#B88A5C"/>
  <path d="M4 32H96M4 58H96" stroke="#8A5A3A" stroke-width="3"/>
  <rect x="4" y="4" width="92" height="82" rx="5" fill="none" stroke="#6B4329" stroke-width="7"/>
  <path d="M12 80L88 10" stroke="#6B4329" stroke-width="7"/>
</symbol>
<symbol id="barqueta" viewBox="0 0 200 60">
  <path d="M6 12H194C186 40 160 56 130 56H60C34 56 14 40 6 12Z" fill="#8A5A3A"/>
  <path d="M6 12H194L192 20H8Z" fill="#C4523C"/>
  <path d="M60 14L40 2M150 14L170 2" stroke="#53331F" stroke-width="4" stroke-linecap="round"/>
</symbol>

<!-- FONS del PORT -->
<symbol id="fons-port-h" viewBox="0 0 1180 820" preserveAspectRatio="xMidYMax slice">
  <rect width="1180" height="460" fill="url(#g-cel)"/>
  <circle cx="1040" cy="150" r="70" fill="#F8F1DC"/>
  <use href="#nuvol" x="70" y="60" width="300" height="80" opacity=".85"/>
  <use href="#nuvol" x="820" y="250" width="210" height="56" opacity=".7"/>
  <use href="#nuvol" x="230" y="170" width="170" height="46" opacity=".55"/>
  <use href="#gavina" x="250" y="110" width="40" height="16"/><use href="#gavina" x="300" y="132" width="30" height="12"/><use href="#gavina" x="860" y="90" width="34" height="14"/>
  <g filter="url(#f-paper)">
    <path d="M-10 420C60 340 130 300 210 322C270 280 350 300 400 360C430 380 450 400 470 420Z" fill="#B9C8B0"/>
    <path d="M-10 420C50 380 120 356 190 372C250 350 310 372 360 420Z" fill="#9DB39A"/>
  </g>
  <use href="#palmera" x="110" y="262" width="90" height="118"/>
  <use href="#far" x="326" y="268" width="56" height="140"/>
  <rect y="416" width="1180" height="404" fill="url(#g-mar)"/>
  <path d="M60 470H180M300 510H380M90 600H230M560 470H640" stroke="#A9CBC4" stroke-width="4" stroke-linecap="round" opacity=".45"/>
  <use href="#vaixell" x="372" y="22" width="800" height="624"/>
  <path d="M-10 540C120 528 260 552 400 540C520 528 620 552 760 542C900 532 1040 552 1190 538V660H-10Z" fill="#2F6A71"/>
  <path d="M480 572H600M760 578H900M330 590H400" stroke="#A9CBC4" stroke-width="4" stroke-linecap="round" opacity=".4"/>
  <use href="#barqueta" x="120" y="560" width="160" height="48" filter="url(#f-paper)"/>
  <rect x="84" y="548" width="26" height="130" rx="6" fill="#53331F"/><rect x="640" y="548" width="26" height="110" rx="6" fill="#53331F"/>
  <path d="M97 566C260 620 480 620 653 566" fill="none" stroke="#C9B48C" stroke-width="7"/>
  <path d="M110 570C150 580 170 572 190 568" fill="none" stroke="#C9B48C" stroke-width="4"/>
  <g filter="url(#f-paper)">
    <path d="M-10 650L1190 624V830H-10Z" fill="#B8895C"/>
    <path d="M-10 650L1190 624V646L-10 672Z" fill="#CFA377"/>
  </g>
  <path d="M-10 700L1190 678M-10 752L1190 734M-10 804L1190 790" stroke="#8A5A3A" stroke-width="3" opacity=".65"/>
  <path d="M210 666V695M520 662V690M300 697V748M720 688V738M140 750V806M600 740V796" stroke="#8A5A3A" stroke-width="3" opacity=".5"/>
  <g filter="url(#f-paper)">
    <use href="#caixa" x="900" y="566" width="110" height="99"/>
    <use href="#caixa" x="924" y="490" width="80" height="72"/>
    <use href="#bota" x="1020" y="578" width="80" height="100"/>
    <use href="#bota" x="1094" y="596" width="64" height="80"/>
  </g>
</symbol>

<symbol id="fons-port-v" viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice">
  <rect width="390" height="360" fill="url(#g-cel)"/>
  <circle cx="334" cy="250" r="30" fill="#F8F1DC"/>
  <use href="#nuvol" x="10" y="226" width="110" height="30" opacity=".85"/>
  <use href="#nuvol" x="150" y="130" width="130" height="34" opacity=".6"/>
  <use href="#gavina" x="60" y="180" width="28" height="11"/><use href="#gavina" x="96" y="196" width="22" height="9"/>
  <g filter="url(#f-paper)">
    <path d="M-10 330C30 280 70 266 110 276C150 262 190 286 220 330Z" fill="#B9C8B0"/>
    <path d="M250 330C290 310 340 304 400 312V330Z" fill="#C5D2BC"/>
  </g>
  <use href="#palmera" x="50" y="226" width="50" height="66"/>
  <use href="#far" x="150" y="262" width="26" height="64"/>
  <rect y="326" width="390" height="400" fill="url(#g-mar)"/>
  <path d="M20 360H80M310 352H374M24 540H90M300 560H372" stroke="#A9CBC4" stroke-width="3" stroke-linecap="round" opacity=".45"/>
  <use href="#vaixell" x="0" y="262" width="384" height="300"/>
  <path d="M-10 506C50 496 90 516 150 508C210 500 260 518 320 508C350 504 370 508 400 504V620H-10Z" fill="#2F6A71"/>
  <rect x="26" y="548" width="16" height="84" rx="4" fill="#53331F"/><rect x="348" y="548" width="16" height="84" rx="4" fill="#53331F"/>
  <path d="M34 560C130 594 260 594 356 560" fill="none" stroke="#C9B48C" stroke-width="5"/>
  <g filter="url(#f-paper)">
    <path d="M-10 610L400 598V850H-10Z" fill="#B8895C"/>
    <path d="M-10 610L400 598V612L-10 626Z" fill="#CFA377"/>
  </g>
  <path d="M-10 676L400 666M-10 738L400 730M-10 798L400 792" stroke="#8A5A3A" stroke-width="2.4" opacity=".65"/>
  <path d="M90 624V672M300 616V664M190 676V734M340 670V728M60 740V796M250 734V792" stroke="#8A5A3A" stroke-width="2.4" opacity=".5"/>
</symbol>

<!-- FONS de la MERIENDA: capes de paper; el vaixell de la tripulació fondejat al fons -->
<symbol id="fons-berenar-h" viewBox="0 0 1180 820" preserveAspectRatio="xMidYMax slice">
  <rect width="1180" height="300" fill="url(#g-cel)"/>
  <use href="#nuvol" x="150" y="84" width="240" height="64" opacity=".7"/>
  <use href="#nuvol" x="700" y="40" width="190" height="50" opacity=".6"/>
  <use href="#gavina" x="880" y="120" width="36" height="14"/><use href="#gavina" x="928" y="140" width="26" height="10"/>
  <rect y="190" width="1180" height="120" fill="#7FAAA3"/>
  <path d="M60 220H140M300 236H360M900 240H980" stroke="#B5D0C8" stroke-width="3" stroke-linecap="round" opacity=".6"/>
  <g filter="url(#f-paper)"><path d="M760 200C840 160 960 150 1190 170V210H760Z" fill="#B9C8B0"/></g>
  <use href="#far" x="1050" y="104" width="34" height="85"/>
  <use href="#vaixell" x="250" y="128" width="110" height="86"/>
  <g filter="url(#f-paper)">
    <path d="M-10 262C160 214 330 240 520 256C760 276 980 222 1190 246V830H-10Z" fill="#E6D6AE"/>
    <path d="M-10 330C200 280 420 316 640 330C840 342 1020 298 1190 316V830H-10Z" fill="#CBD2AC"/>
    <path d="M-10 540C260 490 520 540 760 548C940 552 1080 520 1190 530V830H-10Z" fill="#BCC7A0"/>
  </g>
  <g fill="#F4ECD9"><circle cx="150" cy="430" r="5"/><circle cx="162" cy="436" r="4"/><circle cx="1010" cy="460" r="5"/><circle cx="560" cy="760" r="5"/><circle cx="572" cy="754" r="4"/></g>
  <g fill="#A9A188"><ellipse cx="450" cy="470" rx="14" ry="8"/><ellipse cx="880" cy="700" rx="18" ry="9"/></g>
</symbol>

<symbol id="fons-berenar-v" viewBox="0 0 390 844" preserveAspectRatio="xMidYMax slice">
  <rect width="390" height="140" fill="url(#g-cel)"/>
  <rect y="96" width="390" height="60" fill="#7FAAA3"/>
  <g filter="url(#f-paper)"><path d="M250 104C290 88 340 84 400 90V112H250Z" fill="#B9C8B0"/></g>
  <use href="#far" x="330" y="54" width="18" height="45"/>
  <use href="#vaixell" x="40" y="58" width="80" height="62"/>
  <g filter="url(#f-paper)">
    <path d="M-10 132C90 108 200 130 400 118V850H-10Z" fill="#E6D6AE"/>
    <path d="M-10 170C110 146 240 176 400 156V850H-10Z" fill="#CBD2AC"/>
    <path d="M-10 500C110 470 250 510 400 480V850H-10Z" fill="#BCC7A0"/>
  </g>
  <g fill="#F4ECD9"><circle cx="40" cy="460" r="4"/><circle cx="50" cy="465" r="3"/><circle cx="340" cy="380" r="4"/></g>
</symbol>

<!-- BANDERINS: premis per al vaixell -->
<symbol id="banderi-poma" viewBox="0 0 80 50"><path d="M0 2H78L64 25L78 48H0Z" fill="#C4523C"/><path d="M0 38H71L78 48H0Z" fill="#A23F2D" opacity=".45"/><circle cx="28" cy="27" r="11" fill="#F6EDDC"/><path d="M28 16C29 12 32 10 36 10" stroke="#F6EDDC" stroke-width="3" fill="none" stroke-linecap="round"/></symbol>
<symbol id="banderi-estel" viewBox="0 0 80 50"><path d="M0 2L80 25L0 48Z" fill="#2F6B72"/><path d="M0 34L33.500 38.500L0 48Z" fill="#1F4A52" opacity=".5"/><path d="M22 14L24.900 20.900L32.400 21.500L26.700 26.400L28.400 33.700L22 29.800L15.600 33.700L17.300 26.400L11.600 21.500L19.100 20.900Z" fill="#F6EDDC"/></symbol>
<!-- ICONOS -->
<symbol id="i-altaveu" viewBox="0 0 48 48"><path d="M8 19V29C8 30 9 31 10 31H16L25 38C26.300 39 28 38 28 36.500V11.500C28 10 26.300 9 25 10L16 17H10C9 17 8 18 8 19Z" fill="currentColor"/><path d="M33 18C35.500 21.500 35.500 26.500 33 30M37.500 13.500C42.500 20 42.500 28 37.500 34.500" fill="none" stroke="currentColor" stroke-width="3.400" stroke-linecap="round"/></symbol>
<symbol id="i-illa" viewBox="0 0 48 48"><path d="M5 38C11 31 37 31 43 38C43 40 41 41 39 41H9C7 41 5 40 5 38Z" fill="currentColor"/><path d="M23 33C24 26 25 20 28 14L31 15C28 21 27 27 27 33Z" fill="currentColor"/><path d="M29 15C24 9 16 10 12 15C18 13 24 14 29 17ZM29 15C31 9 38 7 42 10C37 11 33 13 30 18ZM29 15C33 13 40 15 42 21C37 18 33 17 29 17Z" fill="currentColor"/></symbol>
<symbol id="i-check" viewBox="0 0 48 48"><path d="M10 25L20 35L38 13" fill="none" stroke="currentColor" stroke-width="6.500" stroke-linecap="round" stroke-linejoin="round"/></symbol>
<symbol id="i-pota" viewBox="0 0 60 60"><path d="M18 40C18 30 24 25 30 25C36 25 42 30 42 40C42 48 36 50 30 48C24 50 18 48 18 40Z" fill="#4A352A"/><ellipse cx="13" cy="26" rx="6" ry="8" fill="#4A352A"/><ellipse cx="24" cy="14" rx="6" ry="8.500" fill="#4A352A"/><ellipse cx="37" cy="14" rx="6" ry="8.500" fill="#4A352A"/><ellipse cx="47" cy="26" rx="6" ry="8" fill="#4A352A"/></symbol>
</svg>`;
