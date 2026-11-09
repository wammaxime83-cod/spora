/* Petit client pour l'API Spora : session + appels JSON */
window.Spora=(function(){
var user=null,ls=[];
function api(m,u,b){
 return fetch('/api'+u,{method:m,credentials:'same-origin',headers:b?{'Content-Type':'application/json'}:{},body:b?JSON.stringify(b):undefined})
  .then(function(r){return r.json().catch(function(){return {}}).then(function(j){if(!r.ok){var e=new Error(j.error||'Une erreur est survenue.');e.status=r.status;e.field=j.field;throw e}return j})},
        function(){throw new Error('Connexion impossible. Vérifie ta connexion internet.')})}
function set(u){user=u;ls.forEach(function(f){try{f(u)}catch(e){}})}
function refresh(){return api('GET','/auth/me').then(function(j){set(j.user);return j.user},function(){set(null);return null})}
return {api:api,set:set,refresh:refresh,on:function(f){ls.push(f)},get user(){return user}};
})();
