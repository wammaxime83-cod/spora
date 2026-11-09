/* Mon espace, réinitialisation du mot de passe, contact d'un joueur, état de connexion dans l'en-tête */
(function(){
var $=function(s){return document.querySelector(s)};
function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var ROLE={joueur:'Joueur',agent:'Agent',club:'Club ou académie'};
var STATUS={en_attente:['En cours de vérification','Ton profil sera visible par les autres membres une fois vérifié par l\'équipe Spora.'],verifie:['Profil vérifié','Ton profil est visible dans l\'annuaire.'],refuse:['Vérification refusée','Corrige ton profil ci-dessous : il repassera en vérification après enregistrement.']};
var PLAN={gratuit:'Gratuit',standard:'Standard',premium:'Premium',elite:'Élite'};
var P={},state={contacts:null},quiet=false;

/* ---- en-tête selon la connexion ---- */
Spora.on(function(u){
 var l=$('header .login'),c=$('header .btn.sm');
 if(l){l.textContent=u?'Mon espace':'Connexion';l.setAttribute('href',u?'#espace':'#connexion')}
 if(c){c.textContent=u?'Se déconnecter':'Créer un compte';if(u){c.setAttribute('href','#accueil');c.dataset.out='1'}else{c.setAttribute('href','#inscription');delete c.dataset.out}}
 if(window.__refreshPlayers)window.__refreshPlayers();
 if(!quiet&&location.hash.split('?')[0]==='#espace')draw();
});
document.addEventListener('click',function(e){var b=e.target.closest('[data-out]');if(!b)return;e.preventDefault();logout()});
function logout(){Spora.api('POST','/auth/logout',{}).then(function(){Spora.set(null);P={};state.contacts=null;location.hash='#accueil'},function(){})}

/* ---- Mon espace ---- */
function draw(){var h=$('#esp');if(!h)return;var u=Spora.user;
 if(!u){h.innerHTML='<div class="jn-card"><h2>Connecte-toi</h2><p class="lead">Ton espace est réservé aux membres.</p><a class="btn" href="#connexion">Se connecter</a> <a href="#inscription" style="margin-left:14px;color:var(--primary);font-weight:800">Créer un compte</a></div>';return}
 var st=STATUS[u.status]||STATUS.en_attente,plan=PLAN[u.plan]||'Gratuit';
 var o='<div class="jn-card"><h2>Bonjour '+esc(u.name.split(' ')[0])+'</h2><p class="lead">'+esc(ROLE[u.role])+' · '+esc(u.email)+'</p>'
  +'<div class="jn-msg'+(u.status==='verifie'?'':' w')+'" style="margin-top:0"><b>'+st[0]+'.</b> '+esc(u.status_note||st[1])+'</div>'
  +(u.email_verified?'':'<div class="jn-msg w"><b>Adresse e-mail non confirmée.</b> Clique sur le lien reçu par e-mail. <button type="button" class="back" data-e="resend" style="background:none;border:0;color:var(--primary);font:inherit;font-weight:800;cursor:pointer">Renvoyer l\'e-mail</button></div>')
  +(u.is_admin?'<p style="margin-top:14px"><a href="/admin" style="color:var(--primary);font-weight:800">Ouvrir l\'administration →</a></p>':'')
  +'</div>';
 o+='<div class="jn-card" id="espProf"><h2>Mon profil</h2><p class="lead">Ces informations alimentent ta fiche.</p><div id="espForm">Chargement…</div></div>';
 o+='<div class="jn-card" id="espVid"><h2>Mes vidéos</h2><p class="lead">Montre tes meilleures actions aux agents et aux clubs.</p><div id="espVidBody">Chargement…</div></div>';
 o+='<div class="jn-card"><h2>Mes mises en relation</h2><p class="lead">'+(u.role==='joueur'?'Les agents et clubs vérifiés qui souhaitent te contacter.':'Les demandes que tu as envoyées.')+'</p><div id="espCt">Chargement…</div></div>';
 o+='<div class="jn-card"><h2>Mon offre</h2><p class="lead">Offre actuelle : <b>'+plan+'</b>'+(u.plan!=='gratuit'&&u.plan_until?' · valable jusqu\'au '+esc(u.plan_until):'')+'</p><p style="color:var(--text2)">Le paiement en ligne n\'est pas encore ouvert. Pour passer à Standard, Premium ou Élite, écris à l\'équipe Spora : ton offre est activée dès réception du règlement.</p><p><a class="btn sm" href="#premium">Voir les offres</a> <a href="#accueil" data-scroll="#contact" style="margin-left:14px;color:var(--primary);font-weight:800">Contacter l\'équipe</a></p></div>';
 o+='<div class="jn-card"><h2>Mes données</h2><p class="lead">Tu peux télécharger ou supprimer toutes tes données à tout moment.</p><p><a class="btn sm" href="/api/me/export" download>Télécharger mes données</a> <button type="button" class="back" data-e="out" style="margin-left:14px;background:none;border:0;color:var(--text2);font:inherit;font-weight:800;cursor:pointer">Se déconnecter</button></p>'
  +'<details style="margin-top:18px"><summary style="cursor:pointer;font-weight:800;color:#e5484d">Supprimer mon compte</summary><p class="lead" style="margin-top:10px">Suppression définitive du compte, du profil, de la photo et des échanges. Saisis ton mot de passe pour confirmer.</p><div class="jn-g"><div class="full"><input type="password" id="delpw" placeholder="Mot de passe" autocomplete="current-password"></div></div><div class="jn-act"><span></span><button type="button" class="btn" data-e="del" style="background:#e5484d">Supprimer définitivement</button></div><div class="jn-msg" id="delMsg" hidden></div></details></div>';
 h.innerHTML=o;loadProfile();loadContacts();loadVideos()}

function loadProfile(){Spora.api('GET','/me/profile').then(function(j){P=j.profile||{};drawForm(j.user)},function(e){$('#espForm').textContent=e.message})}
var DATA={};
function drawForm(u){var INFO=window.__jnInfo&&window.__jnInfo[u.role]||[],h='<form id="espF" novalidate><div class="jn-g"><div class="full"><label class="l" for="e_name">Nom complet</label><input id="e_name" data-n="name" value="'+esc(u.name)+'"></div><div><label class="l" for="e_tel">Téléphone</label><input id="e_tel" data-n="tel" value="'+esc(u.tel||'')+'"></div></div><div class="jn-g" style="margin-top:14px">';
 DATA={};
 INFO.forEach(function(f){var v=P[f.id];if(f.t==='photo'){h+='<div class="full"><label class="l">Photo</label><div class="jn-up"><div class="jn-av" id="espAv">'+(P.has_photo?'<img alt="" src="/uploads/avatars/'+u.id+'?t='+Date.now()+'">':'+')+'</div><div><label class="fb" for="e_photo">Changer la photo</label><input type="file" id="e_photo" accept="image/*"> '+(P.has_photo&&u.role!=='joueur'?'<button type="button" class="back" data-e="rmphoto" style="background:none;border:0;color:var(--text2);font:inherit;font-weight:700;cursor:pointer">Retirer</button>':'')+'</div></div></div>';return}
  DATA[f.id]=v;h+='<div class="'+(f.full?'full':'')+'"><label class="l" for="e_'+f.id+'">'+f.l+(f.req?' <i>*</i>':'')+'</label>';
  if(f.t==='select')h+='<select id="e_'+f.id+'" data-f="'+f.id+'"><option value="">Choisir…</option>'+f.o.map(function(x){return '<option'+(v===x?' selected':'')+'>'+esc(x)+'</option>'}).join('')+'</select>';
  else if(f.t==='textarea')h+='<textarea id="e_'+f.id+'" data-f="'+f.id+'">'+esc(v)+'</textarea>';
  else if(f.t==='chips'||f.t==='radio')h+='<div class="jn-ch">'+f.o.map(function(x){var on=f.t==='chips'?(v||[]).indexOf(x)>=0:v===x;return '<button type="button" class="'+(on?'on':'')+'" data-c="'+f.id+'" data-t="'+f.t+'" data-m="'+(f.max||'')+'" data-v="'+esc(x)+'">'+esc(x)+'</button>'}).join('')+'</div>';
  else h+='<input id="e_'+f.id+'" data-f="'+f.id+'" type="'+f.t+'" value="'+esc(v)+'">';
  h+='<div class="er" data-er="'+f.id+'"></div></div>'});
 h+='</div><div class="jn-act"><span></span><button class="btn" type="submit">Enregistrer</button></div><div class="jn-msg" id="espMsg" hidden></div></form>';
 $('#espForm').innerHTML=h;var f=$('#espF');
 f.addEventListener('input',function(e){var t=e.target;if(t.dataset.f)DATA[t.dataset.f]=t.value});
 f.addEventListener('change',function(e){var t=e.target;if(t.dataset.f)DATA[t.dataset.f]=t.value;
  if(t.id==='e_photo'&&t.files[0]){shrink(t.files[0],function(d){if(d){DATA.__photo=d;$('#espAv').innerHTML='<img alt="" src="'+d+'">'}})}});
 f.addEventListener('click',function(e){var t=e.target.closest('button');if(!t)return;
  if(t.dataset.c){var id=t.dataset.c;if(t.dataset.t==='radio'){DATA[id]=DATA[id]===t.dataset.v?'':t.dataset.v}else{var a=(DATA[id]||[]).slice(),i=a.indexOf(t.dataset.v);if(i>=0)a.splice(i,1);else if(!t.dataset.m||a.length<+t.dataset.m)a.push(t.dataset.v);DATA[id]=a}
   t.parentNode.querySelectorAll('button').forEach(function(b){var on=t.dataset.t==='radio'?DATA[id]===b.dataset.v:(DATA[id]||[]).indexOf(b.dataset.v)>=0;b.classList.toggle('on',on)})}
  if(t.dataset.e==='rmphoto'){DATA.__rm=1;$('#espAv').textContent='+';t.remove()}});
 f.addEventListener('submit',function(e){e.preventDefault();save(u)})}
function msg(id,t,ok){var m=$(id);if(!m)return;m.textContent=t;m.hidden=false;m.className='jn-msg'+(ok?'':' w')}
function save(u){var prof={};Object.keys(DATA).forEach(function(k){if(k.slice(0,2)==='__')return;var v=DATA[k];if(v===undefined||v===''||v===null)return;var fd=(window.__jnInfo[u.role]||[]).filter(function(x){return x.id===k})[0];prof[k]=fd&&fd.t==='number'?Number(v):v});
 var body={profile:prof,name:$('#e_name').value,tel:$('#e_tel').value};if(DATA.__photo)body.photo=DATA.__photo;if(DATA.__rm)body.remove_photo=true;
 document.querySelectorAll('#espF [data-er]').forEach(function(x){x.textContent=''});
 Spora.api('PUT','/me/profile',body).then(function(j){quiet=true;Spora.set(j.user);quiet=false;P=j.profile;DATA.__photo=null;DATA.__rm=0;msg('#espMsg','Profil enregistré.',true);if(window.__refreshPlayers)window.__refreshPlayers()},
  function(e){var id=(e.field||'').replace(/^profile\./,'');var er=document.querySelector('#espF [data-er="'+id+'"]');if(er)er.textContent=e.message;msg('#espMsg',e.message,false)})}
function shrink(f,cb){var fr=new FileReader();fr.onload=function(){var im=new Image();im.onload=function(){var k=Math.min(1,512/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);cb(c.toDataURL('image/jpeg',.82))};im.onerror=function(){cb(null)};im.src=fr.result};fr.readAsDataURL(f)}

/* ---- mes vidéos : envoi direct vers Cloudinary (le fichier ne passe pas par notre serveur) ---- */
var VMAX=100*1024*1024,VMODE='cloud';
function vtile(v){return '<div style="margin-top:14px"><video controls preload="none" playsinline poster="'+esc(v.poster)+'" src="'+esc(v.src)+'" style="width:100%;aspect-ratio:16/9;background:#000;border-radius:14px;display:block"></video><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-top:6px"><b>'+esc(v.title||'Sans titre')+'</b><button type="button" class="back" data-vdel="'+v.id+'" style="background:none;border:0;color:#e5484d;font:inherit;font-weight:800;cursor:pointer">Supprimer</button></div></div>'}
function loadVideos(){var b=$('#espVidBody');if(!b)return;Spora.api('GET','/me/videos').then(function(j){
 var h=j.videos.map(vtile).join('');
 VMODE=j.mode;if(!j.enabled)h='<div class="jn-msg w" style="margin-top:0">L\'envoi de vidéos n\'est pas activé sur ce site.</div>';
 else if(j.videos.length<j.max)h+='<div style="margin-top:16px"><label class="l" for="vtitle">Titre (facultatif)</label><input id="vtitle" maxlength="80" placeholder="Ex. But en finale U19"><div class="jn-up" style="margin-top:12px;gap:12px"><label class="fb" for="vfile">Choisir une vidéo</label><input type="file" id="vfile" accept="video/mp4,video/quicktime,video/webm,video/*"> <span style="color:var(--text2);font-size:13px">MP4, MOV ou WebM · '+(j.mode==='local'?'30 Mo':'100 Mo et '+Math.floor(j.max_seconds/60)+' min')+' maximum · '+j.videos.length+'/'+j.max+'</span>'+(j.mode==='local'?'<div class="jn-msg w" style="margin-top:12px"><b>Mode test.</b> Les vidéos sont gardées sur le serveur du site et peuvent être effacées lors d\'une mise à jour.</div>':'')+'</div><div id="vprog" hidden style="margin-top:12px"><div style="height:10px;border-radius:99px;background:var(--surface2);overflow:hidden"><div id="vbar" style="height:100%;width:0;background:var(--primary);transition:width .2s"></div></div><small id="vtxt" style="color:var(--text2)"></small></div></div>';
 else h+='<p style="color:var(--text2);margin-top:14px">Limite de '+j.max+' vidéos atteinte : supprime-en une pour en ajouter.</p>';
 b.innerHTML=h+'<div class="jn-msg" id="vmsg" hidden></div>';
 var f=$('#vfile');if(f)f.addEventListener('change',function(){if(f.files[0])sendVideo(f.files[0])})},function(e){b.textContent=e.message})}
function sendVideo(file){
 var lim=VMODE==='local'?30*1024*1024:VMAX;if(file.size>lim)return msg('#vmsg','Vidéo trop lourde ('+(VMODE==='local'?'30':'100')+' Mo maximum). Réduis-la ou raccourcis-la.',false);
 if(file.type&&file.type.indexOf('video/')!==0)return msg('#vmsg','Ce fichier n\'est pas une vidéo.',false);
 var title=($('#vtitle')||{}).value||'',pr=$('#vprog'),bar=$('#vbar'),tx=$('#vtxt');$('#vmsg').hidden=true;pr.hidden=false;bar.style.width='0';tx.textContent='Préparation…';$('#vfile').disabled=true;
 var fail=function(e){pr.hidden=true;$('#vfile').disabled=false;msg('#vmsg',e.message||'Envoi impossible.',false)};
 if(VMODE==='local'){var xl=new XMLHttpRequest();xl.open('POST','/api/me/videos/local?title='+encodeURIComponent(title));xl.setRequestHeader('Content-Type',file.type||'video/mp4');
  xl.upload.onprogress=function(e){if(e.lengthComputable){var p=Math.round(e.loaded/e.total*100);bar.style.width=p+'%';tx.textContent='Envoi… '+p+' %'}};
  xl.onerror=function(){fail(new Error('Connexion perdue pendant l\'envoi. Réessaie.'))};
  xl.onload=function(){var j={};try{j=JSON.parse(xl.responseText)}catch(e){}if(xl.status>=300)return fail(new Error(j.error||'Envoi refusé.'));loadVideos();if(window.__refreshVideos)window.__refreshVideos()};
  xl.send(file);return}
 Spora.api('POST','/me/videos/sign',{}).then(function(t){
  var fd=new FormData();['api_key','timestamp','public_id','allowed_formats','signature'].forEach(function(k){fd.append(k,t[k])});fd.append('file',file);
  var x=new XMLHttpRequest();x.open('POST',t.url);
  x.upload.onprogress=function(e){if(e.lengthComputable){var p=Math.round(e.loaded/e.total*100);bar.style.width=p+'%';tx.textContent='Envoi… '+p+' %'}};
  x.onerror=function(){fail(new Error('Connexion perdue pendant l\'envoi. Réessaie.'))};
  x.onload=function(){var j={};try{j=JSON.parse(x.responseText)}catch(e){}
   if(x.status>=300)return fail(new Error((j.error&&j.error.message)||'Le service vidéo a refusé le fichier.'));
   tx.textContent='Vérification…';Spora.api('POST','/me/videos',{public_id:j.public_id||t.public_id,title:title}).then(function(){loadVideos();if(window.__refreshVideos)window.__refreshVideos()},fail)};
  x.send(fd)},fail)}
function loadContacts(){Spora.api('GET','/me/contacts').then(function(j){var h='',l=j.contacts||[];
 if(!l.length)h='<p style="color:var(--text2)">Aucune demande pour le moment.</p>';
 l.forEach(function(c){var o=c.other,lab={envoye:'En attente',accepte:'Acceptée',refuse:'Refusée'}[c.status];
  h+='<div class="jn-msg" style="margin-top:10px"><b>'+(c.direction==='recu'?esc(o.name)+' ('+esc(ROLE[o.role]||o.role)+') t\'a écrit':'Toi → '+esc(o.name))+'</b> · '+lab+'<br>'+esc(c.message)
   +((o.email||o.tel)?'<br><b>Coordonnées :</b> '+esc([o.email,o.tel].filter(Boolean).join(' · ')):'')
   +(c.direction==='recu'&&c.status==='envoye'?'<div style="margin-top:10px;display:flex;gap:10px"><button type="button" class="btn sm" data-ct="'+c.id+'" data-s="accepte" style="border:0;cursor:pointer">Accepter</button><button type="button" class="back" data-ct="'+c.id+'" data-s="refuse" style="background:none;border:0;color:var(--text2);font:inherit;font-weight:800;cursor:pointer">Refuser</button></div>':'')+'</div>'});
 $('#espCt').innerHTML=h},function(e){$('#espCt').textContent=e.message})}

document.addEventListener('click',function(e){var t=e.target.closest('[data-e],[data-ct],[data-contact],[data-vdel]');if(!t)return;
 if(t.dataset.vdel){t.disabled=true;Spora.api('DELETE','/me/videos/'+t.dataset.vdel).then(loadVideos,function(er){msg('#vmsg',er.message,false)});return}
 if(t.dataset.ct){Spora.api('PUT','/me/contacts/'+t.dataset.ct,{status:t.dataset.s}).then(loadContacts,function(er){$('#espCt').insertAdjacentHTML('afterbegin','<div class="jn-msg w">'+esc(er.message)+'</div>')});return}
 if(t.dataset.contact){openContact(+t.dataset.contact,t.dataset.nm);return}
 var a=t.dataset.e;
 if(a==='out')logout();
 if(a==='resend')Spora.api('POST','/auth/resend-verification',{}).then(function(){t.textContent='E-mail envoyé'},function(er){t.textContent=er.message});
 if(a==='del'){var pw=$('#delpw').value;if(!pw)return msg('#delMsg','Saisis ton mot de passe.',false);Spora.api('DELETE','/auth/me',{password:pw}).then(function(){Spora.set(null);location.hash='#accueil'},function(er){msg('#delMsg',er.message,false)})}});

/* ---- contacter un joueur ---- */
var dlg=document.createElement('dialog');dlg.id='ctDlg';dlg.style.cssText='border:1px solid var(--border);border-radius:22px;padding:24px;max-width:480px;width:calc(100% - 32px);background:var(--surface);color:var(--text)';
dlg.innerHTML='<form method="dialog" class="jn" id="ctF"><h2 id="ctT" style="margin:0 0 6px;font-size:1.4rem"></h2><p class="lead" style="margin:0 0 14px">Présente-toi et explique ta démarche (10 caractères minimum). Le joueur peut accepter ou refuser ; ses coordonnées ne te sont transmises qu\'après son accord.</p><textarea id="ctM" maxlength="600" style="width:100%;min-height:120px;padding:13px;border-radius:12px;border:1.5px solid var(--border);background:var(--surface2);color:var(--text);font:inherit"></textarea><div class="jn-msg" id="ctE" hidden></div><div class="jn-act"><button type="button" class="back" id="ctX" style="background:none;border:0;color:var(--text2);font:inherit;font-weight:800;cursor:pointer">Annuler</button><button type="submit" class="btn" style="border:0;cursor:pointer">Envoyer</button></div></form>';
document.body.appendChild(dlg);var to=0;
function openContact(id,nm){to=id;$('#ctT').textContent='Écrire à '+nm;$('#ctM').value='';$('#ctE').hidden=true;if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','')}
$('#ctX').addEventListener('click',function(){dlg.close()});
$('#ctF').addEventListener('submit',function(e){e.preventDefault();var m=$('#ctM').value.trim(),er=$('#ctE');
 Spora.api('POST','/contacts',{to:to,message:m}).then(function(){dlg.close();location.hash='#espace'},function(x){er.textContent=x.message;er.hidden=false})});

/* ---- vidéos d'un joueur (depuis l'annuaire) ---- */
var vdlg=document.createElement('dialog');vdlg.style.cssText='border:1px solid var(--border);border-radius:22px;padding:20px;max-width:520px;width:calc(100% - 32px);background:var(--surface);color:var(--text)';
vdlg.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><h2 id="vdT" style="margin:0;font-size:1.3rem"></h2><button type="button" id="vdX" style="background:none;border:0;color:var(--text2);font:inherit;font-weight:800;cursor:pointer">Fermer</button></div><div id="vdB"></div>';
document.body.appendChild(vdlg);
document.getElementById('vdX').addEventListener('click',function(){vdlg.close()});
vdlg.addEventListener('close',function(){vdlg.querySelectorAll('video').forEach(function(v){v.pause()})});
document.addEventListener('click',function(e){var t=e.target.closest('[data-pvid]');if(!t)return;
 document.getElementById('vdT').textContent='Vidéos de '+t.dataset.nm;document.getElementById('vdB').textContent='Chargement…';if(vdlg.showModal)vdlg.showModal();else vdlg.setAttribute('open','');
 Spora.api('GET','/players/'+t.dataset.pvid+'/videos').then(function(j){document.getElementById('vdB').innerHTML=j.videos.length?j.videos.map(function(v){return '<div style="margin-bottom:14px"><video controls playsinline preload="metadata" '+(v.poster?'poster="'+esc(v.poster)+'" ':'')+'src="'+esc(v.src)+'" style="width:100%;aspect-ratio:16/9;background:#000;border-radius:12px;display:block"></video><b>'+esc(v.title||'')+'</b></div>'}).join(''):'Aucune vidéo.'},function(er){document.getElementById('vdB').textContent=er.message})});

/* ---- mot de passe oublié : formulaire de réinitialisation ---- */
function drawReset(){var h=$('#rst');var tk=(location.hash.split('token=')[1]||'').split('&')[0];
 if(!tk){h.innerHTML='<h2>Lien invalide</h2><p class="lead">Demande un nouveau lien depuis la page de connexion.</p><a class="btn" href="#connexion">Connexion</a>';return}
 h.innerHTML='<h2>Choisis un nouveau mot de passe</h2><p class="lead">8 caractères minimum.</p><form id="rstF"><div class="jn-g"><div class="full"><label class="l" for="rp">Nouveau mot de passe</label><input id="rp" type="password" autocomplete="new-password"></div></div><div class="jn-act"><span></span><button class="btn" type="submit" style="border:0;cursor:pointer">Enregistrer</button></div><div class="jn-msg" id="rm" hidden></div></form>';
 $('#rstF').addEventListener('submit',function(e){e.preventDefault();Spora.api('POST','/auth/reset',{token:tk,password:$('#rp').value}).then(function(){Spora.set(null);h.innerHTML='<h2>Mot de passe modifié</h2><p class="lead">Tu peux maintenant te connecter.</p><a class="btn" href="#connexion">Se connecter</a>'},function(er){msg('#rm',er.message,false)})})}

/* ---- Highlights : vraies vidéos des joueurs vérifiés (sinon aperçus fictifs) ---- */
function loadFeed(){Spora.api('GET','/videos').then(function(j){
 var pg=$('[data-page="highlights"]');if(!pg)return;var g=pg.querySelector('#hReal'),vs=j.videos||[];
 var sample=['.search.s2','#hChips','#hCount','#hGrid','#hEmpty'].map(function(s){return pg.querySelector(s)}),note=pg.querySelector('.box>.note');
 if(!vs.length){if(g)g.remove();sample.forEach(function(el){if(el)el.style.display=''});if(note)note.textContent='Aperçus fictifs. Dès que des joueurs publient leurs vidéos, elles apparaissent ici.';var e=pg.querySelector('#hEmpty');if(e)e.style.display='none';return}
 sample.forEach(function(el){if(el)el.style.display='none'});
 if(!g){g=document.createElement('div');g.id='hReal';g.className='tt';pg.querySelector('#hGrid').parentNode.insertBefore(g,pg.querySelector('#hGrid'))}
 var RL={joueur:'Joueur',agent:'Agent',club:'Club'};
 g.innerHTML=vs.map(function(v){var p=v.player||{};return '<article><video playsinline loop muted preload="metadata" '+(v.poster?'poster="'+esc(v.poster)+'" ':'')+'src="'+esc(v.src)+'"></video><button type="button" class="snd" aria-label="Activer le son">🔇</button><div class="cap"><b>'+esc(p.name||'')+'</b><span>'+esc([RL[p.role],p.pos,p.nat].filter(Boolean).join(' · '))+'</span><p>'+esc(v.title||'')+'</p></div></article>'}).join('');
 if(window.__tt)window.__tt.disconnect();
 var io=new IntersectionObserver(function(es){es.forEach(function(en){var vd=en.target.querySelector('video');if(en.isIntersecting&&en.intersectionRatio>=.7){var pr=vd.play();if(pr&&pr.catch)pr.catch(function(){})}else vd.pause()})},{root:g,threshold:[.7]});
 g.querySelectorAll('article').forEach(function(a){io.observe(a)});window.__tt=io;
 g.onclick=function(e){var a=e.target.closest('article');if(!a)return;var vd=a.querySelector('video');
  if(e.target.closest('.snd')){vd.muted=!vd.muted;e.target.closest('.snd').textContent=vd.muted?'🔇':'🔊';return}
  if(vd.paused)vd.play().catch(function(){});else vd.pause()};
 if(note)note.textContent='Vidéos publiées par des joueurs vérifiés Spora.'},function(){})}
window.__refreshVideos=loadFeed;
window.__onRoute=function(h){
 if(h==='highlights')loadFeed();
 if(h==='espace'){Spora.user===null&&!ready?0:draw()}
 if(h==='reinitialiser')drawReset();
 if(h==='connexion'&&Spora.user)location.hash='#espace'};
var ready=false;
(function(){var h0=location.hash.split('?')[0].slice(1);if(h0==='highlights'||h0==='reinitialiser')window.__onRoute(h0)})();
Spora.refresh().then(function(){ready=true;var h=location.hash.split('?')[0].slice(1);if(h==='espace')draw();if(h==='connexion'&&Spora.user)location.hash='#espace'});
})();
