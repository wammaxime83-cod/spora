(function(){
var app=document.getElementById('app'),filter='en_attente';
function esc(x){return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function load(){
 Promise.all([Spora.api('GET','/admin/stats'),Spora.api('GET','/admin/users'+(filter?'?status='+filter:''))]).then(function(r){draw(r[0],r[1].users)},function(e){app.innerHTML='<div class="msg">'+(e.status===401?'Connecte-toi d\'abord avec un compte administrateur sur <a href="/#connexion">le site</a>.':e.status===403?'Accès réservé aux administrateurs (variable ADMIN_EMAILS).':esc(e.message))+'</div>'})}
function draw(s,u){
 var h='<div class="st">'+[['users','Comptes'],['joueurs','Joueurs'],['agents','Agents'],['clubs','Clubs'],['en_attente','À vérifier'],['payants','Payants'],['invites','Invités'],['contacts','Contacts']].map(function(k){return '<div><b>'+s[k[0]]+'</b><small>'+k[1]+'</small></div>'}).join('')+'</div>';
 h+='<div class="bar">'+[['en_attente','À vérifier'],['verifie','Vérifiés'],['refuse','Refusés'],['','Tous']].map(function(f){return '<button data-f="'+f[0]+'" class="'+(filter===f[0]?'on':'')+'">'+f[1]+'</button>'}).join('')+'<input id="motif" placeholder="Motif du refus (optionnel)" style="flex:1;min-width:200px"></div>';
 h+='<div class="tw"><table><thead><tr><th>Compte</th><th>Rôle</th><th>Statut</th><th>Offre</th><th>Inscrit</th><th>Actions</th></tr></thead><tbody>'+(u.length?u.map(function(x){return '<tr><td><b>'+esc(x.name)+'</b><br>'+esc(x.email)+(x.tel?'<br>'+esc(x.tel):'')+'<br><a href="#" data-d="'+x.id+'">Voir le profil</a><div id="d'+x.id+'"></div></td><td>'+esc(x.role)+'</td><td><span class="tag '+x.status+'">'+esc(x.status)+'</span>'+(x.email_verified?'':'<br><small>e-mail non confirmé</small>')+'</td><td><select data-p="'+x.id+'">'+['gratuit','standard','premium','elite'].map(function(p){return '<option'+(x.plan===p?' selected':'')+'>'+p+'</option>'}).join('')+'</select><br><input type="date" data-u="'+x.id+'" value="'+esc(x.plan_until||'')+'" title="Valable jusqu\'au"></td><td>'+esc(x.created_at)+'</td><td><button data-s="verifie" data-i="'+x.id+'">Vérifier</button> <button data-s="refuse" data-i="'+x.id+'">Refuser</button> <button data-x="'+x.id+'">Supprimer</button></td></tr>'}).join(''):'<tr><td colspan="6">Aucun compte.</td></tr>')+'</tbody></table></div>';
 app.innerHTML=h}
app.addEventListener('click',function(e){var t=e.target.closest('button,a');if(!t)return;
 if(t.dataset.f!==undefined){filter=t.dataset.f;return load()}
 if(t.dataset.d){e.preventDefault();Spora.api('GET','/admin/users/'+t.dataset.d).then(function(j){document.getElementById('d'+t.dataset.d).innerHTML='<pre>'+esc(JSON.stringify(j.profile,null,1))+'</pre>'});return}
 if(t.dataset.s){var note=t.dataset.s==='refuse'?prompt1():null;Spora.api('PUT','/admin/users/'+t.dataset.i+'/status',{status:t.dataset.s,note:note||undefined}).then(load)}
 if(t.dataset.x){if(t.dataset.arm!=='1'){t.dataset.arm='1';t.textContent='Confirmer ?';return}Spora.api('DELETE','/admin/users/'+t.dataset.x).then(load)}});
app.addEventListener('change',function(e){var t=e.target;var id=t.dataset.p||t.dataset.u;if(!id)return;var row=t.closest('tr');var pl=row.querySelector('[data-p]').value,un=row.querySelector('[data-u]').value;Spora.api('PUT','/admin/users/'+id+'/plan',{plan:pl,until:un||undefined}).then(function(){t.style.outline='2px solid #12a36f'},function(er){t.style.outline='2px solid #e5484d';t.title=er.message})});
/* prompt() est bloqué dans certains navigateurs embarqués : champ intégré à la place */
function prompt1(){var m=document.getElementById('motif');return m&&m.value?m.value:''}
load();
})();
