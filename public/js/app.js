
(function(){
var $=function(s){return document.querySelector(s)},$$=function(s){return Array.prototype.slice.call(document.querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(pointer:fine)').matches;
var COL=[['#eb8633','#7f4516','#ffffff','#b97c52'],['#0f8a63','#064a37','#ffc629','#8d5a3b'],['#65452a','#0f1c3a','#ffffff','#a86f49'],['#eb8633','#75441c','#ffc629','#c68f64'],['#0f8a63','#07402f','#ffffff','#9a6040'],['#65452a','#14224a','#ffc629','#b97c52']];
var P=[
 ['Jordan Mbala',19,'Cameroun','Douala','Attaquant','ATT','Droit','1,78 m','Semi-professionnel','D2'],
 ['Kevin Njoya',21,'Cameroun','Yaoundé','Milieu','MIL','Gauche','1,76 m','Amateur','Senior'],
 ['Samuel Kouassi',20,"Côte d'Ivoire",'Abidjan','Défenseur','DEF','Droit','1,86 m','Académie','U21'],
 ['David Tchana',22,'Sénégal','Dakar','Gardien','GAR','Droit','1,91 m','Professionnel','Senior'],
 ['Idriss Nkou',18,'Cameroun','Garoua','Attaquant','ATT','Gauche','1,80 m','Académie','U19'],
 ['Malick Diop',20,'Sénégal','Thiès','Milieu','MIL','Droit','1,75 m','Semi-professionnel','Senior'],
 ['Emmanuel Asare',17,'Ghana','Accra','Défenseur','DEF','Gauche','1,82 m','Académie','U17'],
 ['Chidi Okafor',23,'Nigeria','Lagos','Attaquant','ATT','Droit','1,84 m','Professionnel','Senior'],
 ['Yannick Tamo',19,'Cameroun','Bafoussam','Milieu','MIL','Droit','1,73 m','Amateur','U21']];
function art(i){var c=COL[i%COL.length];return 'style="--c1:'+c[0]+';--c2:'+c[1]+';--jr:'+c[2]+';--sk:'+c[3]+'"'}
function pcard(p,i){return '<article class="pcard" data-tilt><div class="pimg" '+art(i)+'><span class="num">'+(i*3%11+7)+'</span><span class="st">● Disponible</span><span class="ps">'+p[5]+'</span></div><div class="bd"><div class="nm"><div><h3>'+p[0]+'</h3><div class="sub">'+p[1]+' ans · '+p[2]+'</div></div><span class="vf">✓</span></div><div class="sub">'+p[3]+' · '+p[9]+'</div><div class="ps3"><div><b>'+p[7]+'</b><small>Taille</small></div><div><b>'+p[6]+'</b><small>Pied</small></div><div><b>'+p[5]+'</b><small>Poste</small></div></div><a class="go" href="#joueurs" data-scroll="#contact">Voir le profil →</a></div></article>'}
/* hero cards */
$$('[data-pl]').forEach(function(el){var i=+el.dataset.pl,p=P[i];el.innerHTML='<div class="pimg" '+art(i)+'><span class="num">'+(i*3%11+7)+'</span></div><div class="pb"><div><b>'+p[0].split(' ')[0]+' '+p[0].split(' ')[1][0]+'.</b><small>'+p[4]+' · '+p[1]+' ans</small></div><span class="vf">★</span></div>'});
/* ring */
var ring=$('#ring'),N=9;
ring.innerHTML=P.slice(0,N).map(function(p,i){var w=document.createElement('div');w.style.cssText='';return '<div class="pcard-wrap" style="position:absolute;inset:0;transform:rotateY(calc('+i+'*var(--step))) translateZ(var(--r));backface-visibility:hidden">'+pcard(p,i).replace('data-tilt','')+'</div>'}).join('');
var ang=0,vel=0,drag=false,lx=0,paused=false;
function layout(){var w=ring.offsetWidth||240,step=360/N,r=Math.round((w/2+22)/Math.tan(Math.PI/N));ring.style.setProperty('--step',step+'deg');ring.style.setProperty('--r',r+'px');}
layout();addEventListener('resize',layout);
var cw=$('#carwrap');
cw.addEventListener('pointerdown',function(e){drag=true;lx=e.clientX;cw.setPointerCapture&&cw.setPointerCapture(e.pointerId)});
cw.addEventListener('pointermove',function(e){if(!drag)return;var d=e.clientX-lx;lx=e.clientX;ang+=d*.35;vel=d*.35});
['pointerup','pointercancel'].forEach(function(n){cw.addEventListener(n,function(){drag=false})});
cw.addEventListener('mouseenter',function(){paused=true});cw.addEventListener('mouseleave',function(){paused=false});
$('#prev').addEventListener('click',function(){ang+=60});$('#next').addEventListener('click',function(){ang-=60});
var shown=ang;
(function loop(){ if(!drag&&!paused&&!reduce)ang-=.12; vel*=.92; shown+=(ang-shown)*.12; ring.style.setProperty('--a',shown+'deg'); requestAnimationFrame(loop)})();
/* vidéos */
var V=[['Buts','Frappe puissante du pied droit','Jordan M. · Attaquant · Cameroun','00:42',0],['Skills','Série de dribbles dans la surface','Kevin N. · Milieu · Cameroun','00:31',1],['Passes','Passe en profondeur parfaite','Malick D. · Milieu · Sénégal','00:27',2],['Défense','Intervention défensive décisive','Samuel K. · Défenseur · Côte d\'Ivoire','00:38',3],['Arrêts','Double arrêt spectaculaire','David T. · Gardien · Sénégal','00:36',4],['Buts','Finition en une touche','Chidi O. · Attaquant · Nigeria','00:29',5]];
function vcard(v){return '<article class="vcard" data-tilt><div class="vimg" style="--c1:'+COL[v[4]][0]+';--c2:'+COL[v[4]][1]+'"><span class="cat">'+v[0]+'</span><div class="play">▶</div><span class="du">'+v[3]+'</span></div><div class="vb"><h3>'+v[1]+'</h3><p>'+v[2]+'</p></div></article>'}

/* opportunités */
var O=[['Détection','Détection U21 · Douala','Un club recherche 2 attaquants et 1 défenseur central, 18 à 21 ans.','Douala, Cameroun','Date à confirmer'],['Essai','Essai joueurs semi-professionnels','Opportunité pour les joueurs évoluant au niveau régional ou national.','Yaoundé, Cameroun','Date à confirmer'],['Académie','Recrutement jeunes joueurs','Une académie recrute de jeunes joueurs pour intégrer sa prochaine promotion.','Garoua, Cameroun','Date à confirmer'],['Tournoi','Tournoi inter-académies','Un tournoi pour se montrer devant clubs et recruteurs.','Bafoussam, Cameroun','Date à confirmer'],['Formation','Programme de formation','Un programme pour progresser sur le terrain et en dehors.','Douala, Cameroun','Date à confirmer'],['Détection','Journée de recrutement gardiens','Un club cherche un gardien de but pour renforcer son effectif.','Abidjan, Côte d\'Ivoire','Date à confirmer']];
function ocard(o){return '<article class="ocard" data-tilt data-type="'+o[0]+'"><span class="ty">'+o[0]+'</span><h3>'+o[1]+'</h3><p>'+o[2]+'</p><span class="ver">✓ Annonce vérifiée</span><div class="ft">'+o[3]+'<span>'+o[4]+'</span></div></article>'}

/* page joueurs : filtres */
var REAL=null,SHORT={'Gardien':'GAR','Attaquant':'ATT','Ailier':'AIL','Défenseur central':'DC','Latéral droit':'LD','Latéral gauche':'LG'};
function sp(pos){return SHORT[pos]||(/^Milieu/.test(pos||'')?'MIL':'')}
function rcard(p,i){var u=Spora.user,me=u&&u.id===p.id,btn;
 if(!u)btn='<a class="go" href="#connexion">Se connecter pour contacter →</a>';
 else if(u.role==='joueur')btn='<span class="go" style="opacity:.7">Réservé aux agents et clubs</span>';
 else if(u.status!=='verifie')btn='<span class="go" style="opacity:.7">Disponible après vérification de ton profil</span>';
 else btn='<button type="button" class="go" data-contact="'+p.id+'" data-nm="'+esc(p.name)+'" style="border:0;cursor:pointer;font:inherit;font-weight:800;width:100%">Contacter →</button>';
 if(me)btn='<a class="go" href="#espace">C\'est ton profil · gérer →</a>';
 return '<article class="pcard" data-tilt><div class="pimg" '+art(i)+'>'+(p.photo?'<img alt="" src="'+p.photo+'" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1">':'<span class="num">'+(p.id*3%11+7)+'</span>')+(p.featured?'<span class="st" style="z-index:2">★ Mis en avant</span>':'')+'<span class="ps" style="z-index:2">'+esc(sp(p.pos))+'</span></div><div class="bd"><div class="nm"><div><h3>'+esc(p.name)+'</h3><div class="sub">'+(p.age!=null?p.age+' ans · ':'')+esc(p.nat||'')+'</div></div><span class="vf" title="Profil vérifié">✓</span></div><div class="sub">'+esc([p.city,p.lvl].filter(Boolean).join(' · '))+'</div><div class="ps3"><div><b>'+esc(p.pos||'—')+'</b><small>Poste</small></div><div><b>'+esc(p.lvl||'—')+'</b><small>Niveau</small></div><div><b>'+esc(p.nat||'—')+'</b><small>Pays</small></div></div>'+(p.videos?'<button type="button" class="go" data-pvid="'+p.id+'" data-nm="'+esc(p.name)+'" style="border:0;cursor:pointer;font:inherit;font-weight:800;width:100%;margin-bottom:8px">▶ Voir les vidéos ('+p.videos+')</button>':'')+btn+'</div></article>'}
function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function posOk(f,pos){return !f||pos===f||(f==='Milieu'&&/^Milieu/.test(pos))||(f==='Défenseur'&&/^(Défenseur|Latéral)/.test(pos))||(f==='Attaquant'&&pos==='Ailier')}
function renderReal(){var q=$('#pq').value.toLowerCase().trim(),pos=$('#pPos').value,age=$('#pAge').value,pays=$('#pPays').value,lvl=$('#pLvl').value,n=0,h='';
 REAL.forEach(function(p,i){var ok=(!q||(p.name+' '+(p.city||'')+' '+(p.nat||'')).toLowerCase().indexOf(q)>=0)&&posOk(pos,p.pos)&&(!pays||p.nat===pays)&&(!lvl||(p.lvl||'').indexOf(lvl)===0);
  if(ok&&age){var a=age.split('-');ok=p.age!=null&&p.age>=+a[0]&&p.age<=+a[1]}
  if(ok){n++;h+=rcard(p,i)}});
 $('#pGrid').innerHTML=h;$('#pCount').textContent=n+(n>1?' joueurs à découvrir':' joueur à découvrir');$('#pEmpty').style.display=n?'none':'block';bindTilt($('#pGrid'));}
function loadReal(){Spora.api('GET','/players?limit=24').then(function(j){REAL=j.players&&j.players.length?j.players:null;var nt=document.querySelector('[data-page="joueurs"] .box>.note');if(nt)nt.textContent=REAL?'Profils vérifiés par l\'équipe Spora. Les coordonnées ne sont partagées qu\'avec l\'accord du joueur.':'Profils fictifs, à titre d\'illustration. Dès que des joueurs sont vérifiés, ils apparaissent ici à la place.';renderPlayers()},function(){})}
window.__refreshPlayers=loadReal;
function renderPlayers(){if(REAL)return renderReal();var q=$('#pq').value.toLowerCase().trim(),pos=$('#pPos').value,age=$('#pAge').value,pays=$('#pPays').value,lvl=$('#pLvl').value,n=0,h='';
 P.forEach(function(p,i){var ok=(!q||(p[0]+' '+p[3]+' '+p[2]+' '+p[9]).toLowerCase().indexOf(q)>=0)&&(!pos||p[4]===pos)&&(!pays||p[2]===pays)&&(!lvl||p[8]===lvl);
  if(ok&&age){var a=age.split('-');ok=p[1]>=+a[0]&&p[1]<=+a[1]}
  if(ok){n++;h+=pcard(p,i)}});
 $('#pGrid').innerHTML=h;$('#pCount').textContent=n+(n>1?' joueurs à découvrir':' joueur à découvrir');$('#pEmpty').style.display=n?'none':'block';bindTilt($('#pGrid'));}
['pq','pPos','pAge','pPays','pLvl'].forEach(function(id){$('#'+id).addEventListener('input',renderPlayers)});renderPlayers();loadReal();
/* agents */
var A=[['Moussa Diallo','Sénégal','Dakar',['Jeunes talents','Attaquants'],'Français, Wolof'],['Paul Etoundi','Cameroun','Douala',['Jeunes talents','Défenseurs'],'Français, Anglais'],['Kofi Mensah','Ghana','Accra',['Attaquants','Gardiens'],'Anglais, Twi'],['Aïcha Traoré',"Côte d'Ivoire",'Abidjan',['Jeunes talents','Gardiens'],'Français, Dioula'],['Ibrahim Bello','Nigeria','Lagos',['Attaquants','Défenseurs'],'Anglais, Haoussa'],['Serge Fotso','Cameroun','Yaoundé',['Défenseurs','Gardiens'],'Français, Anglais']];
function renderAgents(){var q=$('#aq').value.toLowerCase().trim(),pa=$('#aPays').value,sp=$('#aSp').value,n=0,h='';
 A.forEach(function(a,i){var ok=(!q||(a[0]+' '+a[2]+' '+a[3].join(' ')).toLowerCase().indexOf(q)>=0)&&(!pa||a[1]===pa)&&(!sp||a[3].indexOf(sp)>=0);
  if(ok){n++;var c=COL[i%COL.length],ini=a[0].split(' ').map(function(x){return x[0]}).join('');h+='<article class="agent" data-tilt><div class="top"><div class="av" style="--c1:'+c[0]+';--c2:'+c[1]+'">'+ini+'</div><div><h3>'+a[0]+'</h3><div class="sub">'+a[2]+', '+a[1]+'</div></div></div><span class="ver">✓ Agent vérifié</span><div class="tags">'+a[3].map(function(t){return '<span>'+t+'</span>'}).join('')+'</div><div class="sub">Langues : '+a[4]+'</div></article>'}});
 $('#aGrid').innerHTML=h;$('#aCount').textContent=n+(n>1?' agents':' agent');$('#aEmpty').style.display=n?'none':'block';bindTilt($('#aGrid'));}
['aq','aPays','aSp'].forEach(function(id){$('#'+id).addEventListener('input',renderAgents)});renderAgents();
/* clubs */
var C=[['Académie des Rives','Académie','Douala','Formation U13 à U19'],['FC Savane','Club','Garoua','Championnat régional'],['Étoile du Nord','Club','Yaoundé','Équipe senior et U21'],['Académie Horizon','Académie','Bafoussam','Pôle espoirs'],['Union Littoral','Club','Douala','Équipe senior'],['Centre Talents Sud','Académie','Kribi','Formation et détections']];
function renderClubs(){var q=$('#cq').value.toLowerCase().trim(),t=$('#cType').value,n=0,h='';
 C.forEach(function(c,i){var ok=(!q||(c[0]+' '+c[2]).toLowerCase().indexOf(q)>=0)&&(!t||c[1]===t);
  if(ok){n++;var k=COL[(i+2)%COL.length];h+='<article class="agent" data-tilt><div class="top"><div class="av" style="--c1:'+k[0]+';--c2:'+k[1]+';border-radius:16px">'+c[0][0]+'</div><div><h3>'+c[0]+'</h3><div class="sub">'+c[2]+', Cameroun</div></div></div><div class="tags"><span>'+c[1]+'</span><span>'+c[3]+'</span></div></article>'}});
 $('#cGrid').innerHTML=h;$('#cCount').textContent=n+(n>1?' structures':' structure');$('#cEmpty').style.display=n?'none':'block';bindTilt($('#cGrid'));}
['cq','cType'].forEach(function(id){$('#'+id).addEventListener('input',renderClubs)});renderClubs();
/* highlights page */
var hcat='';
function chips(el,list,cb,get){el.innerHTML=list.map(function(l,i){return '<button type="button" class="fc'+(i?'':' on')+'" data-v="'+(i?l:'')+'">'+l+'</button>'}).join('');el.addEventListener('click',function(e){var b=e.target.closest('.fc');if(!b)return;$$('#'+el.id+' .fc').forEach(function(x){x.classList.remove('on')});b.classList.add('on');cb(b.dataset.v)})}
function renderHl(){var q=$('#hq').value.toLowerCase().trim(),n=0,h='';V.forEach(function(v){if((!hcat||v[0]===hcat)&&(!q||(v[1]+' '+v[2]).toLowerCase().indexOf(q)>=0)){n++;h+=vcard(v)}});$('#hGrid').innerHTML=h;$('#hCount').textContent=n+(n>1?' vidéos':' vidéo');$('#hEmpty').style.display=n?'none':'block';bindTilt($('#hGrid'));}
chips($('#hChips'),['Tous','Buts','Skills','Passes','Défense','Arrêts'],function(v){hcat=v;$('#hCat').value=v;renderHl()});
$('#hCat').addEventListener('input',function(){hcat=this.value;$$('#hChips .fc').forEach(function(b){b.classList.toggle('on',b.dataset.v===hcat)});renderHl()});$('#hq').addEventListener('input',renderHl);renderHl();
/* opportunités page */
var ocat='';
function renderOp(){var n=0,h='';O.forEach(function(o){if(!ocat||o[0]===ocat){n++;h+=ocard(o)}});$('#oGrid').innerHTML=h;$('#oCount').textContent=n+(n>1?' opportunités':' opportunité');bindTilt($('#oGrid'));}
chips($('#oChips'),['Toutes','Détection','Essai','Académie','Tournoi','Formation'],function(v){ocat=v;renderOp()});renderOp();

/* inclinaison 3D */
function bindTilt(root){ if(reduce||!fine)return; $$('[data-tilt]').forEach(function(el){ if(el._t)return; el._t=1;
  el.addEventListener('pointermove',function(e){var r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transition='transform .1s';el.style.transform='perspective(900px) rotateY('+(x*14)+'deg) rotateX('+(-y*14)+'deg) translateZ(14px)'});
  el.addEventListener('pointerleave',function(){el.style.transition='transform .5s cubic-bezier(.2,.8,.2,1)';el.style.transform=''}); }); }
/* scène hero + éventail : suivi de la souris */
function follow(host,tgt){ if(!host||reduce||!fine)return; host.addEventListener('pointermove',function(e){var r=host.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tgt.style.setProperty('--ry',(x*22)+'deg');tgt.style.setProperty('--rx',(-y*14)+'deg')});host.addEventListener('pointerleave',function(){tgt.style.setProperty('--ry','0deg');tgt.style.setProperty('--rx','0deg')}) }
follow($('#scene'),$('#world'));follow($('#fan'),$('#fanin'));


/* fond du hero : diaporama + particules / réseau */
(function(){
 var hero=$('#hero');if(!hero)return;function DK(){return getComputedStyle(document.documentElement).getPropertyValue('--hdark').trim()==='1'}var slides=$$('.bgs'),dots=$$('#dots i'),cur=0,timer=null;
 function go(n){cur=(n+slides.length)%slides.length;slides.forEach(function(s,i){s.classList.toggle('on',i===cur)});dots.forEach(function(d,i){d.classList.toggle('on',i===cur)})}
 function auto(){clearInterval(timer);if(!reduce)timer=setInterval(function(){go(cur+1)},7000)}
 $('#snext').addEventListener('click',function(){go(cur+1);auto()});$('#sprev').addEventListener('click',function(){go(cur-1);auto()});
 dots.forEach(function(d,i){d.addEventListener('click',function(){go(i);auto()})});auto();
 var cvs=$$('.fx').map(function(c){var x=c.getContext('2d'),o={c:c,x:x,m:c.dataset.m,pts:[],w:0,h:0};return o});
 function size(o){var r=o.c.getBoundingClientRect(),d=Math.min(devicePixelRatio||1,2);o.w=r.width;o.h=r.height;o.c.width=r.width*d;o.c.height=r.height*d;o.x.setTransform(d,0,0,d,0,0);
  var n=o.m==='n'?(r.width<600?38:72):(r.width<600?30:60);o.pts=[];for(var i=0;i<n;i++)o.pts.push({x:Math.random()*o.w,y:Math.random()*o.h,vx:(Math.random()-.5)*.35,vy:o.m==='n'?(Math.random()-.5)*.35:-(.15+Math.random()*.5),r:o.m==='n'?2+Math.random()*2:.8+Math.random()*2,g:Math.random()<.12})}
 cvs.forEach(size);addEventListener('resize',function(){cvs.forEach(size)});
 function draw(o){var x=o.x,w=o.w,h=o.h;x.clearRect(0,0,w,h);
  o.pts.forEach(function(p){if(!reduce){p.x+=p.vx;p.y+=p.vy}if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0});
  if(o.m==='n'){x.lineWidth=1;for(var i=0;i<o.pts.length;i++)for(var j=i+1;j<o.pts.length;j++){var a=o.pts[i],b=o.pts[j],dx=a.x-b.x,dy=a.y-b.y,d=Math.sqrt(dx*dx+dy*dy);if(d<150){x.strokeStyle=(DK()?'rgba(243,195,132,':'rgba(235,134,51,')+(.4*(1-d/150))+')';x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke()}}}
  o.pts.forEach(function(p){x.beginPath();x.fillStyle=p.g?(DK()?'rgba(255,198,41,.95)':'rgba(240,170,0,.95)'):(DK()?(o.m==='n'?'rgba(247,217,178,.9)':'rgba(246,209,159,.65)'):'rgba(235,134,51,.55)');x.arc(p.x,p.y,p.g&&o.m==='n'?p.r+1.5:p.r,0,6.283);x.fill()})}
 (function loop(){if(!document.hidden&&scrollY<innerHeight)cvs.forEach(function(o){if(o.c.parentNode.classList.contains('on'))draw(o)});requestAnimationFrame(loop)})();
 /* parallaxe des cartes */
 var hc=$('#hcards');if(hc&&!reduce&&fine)hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;hc.style.setProperty('--px',(x*40)+'px');hc.style.setProperty('--py',(y*30)+'px')});
 /* en-tête transparent au sommet de l'accueil */
 function atop(){var h=location.hash.slice(1);document.body.classList.toggle('atop',(h===''||h==='accueil')&&scrollY<40)}
 addEventListener('scroll',atop,{passive:true});addEventListener('hashchange',atop);atop();
})();

/* animations accueil + décors de pages */
(function(){
var DEC={
joueurs:'<div class="deco d-pitch"><div class="st"></div><svg viewBox="0 0 600 300" fill="none" stroke="currentColor" stroke-width="2"><path d="M0 250C140 30 300 290 450 110S580 170 600 50" stroke-dasharray="7 9"/><circle cx="300" cy="150" r="46" opacity=".5"/><circle r="9" fill="#ffc629" stroke="none"><animateMotion dur="6s" repeatCount="indefinite" path="M0 250C140 30 300 290 450 110S580 170 600 50"/></circle></svg></div>',
agents:function(){var n=[[60,200],[150,70],[230,160],[320,40],[380,210],[470,110],[540,230],[590,60],[270,260],[120,250],[430,20]],o='<div class="deco d-net"><svg viewBox="0 0 640 300" stroke="currentColor" fill="currentColor">';for(var i=0;i<n.length;i++)for(var j=i+1;j<n.length;j++){var dx=n[i][0]-n[j][0],dy=n[i][1]-n[j][1];if(dx*dx+dy*dy<24000)o+='<line x1="'+n[i][0]+'" y1="'+n[i][1]+'" x2="'+n[j][0]+'" y2="'+n[j][1]+'" stroke-opacity=".35" stroke-width="1.5"/>'}n.forEach(function(p,i){o+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="6" style="animation-delay:-'+(i*.45)+'s"/>'});return o+'</svg></div>'},
clubs:'<div class="deco d-lights"><div class="b b1"></div><div class="b b2"></div><div class="b b3"></div><div class="cr"></div></div>',
highlights:function(){var o='<div class="deco d-film">';[[48,0],[60,1],[72,0],[84,1]].forEach(function(a){o+='<div class="fs'+(a[1]?' r':'')+'" style="left:'+a[0]+'%"><i><b></b></i></div>'});return o+'<div class="fl"></div><div class="rec">REC</div></div>'},
inscription:'<div class="deco d-join"><div class="ob"><b class="o1">J</b><b class="o2">A</b><b class="o3">C</b><b class="o4">I</b></div></div>',
opportunites:'<div class="deco d-radar"><div class="rd"></div><b class="bl" style="right:22%;top:30%;animation-delay:.6s"></b><b class="bl" style="right:12%;top:58%;animation-delay:2s"></b><b class="bl" style="right:30%;top:66%;animation-delay:3.4s"></b><b class="bl" style="right:17%;top:40%;animation-delay:4.3s"></b></div>',
confiance:'<div class="deco d-shield"><svg class="hx" aria-hidden="true"><defs><pattern id="hxp" width="56" height="98" patternUnits="userSpaceOnUse"><path fill="currentColor" fill-rule="evenodd" transform="scale(2)" d="M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z"/></pattern></defs><rect width="100%" height="100%" fill="url(#hxp)"/></svg><svg class="sh2" viewBox="0 0 100 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M50 6L90 20V58C90 86 70 106 50 114C30 106 10 86 10 58V20Z"/><path class="ck" d="M32 60L45 73L69 46"/></svg></div>',
premium:function(){var o='<div class="deco d-gold"><div class="sn"></div>';for(var i=0;i<22;i++)o+='<i class="sp" style="left:'+(30+(i*53%68))+'%;animation-delay:-'+((i*29%70)/10).toFixed(1)+'s;animation-duration:'+(5+(i*17%40)/10).toFixed(1)+'s"></i>';return o+'</div>'}
};
Object.keys(DEC).forEach(function(k){var ph=document.querySelector('.page[data-page="'+k+'"] .ph');if(!ph)return;var h=typeof DEC[k]==='function'?DEC[k]():DEC[k];ph.insertAdjacentHTML('afterbegin',h)});
/* progression de lecture */
var sp=document.createElement('div');sp.id='sp';document.body.appendChild(sp);
function prog(){var m=document.documentElement.scrollHeight-innerHeight;sp.style.transform='scaleX('+(m>0?Math.min(1,scrollY/m):0)+')'}
addEventListener('scroll',prog,{passive:true});addEventListener('hashchange',function(){setTimeout(prog,50)});prog();
/* halo sous le curseur + boutons magnétiques */
if(matchMedia('(hover:hover)').matches&&!reduce){
 var sel='.panel,.step,.explore a,.cp,.pc';
 $$(sel).forEach(function(e){e.classList.add('spot')});
 document.addEventListener('pointermove',function(ev){var t=ev.target.closest&&ev.target.closest('.spot');if(t){var r=t.getBoundingClientRect();t.style.setProperty('--mx',(ev.clientX-r.left)+'px');t.style.setProperty('--my',(ev.clientY-r.top)+'px')}
  var b=ev.target.closest&&ev.target.closest('.hero .btn,.cta .btn');if(b){var q=b.getBoundingClientRect();b.style.translate=((ev.clientX-q.left-q.width/2)*.18)+'px '+((ev.clientY-q.top-q.height/2)*.28)+'px'}});
 document.addEventListener('pointerout',function(ev){var b=ev.target.closest&&ev.target.closest('.hero .btn,.cta .btn');if(b)b.style.translate=''});
}
})();

/* inscription */
(function(){
var host=document.getElementById('jnForm');if(!host)return;
var CT=['Cameroun',"Côte d'Ivoire",'Sénégal','Ghana','Nigeria','RD Congo','Mali','Burkina Faso','Gabon','Maroc','Autre pays'];
var POS=['Gardien','Défenseur central','Latéral droit','Latéral gauche','Milieu défensif','Milieu central','Milieu offensif','Ailier','Attaquant'];
var LVL=['Académie / formation','Amateur','Régional','Division 2','Division 1','Semi-professionnel','Professionnel'];
var ROLES={joueur:{n:'Joueur',d:'Je veux être repéré par les clubs et les agents.',i:'<circle cx="12" cy="12" r="9"/><path d="M12 7l4 3-1.5 5h-5L8 10z"/>'},
 agent:{n:'Agent',d:'Je cherche des talents et je développe mon réseau.',i:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M3 13h18"/>'},
 club:{n:'Club ou académie',d:'Je recrute et je fais connaître ma structure.',i:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>'},
 invite:{n:'Invité',d:'Je découvre Spora, sans créer de compte.',i:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'}};
var S={mode:'sign',role:null,step:0,v:{},err:{},photo:null,msg:''};
function F(id,l,t,o){o=o||{};o.id=id;o.l=l;o.t=t;return o}
var ACC=[F('name','Nom complet','text',{req:1,ph:'Prénom et nom',full:1}),F('email','Adresse e-mail','email',{req:1,ph:'toi@exemple.com'}),F('tel','Téléphone','tel',{ph:'+237 6XX XX XX XX'}),F('pw','Mot de passe','password',{req:1,ph:'8 caractères minimum',full:1})];
var INFO={
joueur:[F('photo','Photo de profil (obligatoire)','photo',{full:1,req:1}),F('dob','Date de naissance','date',{req:1}),F('nat','Nationalité','select',{req:1,o:CT}),F('res','Pays de résidence','select',{o:CT}),F('city','Ville où tu évolues','text',{ph:'Douala, Yaoundé…'}),
 F('pos','Poste principal','select',{req:1,o:POS}),F('pos2','Postes secondaires (2 max)','chips',{o:POS,max:2,full:1}),F('foot','Pied dominant','radio',{o:['Droit','Gauche','Ambidextre']}),F('h','Taille (cm)','number',{ph:'178'}),F('w','Poids (kg)','number',{ph:'70'}),
 F('club','Club ou académie actuelle','text',{ph:'Nom de ton club',full:1}),F('lvl','Niveau de compétition','select',{o:LVL,full:1}),F('bio','Parcours et objectifs','textarea',{ph:'Ton parcours, tes qualités, ce que tu recherches…',full:1})],
agent:[F('photo','Photo','photo',{full:1}),F('org','Nom professionnel ou agence','text',{req:1,ph:'Nom affiché sur ton profil',full:1}),F('ctr','Pays d\'activité','chips',{req:1,o:CT.slice(0,10),full:1}),F('exp','Expérience','select',{o:['Moins de 2 ans','2 à 5 ans','5 à 10 ans','Plus de 10 ans']}),F('lic','Licence ou accréditation','select',{req:1,o:['Agent licencié FIFA','Licence d\'une fédération nationale','Autre accréditation','Pas encore de licence']}),
 F('licn','Numéro de licence (si applicable)','text',{full:1}),F('dom','Domaines d\'intervention','chips',{o:['Gardiens','Défenseurs','Milieux','Attaquants','Jeunes U17-U21','Transferts vers l\'Europe','Transferts en Afrique','Académies'],full:1}),
 F('pemail','E-mail professionnel','email'),F('ptel','Téléphone professionnel','tel'),F('priv','Visibilité de tes coordonnées','select',{o:['Visibles par les membres vérifiés','Visibles après mise en contact','Masquées'],full:1}),F('bio','Présentation','textarea',{ph:'Ton activité, les profils que tu recherches…',full:1})],
club:[F('photo','Logo ou photo de la structure','photo',{full:1}),F('org','Nom de la structure','text',{req:1,full:1}),F('typ','Type','select',{req:1,o:['Club professionnel','Club amateur','Académie','Centre de formation']}),F('crea','Année de création','number',{ph:'2010'}),F('ctry','Pays','select',{req:1,o:CT}),F('city','Ville','text',{req:1}),
 F('champ','Championnat ou niveau','text',{ph:'Ex. Élite Two, régional…',full:1}),F('resp','Responsable (nom et fonction)','text',{req:1,ph:'Ex. A. Mbarga, directeur sportif',full:1}),F('pemail','E-mail professionnel','email',{req:1}),F('ptel','Téléphone','tel'),F('seek','Postes recherchés','chips',{o:POS,full:1}),F('web','Site ou réseau social','text',{full:1}),F('bio','Présentation','textarea',{ph:'Ta structure, ton projet sportif…',full:1})],
invite:[F('ctry','Ton pays','select',{req:1,o:CT}),F('who','Tu es plutôt…','radio',{o:['Parent','Entraîneur','Supporter','Journaliste','Curieux'],full:1}),F('see','Ce que tu veux découvrir','chips',{o:['Joueurs','Agents','Clubs','Highlights','Opportunités'],full:1}),F('email','E-mail (pour être prévenu au lancement)','email',{full:1,ph:'facultatif'})]};
function steps(){return S.role==='invite'?['Profil','Infos','Terminé']:['Profil','Compte','Informations','Terminé']}
function key(){var st=steps();var k=st[S.step];return k==='Profil'?'role':k==='Compte'?'acc':k==='Terminé'?'done':'info'}
function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ic(p){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>'}
function fld(f){var v=S.v[f.id],e=S.err[f.id],o='<div class="'+(f.full?'full ':'')+(e?'bad':'')+'" data-w="'+f.id+'"><label class="l" for="f_'+f.id+'">'+f.l+(f.req?' <i>*</i>':' <small>(facultatif)</small>')+'</label>';
 if(f.t==='select')o+='<select id="f_'+f.id+'" data-f="'+f.id+'"><option value="">Choisir…</option>'+f.o.map(function(x){return '<option'+(v===x?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select>';
 else if(f.t==='textarea')o+='<textarea id="f_'+f.id+'" data-f="'+f.id+'" placeholder="'+esc(f.ph||'')+'">'+esc(v)+'</textarea>';
 else if(f.t==='chips'||f.t==='radio')o+='<div class="jn-ch" id="f_'+f.id+'">'+f.o.map(function(x){var on=f.t==='chips'?(v||[]).indexOf(x)>=0:v===x;return '<button type="button" class="'+(on?'on':'')+'" data-c="'+f.id+'" data-v="'+esc(x)+'" aria-pressed="'+on+'">'+esc(x)+'</button>'}).join('')+'</div>';
 else if(f.t==='photo')o+='<div class="jn-up"><div class="jn-av" id="jnAv">'+(S.photo?'<img alt="" src="'+S.photo+'">':'+')+'</div><div><label class="fb" for="f_photo">Choisir une image</label><input type="file" id="f_photo" accept="image/*"><div class="jn-sub">Image réduite sur ton appareil, puis enregistrée avec ton profil.</div></div></div>';
 else o+='<input id="f_'+f.id+'" data-f="'+f.id+'" type="'+f.t+'" value="'+esc(v)+'" placeholder="'+esc(f.ph||'')+'" autocomplete="off">'+(f.t==='password'?'<div class="jn-str"><i id="jnStr"></i></div>':'');
 return o+(e?'<div class="er">'+e+'</div>':'')+'</div>'}
function shrink(f,cb){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var m=512,k=Math.min(1,m/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.82))};im.onerror=function(){cb(null)};im.src=fr.result};fr.onerror=function(){cb(null)};fr.readAsDataURL(f)}
function infoFields(){return INFO[S.role]}
function head(t,d){return '<h2>'+t+'</h2><p class="lead">'+d+'</p>'}
function act(back,next){return '<div class="jn-act">'+(back?'<button type="button" class="back" data-a="back">← Retour</button>':'<span></span>')+(next?'<button type="submit" class="btn">'+next+'</button>':'')+'</div>'}
function age(){var d=S.v.dob;if(!d)return null;var b=new Date(d),n=new Date();if(isNaN(b))return null;var a=n.getFullYear()-b.getFullYear();if(n<new Date(n.getFullYear(),b.getMonth(),b.getDate()))a--;return a>=0&&a<80?a:null}
function render(){var k=key(),o='';
 var st=steps();document.getElementById('jnSteps').innerHTML=st.map(function(n,i){return '<li class="'+(i===S.step?'on':i<S.step?'dn':'')+'"><b>'+(i<S.step?'✓':i+1)+'</b>'+n+'</li>'}).join('');
 if(k==='role'){o=head('Vous êtes…','Choisis ton profil pour adapter ton inscription.')+'<div class="jn-roles" role="radiogroup">'+Object.keys(ROLES).map(function(r){var x=ROLES[r];return '<button type="button" class="jn-role'+(r==='invite'?' guest':'')+(S.role===r?' on':'')+'" role="radio" aria-checked="'+(S.role===r)+'" data-r="'+r+'"><span class="ic">'+ic(x.i)+'</span><span><b>'+x.n+'</b><span>'+x.d+'</span></span></button>'}).join('')+'</div>'+(S.err.role?'<div class="er" style="margin-top:10px">'+S.err.role+'</div>':'')+act(0,'Continuer →')}
 else if(k==='acc'){o=head('Créer mon compte','Quelques informations pour sécuriser ton espace '+ROLES[S.role].n.toLowerCase()+'.')+'<div class="jn-g">'+ACC.map(fld).join('')+'</div><div class="jn-ck" style="margin-top:16px"><input type="checkbox" id="f_cgu" data-k="cgu"'+(S.v.cgu?' checked':'')+'><label for="f_cgu">J\'accepte les conditions d\'utilisation et la politique de confidentialité de Spora.</label></div>'+(S.err.cgu?'<div class="er">'+S.err.cgu+'</div>':'')+'<div class="jn-sep">ou continuer avec</div><div class="jn-oauth"><button type="button" data-a="oauth">Google</button><button type="button" data-a="oauth">Apple</button></div>'+(S.msg?'<div class="jn-msg">'+esc(S.msg)+'</div>':'')+act(1,'Continuer →')}
 else if(k==='info'){var tt={joueur:['Ton profil de joueur','Ces informations permettent aux agents et aux clubs de te trouver par poste, âge, pays ou niveau.'],agent:['Ton profil professionnel','Les joueurs découvrent ton activité. Ton statut « Vérifié » viendra après contrôle de tes documents.'],club:['Ta structure','Présente ton club ou ton académie aux joueurs, agents et recruteurs.'],invite:['Quelques infos sur toi','Pas de compte à créer : dis-nous simplement ce qui t\'intéresse.']}[S.role];
  o=head(tt[0],tt[1]);var a=age();
  if(S.role==='agent')o+='<div class="jn-msg w">Pour obtenir le badge « Vérifié », Spora contrôlera ton identité et ta licence. D\'ici là, ton profil affiche « Vérification en cours ».</div><div style="height:14px"></div>';
  if(S.role==='club')o+='<div class="jn-msg w">Un document justificatif (statuts, agrément ou attestation fédérale) sera demandé pour vérifier la structure avant le badge « Vérifié ».</div><div style="height:14px"></div>';
  if(S.role==='invite')o+='<ul class="jn-cmp"><li><b>✓</b>Parcourir un aperçu des profils et des highlights</li><li><b>✓</b>Consulter les opportunités publiées</li><li class="no"><b>×</b>Contacter un joueur, un agent ou un club</li><li class="no"><b>×</b>Publier, enregistrer ou utiliser la messagerie</li></ul><div style="height:14px"></div>';
  o+='<div class="jn-g">'+infoFields().map(fld).join('')+'</div>';o+=(S.msg?'<div class="jn-msg">'+esc(S.msg)+'</div>':'')+act(1,S.busy?'Envoi…':S.role==='invite'?'Continuer en invité':'Créer mon profil')}
 else{var nx={joueur:['Ajoute tes premières vidéos dans Highlights.','Complète ton parcours et tes statistiques.','Consulte les opportunités qui correspondent à ton poste.'],agent:['Envoie tes documents pour la vérification.','Précise les profils que tu recherches.','Parcours les joueurs par poste, âge et pays.'],club:['Envoie un justificatif pour la vérification.','Indique les postes que tu recherches.','Publie ta première détection ou ton premier essai.'],invite:['Parcours les profils et les highlights en aperçu.','Découvre les opportunités publiées.','Crée un compte quand tu veux contacter ou publier.']}[S.role];
  o='<div class="jn-ok">'+ic('<path d="M5 12l5 5 9-10"/>')+'</div>'+head(S.role==='invite'?'Bienvenue, invité !':'Ton profil est prêt.','Voici ce que tu peux faire ensuite :')+'<ol class="jn-next">'+nx.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ol><div class="jn-msg w" style="margin-top:18px">'+(S.role==='invite'?'<b>Merci !</b> Ton adresse est bien enregistrée : nous te préviendrons au lancement.':'<b>Compte créé.</b> Un e-mail de confirmation t\'a été envoyé. Ton profil apparaîtra dans l\'annuaire après vérification par l\'équipe Spora.')+'</div><div class="jn-act">'+(S.role==='invite'?'<a class="btn" href="#accueil">Retour à l\'accueil</a>':'<a class="btn" href="#espace">Ouvrir mon espace</a>')+'<button type="button" class="back" data-a="again">Créer un autre profil</button></div>'}
 host.innerHTML=o;pv()}
function pct(){var fs=(S.role&&INFO[S.role]||[]).filter(function(f){return f.t!=='photo'}),n=0;fs.forEach(function(f){var v=S.v[f.id];if(Array.isArray(v)?v.length:v)n++});if(S.photo)n++;var tot=fs.length+1;if(S.role!=='invite'){tot+=2;if(S.v.name)n++;if(S.v.email)n++}return Math.round(100*n/tot)}
function ini(x){var p=String(x||'').trim().split(/\s+/);return ((p[0]||'').charAt(0)+(p[1]||'').charAt(0)).toUpperCase()}
function pv(){var v=S.v,r=S.role,box=document.getElementById('jnPv'),h;
 var av=function(t){return '<div class="av">'+(S.photo?'<img alt="" src="'+S.photo+'">':t)+'</div>'};
 if(!r)h='<div class="cd"><div class="hd no"><small>Ta carte Spora</small></div><div class="bd" style="padding-top:26px"><h3>Choisis ton profil</h3><div class="sb">Ton aperçu apparaîtra ici et se remplira au fil de l\'inscription.</div></div></div>';
 else if(r==='joueur'){var a=age();h='<div class="cd"><div class="hd"><small>Joueur</small>'+av(ini(v.name)||'S')+'</div><div class="bd"><h3>'+esc(v.name||'Ton nom')+'</h3><div class="sb">'+esc(v.pos||'Poste')+(a!==null?' · '+a+' ans':'')+'</div><div class="tg">'+[v.nat,v.city,v.lvl].filter(Boolean).map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+((v.pos2||[]).map(function(x){return '<span>'+esc(x)+'</span>'}).join(''))+'</div><div class="st"><div><b>'+(v.h?esc(v.h)+' cm':'—')+'</b><small>Taille</small></div><div><b>'+esc(v.foot||'—')+'</b><small>Pied</small></div><div><b>'+(v.w?esc(v.w)+' kg':'—')+'</b><small>Poids</small></div></div>'+(v.club?'<div class="sb" style="margin-top:14px">'+esc(v.club)+'</div>':'')+'<div class="pg"><div><span>Profil complété</span><span>'+pct()+'%</span></div><u><i style="width:'+pct()+'%"></i></u></div><div class="fk">PROFIL D\'ILLUSTRATION · APERÇU</div></div></div>'}
 else if(r==='agent')h='<div class="cd"><div class="hd ag"><small>Agent</small>'+av(ini(v.org||v.name)||'A')+'</div><div class="bd"><h3>'+esc(v.org||v.name||'Ton nom professionnel')+'</h3><div class="sb">'+esc((v.ctr||[]).join(', ')||'Pays d\'activité')+(v.exp?' · '+esc(v.exp):'')+'</div><div class="tg">'+(v.dom||[]).map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div><div class="vf">Vérification en cours'+(v.lic?' · '+esc(v.lic):'')+'</div><div class="pg"><div><span>Profil complété</span><span>'+pct()+'%</span></div><u><i style="width:'+pct()+'%"></i></u></div><div class="fk">PROFIL D\'ILLUSTRATION · APERÇU</div></div></div>';
 else if(r==='club')h='<div class="cd"><div class="hd cl"><small>'+esc(v.typ||'Club ou académie')+'</small>'+av(ini(v.org)||'C')+'</div><div class="bd"><h3>'+esc(v.org||'Nom de la structure')+'</h3><div class="sb">'+esc([v.city,v.ctry].filter(Boolean).join(', ')||'Ville, pays')+(v.champ?' · '+esc(v.champ):'')+'</div><div class="tg">'+(v.seek||[]).map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div><div class="vf">Vérification de la structure en attente</div><div class="pg"><div><span>Profil complété</span><span>'+pct()+'%</span></div><u><i style="width:'+pct()+'%"></i></u></div><div class="fk">PROFIL D\'ILLUSTRATION · APERÇU</div></div></div>';
 else h='<div class="cd"><div class="hd gu"><small>Invité</small><div class="av">'+ic('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>').replace('<svg','<svg width="34" height="34"')+'</div></div><div class="bd"><h3>Accès invité</h3><div class="sb">'+esc([v.who,v.ctry].filter(Boolean).join(' · ')||'Découverte sans compte')+'</div><div class="tg">'+(v.see||[]).map(function(x){return '<span>'+esc(x)+'</span>'}).join('')+'</div><div class="vf">Lecture seule : pour contacter ou publier, crée un compte.</div></div></div>';
 box.innerHTML=h}
function val(list,add){var e={};list.forEach(function(f){var v=f.t==='photo'?S.photo:S.v[f.id];if(f.req&&!(Array.isArray(v)?v.length:v))e[f.id]=f.t==='photo'?'La photo de profil est obligatoire pour les joueurs.':'Ce champ est obligatoire.'});
 if(add)add(e);return e}
function next(){var k=key();S.msg='';
 if(k==='role'){if(!S.role){S.err={role:'Choisis un profil pour continuer.'};return render()}S.err={};S.step++;return go()}
 if(k==='acc'){S.err=val(ACC,function(e){var m=S.v.email;if(m&&!/^\S+@\S+\.\S+$/.test(m))e.email='Adresse e-mail invalide.';if(S.v.pw&&S.v.pw.length<8)e.pw='8 caractères minimum.';if(!S.v.cgu)e.cgu='Tu dois accepter les conditions pour continuer.'});if(Object.keys(S.err).length)return render(),focusErr();S.step++;return go()}
 if(k==='info'){if(S.busy)return;S.err=val(infoFields(),function(e){var m=S.v.email||S.v.pemail;if(m&&!/^\S+@\S+\.\S+$/.test(m))e[S.v.email?'email':'pemail']='Adresse e-mail invalide.';if(S.role==='joueur'&&S.v.dob&&age()===null)e.dob='Date de naissance invalide.'});if(Object.keys(S.err).length)return render(),focusErr();return submit()}}
function payload(){var v=S.v,r=S.role,p={};INFO[r].forEach(function(f){if(f.t==='photo')return;var x=v[f.id];if(Array.isArray(x))p[f.id]=x;else if(x!==undefined&&x!==''&&x!==null)p[f.id]=f.t==='number'?Number(x):x});
 return {role:r,name:v.name,email:v.email,tel:v.tel||undefined,password:v.pw,accept_terms:true,profile:p,photo:S.photo||undefined}}
function submit(){S.busy=true;S.msg='';render();
 var call=S.role==='invite'?Spora.api('POST','/guest',{country:S.v.ctry,who:S.v.who||undefined,interests:S.v.see||[],email:S.v.email||undefined}):Spora.api('POST','/auth/register',payload());
 call.then(function(j){S.busy=false;if(j&&j.user)Spora.set(j.user);S.step++;go()},function(e){S.busy=false;var f=e.field||'';S.msg=e.message;
  if(/^profile\./.test(f)){var id=f.slice(8).split('.')[0];S.err[id]=e.message;}
  else if(f==='email'||f==='password'||f==='name'||f==='tel'||f==='accept_terms'){var m={password:'pw',accept_terms:'cgu'}[f]||f;S.err[m]=e.message;S.step=S.role==='invite'?S.step:1}
  render();focusErr()})}
function go(){render();var c=document.querySelector('.jn-card');if(c&&c.getBoundingClientRect().top<0)c.scrollIntoView({behavior:'smooth',block:'start'})}
function focusErr(){var b=host.querySelector('.bad,.er');if(b)b.scrollIntoView({behavior:'smooth',block:'center'})}
host.addEventListener('submit',function(e){e.preventDefault();next()});
host.addEventListener('click',function(e){var t=e.target.closest('button');if(!t)return;
 if(t.dataset.r){S.role=t.dataset.r;S.err={};S.v=S.v.name?{name:S.v.name,email:S.v.email,tel:S.v.tel}:{};S.photo=null;return render()}
 if(t.dataset.c){var id=t.dataset.c,f=INFO[S.role].filter(function(x){return x.id===id})[0],v=t.dataset.v;if(f.t==='radio')S.v[id]=S.v[id]===v?'':v;else{var a=(S.v[id]||[]).slice(),i=a.indexOf(v);if(i>=0)a.splice(i,1);else if(!f.max||a.length<f.max)a.push(v);S.v[id]=a}
  var w=host.querySelector('[data-w="'+id+'"]');if(w){w.querySelectorAll('button').forEach(function(b){var on=f.t==='radio'?S.v[id]===b.dataset.v:(S.v[id]||[]).indexOf(b.dataset.v)>=0;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)})}return pv()}
 if(t.dataset.a==='back'){S.err={};S.step=Math.max(0,S.step-1);return render()}
 if(t.dataset.a==='oauth'){S.msg='Google et Apple ne sont pas encore disponibles : crée ton compte avec ton e-mail.';return render()}
 if(t.dataset.a==='again'){S={mode:'sign',role:null,step:0,v:{},err:{},photo:null,msg:''};return render()}});
host.addEventListener('input',function(e){var t=e.target;if(t.dataset.f){S.v[t.dataset.f]=t.value;if(S.err[t.dataset.f]){delete S.err[t.dataset.f];var w=t.closest('[data-w]');if(w){w.classList.remove('bad');var er=w.querySelector('.er');if(er)er.remove()}}
  if(t.dataset.f==='pw'){var p=t.value,sc=(p.length>=8)+(/[A-Z]/.test(p))+(/\d/.test(p))+(/[^A-Za-z0-9]/.test(p)),b=document.getElementById('jnStr');if(b){b.style.width=(p?sc*25:0)+'%';b.style.background=sc<2?'#e5484d':sc<3?'#f5a623':'#12c48b'}}
  return pv()}
 if(t.dataset.k==='cgu'||t.dataset.k==='pc'){S.v[t.dataset.k]=t.checked;delete S.err[t.dataset.k];var er=t.closest('.jn-ck').nextElementSibling;if(er&&er.classList.contains('er'))er.remove()}});
host.addEventListener('change',function(e){var t=e.target;if(t.id==='f_photo'&&t.files&&t.files[0]){shrink(t.files[0],function(d){if(!d){S.err.photo='Image illisible.';return render()}S.photo=d;var a=document.getElementById('jnAv');if(a)a.innerHTML='<img alt="" src="'+S.photo+'">';pv()})}
 else if(t.dataset.f){S.v[t.dataset.f]=t.value;delete S.err[t.dataset.f];pv()}});
/* onglets + connexion */
var tS=document.getElementById('tabSign'),tL=document.getElementById('tabLog'),pS=document.getElementById('jnSign'),pL=document.getElementById('jnLogin');
pL.innerHTML='<h2>Bon retour parmi nous</h2><p class="lead">Connecte-toi à ton espace Spora.</p><form id="jnLog" novalidate><div class="jn-g"><div class="full"><label class="l" for="lg_e">Adresse e-mail</label><input id="lg_e" type="email" placeholder="toi@exemple.com"></div><div class="full"><label class="l" for="lg_p">Mot de passe</label><input id="lg_p" type="password"></div></div><div class="jn-act"><button type="button" class="back" id="lgForgot">Mot de passe oublié ?</button><button class="btn" type="submit">Se connecter</button></div><div class="jn-sep">ou</div><div class="jn-oauth"><button type="button" class="lgo">Google</button><button type="button" class="lgo">Apple</button></div><p class="lead" style="margin:18px 0 0">Pas encore de compte ? <a href="#inscription" style="color:var(--primary);font-weight:800">Créer un compte</a> · <a href="#inscription" id="lgGuest" style="color:var(--primary);font-weight:800">Continuer en invité</a></p><div class="jn-msg" id="lgMsg" hidden></div></form>';
function lm(t){var m=document.getElementById('lgMsg');m.textContent=t;m.hidden=false}
document.getElementById('jnLog').addEventListener('submit',function(e){e.preventDefault();var em=document.getElementById('lg_e').value.trim(),pw=document.getElementById('lg_p').value;if(!em||!pw)return lm('Saisis ton e-mail et ton mot de passe.');
 var b=this.querySelector('button.btn');b.disabled=true;Spora.api('POST','/auth/login',{email:em,password:pw}).then(function(j){b.disabled=false;Spora.set(j.user);document.getElementById('lg_p').value='';location.hash='#espace'},function(er){b.disabled=false;lm(er.message)})});
document.getElementById('lgForgot').addEventListener('click',function(){var em=document.getElementById('lg_e').value.trim();if(!em)return lm('Saisis d\'abord ton adresse e-mail ci-dessus.');Spora.api('POST','/auth/forgot',{email:em}).then(function(){lm('Si un compte existe avec cette adresse, un lien de réinitialisation vient d\'être envoyé.')},function(er){lm(er.message)})});
pL.querySelectorAll('.lgo').forEach(function(b){b.addEventListener('click',function(){lm('Google et Apple ne sont pas encore disponibles : utilise ton e-mail.')})});
document.getElementById('lgGuest').addEventListener('click',function(){S={mode:'sign',role:'invite',step:1,v:{},err:{},photo:null,msg:''};setMode('sign')});
function setMode(m){S.mode=m;tS.classList.toggle('on',m==='sign');tL.classList.toggle('on',m==='log');tS.setAttribute('aria-selected',m==='sign');tL.setAttribute('aria-selected',m==='log');pS.hidden=m!=='sign';pL.hidden=m!=='log';var sd=document.querySelector('.jn-side');if(sd)sd.hidden=m==='log';if(m==='sign')render()}
tS.addEventListener('click',function(){location.hash==='#connexion'?location.hash='#inscription':setMode('sign')});
tL.addEventListener('click',function(){location.hash==='#connexion'?0:location.hash='#connexion'});
window.__jnInfo=INFO;
window.__jn=function(h){setMode(h==='connexion'?'log':'sign')};
render();setMode('sign');
})();
/* routes */
var ROUTES=['accueil','joueurs','agents','clubs','highlights','opportunites','confiance','premium','inscription','connexion','espace','reinitialiser'],io=null;
if('IntersectionObserver' in window&&!reduce) io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target);}})},{threshold:.1});
function showRoute(first){var h=location.hash.slice(1).split('?')[0];if(ROUTES.indexOf(h)<0)h='accueil';
  $$('.page').forEach(function(p){var on=p.dataset.page===(h==='connexion'?'inscription':h);p.hidden=!on;if(on)p.querySelectorAll('.rv').forEach(function(el){if(io){el.classList.remove('in');io.observe(el)}else el.classList.add('in')})});
  $$('nav.main a,#menu a').forEach(function(a){if(a.getAttribute('href')==='#'+h)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')});
  if(window.__jn)window.__jn(h);if(window.__onRoute)window.__onRoute(h);document.body.classList.remove('menu');$('#burger').setAttribute('aria-expanded','false');if(!first)window.scrollTo(0,0);bindTilt();layout();}
addEventListener('hashchange',function(){showRoute(false)});
$('#burger').addEventListener('click',function(){var o=document.body.classList.toggle('menu');$('#burger').setAttribute('aria-expanded',String(o))});
showRoute(true);
document.addEventListener('click',function(e){var t=e.target.closest('[data-scroll]');if(!t)return;var el=document.querySelector(t.dataset.scroll);if(!el)return;e.preventDefault();document.body.classList.remove('menu');window.scrollTo({top:el.getBoundingClientRect().top+scrollY-(t.dataset.scroll==='#contact'?0:90),behavior:reduce?'auto':'smooth'})});
/* thème */
var root=document.documentElement,mq=matchMedia('(prefers-color-scheme: dark)');
function isDark(){var t=root.dataset.theme;return t==='dark'||(t!=='light'&&mq.matches)}
try{var st=localStorage.getItem('spora-theme');if(st==='light'||st==='dark')root.dataset.theme=st}catch(e){}
$('#theme').addEventListener('click',function(){var n=isDark()?'light':'dark';root.dataset.theme=n;try{localStorage.setItem('spora-theme',n)}catch(e){}});
var v=document.querySelector('video');if(v){var pl=function(){var p=v.play();if(p&&p.catch)p.catch(function(){})};pl();document.addEventListener('visibilitychange',pl)}
})();
