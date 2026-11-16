---
date: 2026-11-16
type: reference
status: active
tags: [project, dicoding, pijak2027, scoring, sql]
related-projects: ["[[Projects/Pijak 2027]]"]
---

# Pijak 2027 - Traits Scoring Weights

Bobot skor per pilihan jawaban untuk pertanyaan assessment traits Pijak 2027 (87 pertanyaan, 540 pilihan). Sumber: `traits_text.sql` (sebelumnya di `docs/domains/pijak2027/`), dipakai untuk menampilkan teks pertanyaan dan pilihan beserta bobotnya dari tabel `exam_questions` dan `exam_multiple_choices`.

## Bobot per pertanyaan

Format: `choice_id` → bobot.

| question_id | Pilihan (choice_id → bobot) |
|---|---|
| 181475 | 746273→1, 746276→2, 746279→3, 746282→4, 746285→5, 746288→6 |
| 181478 | 746291→1, 746294→2, 746297→3, 746300→4, 746303→5, 746306→6 |
| 181481 | 746309→1, 746312→2, 746315→3, 746318→4, 746321→5, 746324→6 |
| 181433 | 746105→1, 746108→3, 746111→5, 746114→7 |
| 181436 | 746117→1, 746120→3, 746123→5, 746126→7 |
| 181439 | 746129→1, 746132→3, 746135→5, 746138→7 |
| 181442 | 746141→7, 746144→5, 746147→3, 746150→1 |
| 181445 | 746153→1, 746156→3, 746159→5, 746162→7 |
| 181448 | 746165→0, 746168→0, 746171→0, 746174→0 |
| 181451 | 746177→0, 746180→0, 746183→0, 746186→0 |
| 181454 | 746189→1, 746192→3, 746195→5, 746198→7 |
| 181457 | 746201→0, 746204→0, 746207→0, 746210→0 |
| 181460 | 746213→7, 746216→5, 746219→3, 746222→1 |
| 181463 | 746225→1, 746228→3, 746231→5, 746234→7 |
| 181466 | 746237→7, 746240→5, 746243→3, 746246→1 |
| 181469 | 746249→1, 746252→3, 746255→5, 746258→7 |
| 181472 | 746261→1, 746264→3, 746267→5, 746270→7 |
| 181307 | 745223→7, 745226→6, 745229→5, 745232→4, 745235→3, 745238→2, 745241→1 |
| 181310 | 745244→7, 745247→6, 745250→5, 745253→4, 745256→3, 745259→2, 745262→1 |
| 181313 | 745265→7, 745268→6, 745271→5, 745274→4, 745277→3, 745280→2, 745283→1 |
| 181316 | 745286→7, 745289→6, 745292→5, 745295→4, 745298→3, 745301→2, 745304→1 |
| 181319 | 745307→1, 745310→2, 745313→3, 745316→4, 745319→5, 745322→6, 745325→7 |
| 181322 | 745328→7, 745331→6, 745334→5, 745337→4, 745340→3, 745343→2, 745346→1 |
| 181325 | 745349→7, 745352→6, 745355→5, 745358→4, 745361→3, 745364→2, 745367→1 |
| 181328 | 745370→1, 745373→2, 745376→3, 745379→4, 745382→5, 745385→6, 745388→7 |
| 181331 | 745391→1, 745394→2, 745397→3, 745400→4, 745403→5, 745406→6, 745409→7 |
| 181334 | 745412→1, 745415→2, 745418→3, 745421→4, 745424→5, 745427→6, 745430→7 |
| 181337 | 745433→7, 745436→6, 745439→5, 745442→4, 745445→3, 745448→2, 745451→1 |
| 181340 | 745454→1, 745457→2, 745460→3, 745463→4, 745466→5, 745469→6, 745472→7 |
| 181343 | 745475→7, 745478→6, 745481→5, 745484→4, 745487→3, 745490→2, 745493→1 |
| 181346 | 745496→1, 745499→2, 745502→3, 745505→4, 745508→5, 745511→6, 745514→7 |
| 181349 | 745517→1, 745520→2, 745523→3, 745526→4, 745529→5, 745532→6, 745535→7 |
| 181352 | 745538→1, 745541→2, 745544→3, 745547→4, 745550→5, 745553→6, 745556→7 |
| 181355 | 745559→7, 745562→6, 745565→5, 745568→4, 745571→3, 745574→2, 745577→1 |
| 181358 | 745580→1, 745583→2, 745586→3, 745589→4, 745592→5, 745595→6, 745598→7 |
| 181361 | 745601→1, 745604→2, 745607→3, 745610→4, 745613→5, 745616→6, 745619→7 |
| 181364 | 745622→7, 745625→6, 745628→5, 745631→4, 745634→3, 745637→2, 745640→1 |
| 181367 | 745643→7, 745646→6, 745649→5, 745652→4, 745655→3, 745658→2, 745661→1 |
| 181370 | 745664→7, 745667→6, 745670→5, 745673→4, 745676→3, 745679→2, 745682→1 |
| 181373 | 745685→7, 745688→6, 745691→5, 745694→4, 745697→3, 745700→2, 745703→1 |
| 181376 | 745706→1, 745709→2, 745712→3, 745715→4, 745718→5, 745721→6, 745724→7 |
| 181379 | 745727→1, 745730→2, 745733→3, 745736→4, 745739→5, 745742→6, 745745→7 |
| 181382 | 745748→1, 745751→2, 745754→3, 745757→4, 745760→5, 745763→6, 745766→7 |
| 181385 | 745769→7, 745772→6, 745775→5, 745778→4, 745781→3, 745784→2, 745787→1 |
| 181388 | 745790→1, 745793→2, 745796→3, 745799→4, 745802→5, 745805→6, 745808→7 |
| 181391 | 745811→7, 745814→6, 745817→5, 745820→4, 745823→3, 745826→2, 745829→1 |
| 181394 | 745832→1, 745835→2, 745838→3, 745841→4, 745844→5, 745847→6, 745850→7 |
| 181397 | 745853→7, 745856→6, 745859→5, 745862→4, 745865→3, 745868→2, 745871→1 |
| 181400 | 745874→1, 745877→2, 745880→3, 745883→4, 745886→5, 745889→6, 745892→7 |
| 181403 | 745895→1, 745898→2, 745901→3, 745904→4, 745907→5, 745910→6, 745913→7 |
| 181406 | 745916→1, 745919→2, 745922→3, 745925→4, 745928→5, 745931→6, 745934→7 |
| 181409 | 745937→7, 745940→6, 745943→5, 745946→4, 745949→3, 745952→2, 745955→1 |
| 181412 | 745958→7, 745961→6, 745964→5, 745967→4, 745970→3, 745973→2, 745976→1 |
| 181415 | 745979→7, 745982→6, 745985→5, 745988→4, 745991→3, 745994→2, 745997→1 |
| 181418 | 746000→7, 746003→6, 746006→5, 746009→4, 746012→3, 746015→2, 746018→1 |
| 181421 | 746021→1, 746024→2, 746027→3, 746030→4, 746033→5, 746036→6, 746039→7 |
| 181424 | 746042→7, 746045→6, 746048→5, 746051→4, 746054→3, 746057→2, 746060→1 |
| 181427 | 746063→1, 746066→2, 746069→3, 746072→4, 746075→5, 746078→6, 746081→7 |
| 181430 | 746084→1, 746087→2, 746090→3, 746093→4, 746096→5, 746099→6, 746102→7 |
| 181271 | 744971→7, 744974→6, 744977→5, 744980→4, 744983→3, 744986→2, 744989→1 |
| 181274 | 744992→7, 744995→6, 744998→5, 745001→4, 745004→3, 745007→2, 745010→1 |
| 181277 | 745013→7, 745016→6, 745019→5, 745022→4, 745025→3, 745028→2, 745031→1 |
| 181280 | 745034→7, 745037→6, 745040→5, 745043→4, 745046→3, 745049→2, 745052→1 |
| 181283 | 745055→1, 745058→2, 745061→3, 745064→4, 745067→5, 745070→6, 745073→7 |
| 181286 | 745076→1, 745079→2, 745082→3, 745085→4, 745088→5, 745091→6, 745094→7 |
| 181289 | 745097→1, 745100→2, 745103→3, 745106→4, 745109→5, 745112→6, 745115→7 |
| 181292 | 745118→1, 745121→2, 745124→3, 745127→4, 745130→5, 745133→6, 745136→7 |
| 181295 | 745139→1, 745142→2, 745145→3, 745148→4, 745151→5, 745154→6, 745157→7 |
| 181298 | 745160→1, 745163→2, 745166→3, 745169→4, 745172→5, 745175→6, 745178→7 |
| 181301 | 745181→1, 745184→2, 745187→3, 745190→4, 745193→5, 745196→6, 745199→7 |
| 181304 | 745202→7, 745205→6, 745208→5, 745211→4, 745214→3, 745217→2, 745220→1 |
| 181247 | 744851→7, 744854→5, 744857→4, 744860→3, 744863→1 |
| 181250 | 744866→7, 744869→5, 744872→4, 744875→3, 744878→1 |
| 181253 | 744881→7, 744884→5, 744887→4, 744890→3, 744893→1 |
| 181256 | 744896→7, 744899→5, 744902→4, 744905→3, 744908→1 |
| 181259 | 744911→7, 744914→5, 744917→4, 744920→3, 744923→1 |
| 181262 | 744926→7, 744929→5, 744932→4, 744935→3, 744938→1 |
| 181265 | 744941→7, 744944→5, 744947→4, 744950→3, 744953→1 |
| 181268 | 744956→7, 744959→5, 744962→4, 744965→3, 744968→1 |
| 181223 | 744707→1, 744710→2, 744713→3, 744716→4, 744719→5, 744722→6 |
| 181226 | 744725→1, 744728→2, 744731→3, 744734→4, 744737→5, 744740→6 |
| 181229 | 744743→6, 744746→5, 744749→4, 744752→3, 744755→2, 744758→1 |
| 181232 | 744761→1, 744764→2, 744767→3, 744770→4, 744773→5, 744776→6 |
| 181235 | 744779→6, 744782→5, 744785→4, 744788→3, 744791→2, 744794→1 |
| 181238 | 744797→1, 744800→2, 744803→3, 744806→4, 744809→5, 744812→6 |
| 181241 | 744815→6, 744818→5, 744821→4, 744824→3, 744827→2, 744830→1 |
| 181244 | 744833→6, 744836→5, 744839→4, 744842→3, 744845→2, 744848→1 |

## Query lengkap

Jalankan di DB untuk mendapatkan teks pertanyaan dan teks pilihan.

```sql
SELECT w.question_id, q.question AS question_text, w.choice_id, c.choice_content AS choice_text, w.score_weight
FROM (
  SELECT 181475 AS question_id, 746273 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181475 AS question_id, 746276 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181475 AS question_id, 746279 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181475 AS question_id, 746282 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181475 AS question_id, 746285 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181475 AS question_id, 746288 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181478 AS question_id, 746291 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181478 AS question_id, 746294 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181478 AS question_id, 746297 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181478 AS question_id, 746300 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181478 AS question_id, 746303 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181478 AS question_id, 746306 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181481 AS question_id, 746309 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181481 AS question_id, 746312 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181481 AS question_id, 746315 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181481 AS question_id, 746318 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181481 AS question_id, 746321 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181481 AS question_id, 746324 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181433 AS question_id, 746105 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181433 AS question_id, 746108 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181433 AS question_id, 746111 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181433 AS question_id, 746114 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181436 AS question_id, 746117 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181436 AS question_id, 746120 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181436 AS question_id, 746123 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181436 AS question_id, 746126 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181439 AS question_id, 746129 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181439 AS question_id, 746132 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181439 AS question_id, 746135 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181439 AS question_id, 746138 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181442 AS question_id, 746141 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181442 AS question_id, 746144 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181442 AS question_id, 746147 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181442 AS question_id, 746150 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181445 AS question_id, 746153 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181445 AS question_id, 746156 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181445 AS question_id, 746159 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181445 AS question_id, 746162 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181448 AS question_id, 746165 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181448 AS question_id, 746168 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181448 AS question_id, 746171 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181448 AS question_id, 746174 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181451 AS question_id, 746177 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181451 AS question_id, 746180 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181451 AS question_id, 746183 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181451 AS question_id, 746186 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181454 AS question_id, 746189 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181454 AS question_id, 746192 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181454 AS question_id, 746195 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181454 AS question_id, 746198 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181457 AS question_id, 746201 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181457 AS question_id, 746204 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181457 AS question_id, 746207 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181457 AS question_id, 746210 AS choice_id, 0 AS score_weight
  UNION ALL
  SELECT 181460 AS question_id, 746213 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181460 AS question_id, 746216 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181460 AS question_id, 746219 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181460 AS question_id, 746222 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181463 AS question_id, 746225 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181463 AS question_id, 746228 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181463 AS question_id, 746231 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181463 AS question_id, 746234 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181466 AS question_id, 746237 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181466 AS question_id, 746240 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181466 AS question_id, 746243 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181466 AS question_id, 746246 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181469 AS question_id, 746249 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181469 AS question_id, 746252 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181469 AS question_id, 746255 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181469 AS question_id, 746258 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181472 AS question_id, 746261 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181472 AS question_id, 746264 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181472 AS question_id, 746267 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181472 AS question_id, 746270 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181307 AS question_id, 745223 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181307 AS question_id, 745226 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181307 AS question_id, 745229 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181307 AS question_id, 745232 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181307 AS question_id, 745235 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181307 AS question_id, 745238 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181307 AS question_id, 745241 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181310 AS question_id, 745244 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181310 AS question_id, 745247 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181310 AS question_id, 745250 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181310 AS question_id, 745253 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181310 AS question_id, 745256 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181310 AS question_id, 745259 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181310 AS question_id, 745262 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181313 AS question_id, 745265 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181313 AS question_id, 745268 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181313 AS question_id, 745271 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181313 AS question_id, 745274 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181313 AS question_id, 745277 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181313 AS question_id, 745280 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181313 AS question_id, 745283 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181316 AS question_id, 745286 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181316 AS question_id, 745289 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181316 AS question_id, 745292 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181316 AS question_id, 745295 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181316 AS question_id, 745298 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181316 AS question_id, 745301 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181316 AS question_id, 745304 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181319 AS question_id, 745307 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181319 AS question_id, 745310 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181319 AS question_id, 745313 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181319 AS question_id, 745316 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181319 AS question_id, 745319 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181319 AS question_id, 745322 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181319 AS question_id, 745325 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181322 AS question_id, 745328 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181322 AS question_id, 745331 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181322 AS question_id, 745334 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181322 AS question_id, 745337 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181322 AS question_id, 745340 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181322 AS question_id, 745343 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181322 AS question_id, 745346 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181325 AS question_id, 745349 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181325 AS question_id, 745352 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181325 AS question_id, 745355 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181325 AS question_id, 745358 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181325 AS question_id, 745361 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181325 AS question_id, 745364 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181325 AS question_id, 745367 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181328 AS question_id, 745370 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181328 AS question_id, 745373 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181328 AS question_id, 745376 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181328 AS question_id, 745379 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181328 AS question_id, 745382 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181328 AS question_id, 745385 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181328 AS question_id, 745388 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181331 AS question_id, 745391 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181331 AS question_id, 745394 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181331 AS question_id, 745397 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181331 AS question_id, 745400 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181331 AS question_id, 745403 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181331 AS question_id, 745406 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181331 AS question_id, 745409 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181334 AS question_id, 745412 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181334 AS question_id, 745415 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181334 AS question_id, 745418 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181334 AS question_id, 745421 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181334 AS question_id, 745424 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181334 AS question_id, 745427 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181334 AS question_id, 745430 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181337 AS question_id, 745433 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181337 AS question_id, 745436 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181337 AS question_id, 745439 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181337 AS question_id, 745442 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181337 AS question_id, 745445 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181337 AS question_id, 745448 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181337 AS question_id, 745451 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181340 AS question_id, 745454 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181340 AS question_id, 745457 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181340 AS question_id, 745460 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181340 AS question_id, 745463 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181340 AS question_id, 745466 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181340 AS question_id, 745469 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181340 AS question_id, 745472 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181343 AS question_id, 745475 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181343 AS question_id, 745478 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181343 AS question_id, 745481 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181343 AS question_id, 745484 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181343 AS question_id, 745487 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181343 AS question_id, 745490 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181343 AS question_id, 745493 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181346 AS question_id, 745496 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181346 AS question_id, 745499 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181346 AS question_id, 745502 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181346 AS question_id, 745505 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181346 AS question_id, 745508 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181346 AS question_id, 745511 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181346 AS question_id, 745514 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181349 AS question_id, 745517 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181349 AS question_id, 745520 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181349 AS question_id, 745523 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181349 AS question_id, 745526 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181349 AS question_id, 745529 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181349 AS question_id, 745532 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181349 AS question_id, 745535 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181352 AS question_id, 745538 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181352 AS question_id, 745541 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181352 AS question_id, 745544 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181352 AS question_id, 745547 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181352 AS question_id, 745550 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181352 AS question_id, 745553 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181352 AS question_id, 745556 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181355 AS question_id, 745559 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181355 AS question_id, 745562 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181355 AS question_id, 745565 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181355 AS question_id, 745568 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181355 AS question_id, 745571 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181355 AS question_id, 745574 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181355 AS question_id, 745577 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181358 AS question_id, 745580 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181358 AS question_id, 745583 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181358 AS question_id, 745586 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181358 AS question_id, 745589 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181358 AS question_id, 745592 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181358 AS question_id, 745595 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181358 AS question_id, 745598 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181361 AS question_id, 745601 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181361 AS question_id, 745604 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181361 AS question_id, 745607 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181361 AS question_id, 745610 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181361 AS question_id, 745613 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181361 AS question_id, 745616 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181361 AS question_id, 745619 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181364 AS question_id, 745622 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181364 AS question_id, 745625 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181364 AS question_id, 745628 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181364 AS question_id, 745631 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181364 AS question_id, 745634 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181364 AS question_id, 745637 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181364 AS question_id, 745640 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181367 AS question_id, 745643 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181367 AS question_id, 745646 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181367 AS question_id, 745649 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181367 AS question_id, 745652 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181367 AS question_id, 745655 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181367 AS question_id, 745658 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181367 AS question_id, 745661 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181370 AS question_id, 745664 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181370 AS question_id, 745667 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181370 AS question_id, 745670 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181370 AS question_id, 745673 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181370 AS question_id, 745676 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181370 AS question_id, 745679 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181370 AS question_id, 745682 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181373 AS question_id, 745685 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181373 AS question_id, 745688 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181373 AS question_id, 745691 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181373 AS question_id, 745694 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181373 AS question_id, 745697 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181373 AS question_id, 745700 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181373 AS question_id, 745703 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181376 AS question_id, 745706 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181376 AS question_id, 745709 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181376 AS question_id, 745712 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181376 AS question_id, 745715 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181376 AS question_id, 745718 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181376 AS question_id, 745721 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181376 AS question_id, 745724 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181379 AS question_id, 745727 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181379 AS question_id, 745730 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181379 AS question_id, 745733 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181379 AS question_id, 745736 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181379 AS question_id, 745739 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181379 AS question_id, 745742 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181379 AS question_id, 745745 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181382 AS question_id, 745748 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181382 AS question_id, 745751 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181382 AS question_id, 745754 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181382 AS question_id, 745757 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181382 AS question_id, 745760 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181382 AS question_id, 745763 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181382 AS question_id, 745766 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181385 AS question_id, 745769 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181385 AS question_id, 745772 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181385 AS question_id, 745775 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181385 AS question_id, 745778 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181385 AS question_id, 745781 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181385 AS question_id, 745784 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181385 AS question_id, 745787 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181388 AS question_id, 745790 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181388 AS question_id, 745793 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181388 AS question_id, 745796 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181388 AS question_id, 745799 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181388 AS question_id, 745802 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181388 AS question_id, 745805 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181388 AS question_id, 745808 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181391 AS question_id, 745811 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181391 AS question_id, 745814 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181391 AS question_id, 745817 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181391 AS question_id, 745820 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181391 AS question_id, 745823 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181391 AS question_id, 745826 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181391 AS question_id, 745829 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181394 AS question_id, 745832 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181394 AS question_id, 745835 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181394 AS question_id, 745838 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181394 AS question_id, 745841 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181394 AS question_id, 745844 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181394 AS question_id, 745847 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181394 AS question_id, 745850 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181397 AS question_id, 745853 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181397 AS question_id, 745856 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181397 AS question_id, 745859 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181397 AS question_id, 745862 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181397 AS question_id, 745865 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181397 AS question_id, 745868 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181397 AS question_id, 745871 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181400 AS question_id, 745874 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181400 AS question_id, 745877 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181400 AS question_id, 745880 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181400 AS question_id, 745883 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181400 AS question_id, 745886 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181400 AS question_id, 745889 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181400 AS question_id, 745892 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181403 AS question_id, 745895 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181403 AS question_id, 745898 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181403 AS question_id, 745901 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181403 AS question_id, 745904 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181403 AS question_id, 745907 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181403 AS question_id, 745910 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181403 AS question_id, 745913 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181406 AS question_id, 745916 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181406 AS question_id, 745919 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181406 AS question_id, 745922 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181406 AS question_id, 745925 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181406 AS question_id, 745928 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181406 AS question_id, 745931 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181406 AS question_id, 745934 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181409 AS question_id, 745937 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181409 AS question_id, 745940 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181409 AS question_id, 745943 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181409 AS question_id, 745946 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181409 AS question_id, 745949 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181409 AS question_id, 745952 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181409 AS question_id, 745955 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181412 AS question_id, 745958 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181412 AS question_id, 745961 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181412 AS question_id, 745964 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181412 AS question_id, 745967 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181412 AS question_id, 745970 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181412 AS question_id, 745973 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181412 AS question_id, 745976 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181415 AS question_id, 745979 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181415 AS question_id, 745982 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181415 AS question_id, 745985 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181415 AS question_id, 745988 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181415 AS question_id, 745991 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181415 AS question_id, 745994 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181415 AS question_id, 745997 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181418 AS question_id, 746000 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181418 AS question_id, 746003 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181418 AS question_id, 746006 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181418 AS question_id, 746009 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181418 AS question_id, 746012 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181418 AS question_id, 746015 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181418 AS question_id, 746018 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181421 AS question_id, 746021 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181421 AS question_id, 746024 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181421 AS question_id, 746027 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181421 AS question_id, 746030 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181421 AS question_id, 746033 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181421 AS question_id, 746036 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181421 AS question_id, 746039 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181424 AS question_id, 746042 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181424 AS question_id, 746045 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181424 AS question_id, 746048 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181424 AS question_id, 746051 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181424 AS question_id, 746054 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181424 AS question_id, 746057 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181424 AS question_id, 746060 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181427 AS question_id, 746063 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181427 AS question_id, 746066 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181427 AS question_id, 746069 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181427 AS question_id, 746072 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181427 AS question_id, 746075 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181427 AS question_id, 746078 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181427 AS question_id, 746081 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181430 AS question_id, 746084 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181430 AS question_id, 746087 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181430 AS question_id, 746090 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181430 AS question_id, 746093 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181430 AS question_id, 746096 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181430 AS question_id, 746099 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181430 AS question_id, 746102 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181271 AS question_id, 744971 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181271 AS question_id, 744974 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181271 AS question_id, 744977 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181271 AS question_id, 744980 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181271 AS question_id, 744983 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181271 AS question_id, 744986 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181271 AS question_id, 744989 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181274 AS question_id, 744992 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181274 AS question_id, 744995 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181274 AS question_id, 744998 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181274 AS question_id, 745001 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181274 AS question_id, 745004 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181274 AS question_id, 745007 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181274 AS question_id, 745010 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181277 AS question_id, 745013 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181277 AS question_id, 745016 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181277 AS question_id, 745019 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181277 AS question_id, 745022 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181277 AS question_id, 745025 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181277 AS question_id, 745028 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181277 AS question_id, 745031 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181280 AS question_id, 745034 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181280 AS question_id, 745037 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181280 AS question_id, 745040 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181280 AS question_id, 745043 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181280 AS question_id, 745046 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181280 AS question_id, 745049 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181280 AS question_id, 745052 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181283 AS question_id, 745055 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181283 AS question_id, 745058 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181283 AS question_id, 745061 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181283 AS question_id, 745064 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181283 AS question_id, 745067 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181283 AS question_id, 745070 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181283 AS question_id, 745073 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181286 AS question_id, 745076 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181286 AS question_id, 745079 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181286 AS question_id, 745082 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181286 AS question_id, 745085 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181286 AS question_id, 745088 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181286 AS question_id, 745091 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181286 AS question_id, 745094 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181289 AS question_id, 745097 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181289 AS question_id, 745100 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181289 AS question_id, 745103 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181289 AS question_id, 745106 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181289 AS question_id, 745109 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181289 AS question_id, 745112 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181289 AS question_id, 745115 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181292 AS question_id, 745118 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181292 AS question_id, 745121 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181292 AS question_id, 745124 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181292 AS question_id, 745127 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181292 AS question_id, 745130 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181292 AS question_id, 745133 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181292 AS question_id, 745136 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181295 AS question_id, 745139 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181295 AS question_id, 745142 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181295 AS question_id, 745145 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181295 AS question_id, 745148 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181295 AS question_id, 745151 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181295 AS question_id, 745154 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181295 AS question_id, 745157 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181298 AS question_id, 745160 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181298 AS question_id, 745163 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181298 AS question_id, 745166 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181298 AS question_id, 745169 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181298 AS question_id, 745172 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181298 AS question_id, 745175 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181298 AS question_id, 745178 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181301 AS question_id, 745181 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181301 AS question_id, 745184 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181301 AS question_id, 745187 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181301 AS question_id, 745190 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181301 AS question_id, 745193 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181301 AS question_id, 745196 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181301 AS question_id, 745199 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181304 AS question_id, 745202 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181304 AS question_id, 745205 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181304 AS question_id, 745208 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181304 AS question_id, 745211 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181304 AS question_id, 745214 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181304 AS question_id, 745217 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181304 AS question_id, 745220 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181247 AS question_id, 744851 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181247 AS question_id, 744854 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181247 AS question_id, 744857 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181247 AS question_id, 744860 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181247 AS question_id, 744863 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181250 AS question_id, 744866 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181250 AS question_id, 744869 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181250 AS question_id, 744872 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181250 AS question_id, 744875 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181250 AS question_id, 744878 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181253 AS question_id, 744881 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181253 AS question_id, 744884 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181253 AS question_id, 744887 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181253 AS question_id, 744890 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181253 AS question_id, 744893 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181256 AS question_id, 744896 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181256 AS question_id, 744899 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181256 AS question_id, 744902 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181256 AS question_id, 744905 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181256 AS question_id, 744908 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181259 AS question_id, 744911 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181259 AS question_id, 744914 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181259 AS question_id, 744917 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181259 AS question_id, 744920 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181259 AS question_id, 744923 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181262 AS question_id, 744926 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181262 AS question_id, 744929 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181262 AS question_id, 744932 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181262 AS question_id, 744935 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181262 AS question_id, 744938 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181265 AS question_id, 744941 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181265 AS question_id, 744944 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181265 AS question_id, 744947 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181265 AS question_id, 744950 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181265 AS question_id, 744953 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181268 AS question_id, 744956 AS choice_id, 7 AS score_weight
  UNION ALL
  SELECT 181268 AS question_id, 744959 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181268 AS question_id, 744962 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181268 AS question_id, 744965 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181268 AS question_id, 744968 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181223 AS question_id, 744707 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181223 AS question_id, 744710 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181223 AS question_id, 744713 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181223 AS question_id, 744716 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181223 AS question_id, 744719 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181223 AS question_id, 744722 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181226 AS question_id, 744725 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181226 AS question_id, 744728 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181226 AS question_id, 744731 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181226 AS question_id, 744734 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181226 AS question_id, 744737 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181226 AS question_id, 744740 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181229 AS question_id, 744743 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181229 AS question_id, 744746 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181229 AS question_id, 744749 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181229 AS question_id, 744752 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181229 AS question_id, 744755 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181229 AS question_id, 744758 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181232 AS question_id, 744761 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181232 AS question_id, 744764 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181232 AS question_id, 744767 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181232 AS question_id, 744770 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181232 AS question_id, 744773 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181232 AS question_id, 744776 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181235 AS question_id, 744779 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181235 AS question_id, 744782 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181235 AS question_id, 744785 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181235 AS question_id, 744788 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181235 AS question_id, 744791 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181235 AS question_id, 744794 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181238 AS question_id, 744797 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181238 AS question_id, 744800 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181238 AS question_id, 744803 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181238 AS question_id, 744806 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181238 AS question_id, 744809 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181238 AS question_id, 744812 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181241 AS question_id, 744815 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181241 AS question_id, 744818 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181241 AS question_id, 744821 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181241 AS question_id, 744824 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181241 AS question_id, 744827 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181241 AS question_id, 744830 AS choice_id, 1 AS score_weight
  UNION ALL
  SELECT 181244 AS question_id, 744833 AS choice_id, 6 AS score_weight
  UNION ALL
  SELECT 181244 AS question_id, 744836 AS choice_id, 5 AS score_weight
  UNION ALL
  SELECT 181244 AS question_id, 744839 AS choice_id, 4 AS score_weight
  UNION ALL
  SELECT 181244 AS question_id, 744842 AS choice_id, 3 AS score_weight
  UNION ALL
  SELECT 181244 AS question_id, 744845 AS choice_id, 2 AS score_weight
  UNION ALL
  SELECT 181244 AS question_id, 744848 AS choice_id, 1 AS score_weight
) AS w
LEFT JOIN exam_multiple_choices c ON c.id = w.choice_id AND c.exam_question_id = w.question_id
LEFT JOIN exam_questions q ON q.id = w.question_id
ORDER BY w.question_id, w.score_weight, w.choice_id;
```
