/* On mange quoi — persistent household sync */
(()=>{
'use strict';
const URL_DB='https://yhxloiwvphaguaoiegbf.supabase.co';
const PUBLIC_KEY='sb_publishable_0hMY5PRv0vU6syfUAUBgIQ_Q_upFpnZ';
let client=null,user=null,home=null,revision=0,writing=Promise.resolve(),dirty=false,applying=false;
const db=()=>client||(client=window.supabase?.createClient(URL_DB,PUBLIC_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}));
const stamp=()=>home?'☁ Foyer synchronisé':user?'☁ Compte connecté':'◉ Sur cet appareil';
function syncBadge(){document.querySelectorAll('.pill').forEach(el=>el.textContent=stamp());}
function dialog(){
 const html=user?(home?`<p class="setup-box"><b>✓ Sauvegarde centrale active</b> — ${escapeHTML(user.email)}</p><p>Envoyez ce code à Jessica ou Benoît pour rejoindre le même foyer :</p><div class="sync-invite"><code>${escapeHTML(home.invite_code)}</code><button type="button" data-sync="copy">Copier</button></div><button class="btn soft full" data-sync="refresh">↻ Actualiser maintenant</button><button class="btn full" data-sync="logout">Se déconnecter</button>`:`<p>Compte connecté : ${escapeHTML(user.email)}</p><p>Créez un foyer avec les préférences de ce téléphone ou rejoignez le foyer déjà créé.</p><button class="btn primary full" data-sync="create">Créer et sauvegarder mon foyer</button><form id="syncJoin"><label class="label">Code reçu de l'autre parent</label><input class="field" name="code" required maxlength="24"><button class="btn soft full" type="submit">Rejoindre le foyer</button></form><button class="btn full" data-sync="logout">Se déconnecter</button>`):`<p>Connectez-vous pour enregistrer les goûts hors de ce téléphone et les partager avec l'autre parent.</p><form id="syncAuth"><label class="label">Adresse email</label><input class="field" name="email" type="email" required autocomplete="email"><label class="label">Mot de passe (12 caractères minimum)</label><input class="field" name="password" type="password" minlength="12" required autocomplete="current-password"><button class="btn primary full" type="submit" data-mode="login">Se connecter</button><button class="btn soft full" type="submit" data-mode="signup" formnovalidate>Créer un compte</button></form><p class="hint">À l'inscription, il peut être nécessaire de confirmer l'adresse email.</p>`;
 modal={type:'account'};
 document.querySelector('.floating')?.remove();
 document.querySelector('#app').insertAdjacentHTML('beforeend',modalBase('Sauvegarde familiale',`<div class="sync-panel">${html}</div>`,false));
}
async function read(){const {data,error}=await db().rpc('dinner_get_household');if(error)throw error;return data;}
function importState(data){if(!data?.joined){home=null;syncBadge();return;}
 home={id:data.family_id,invite_code:data.invite_code};revision=data.version;
 applying=true;state=makeState(data.state);saveLocal();currentId=null;render();applying=false;syncBadge();}
async function refresh(){if(!user||dirty)return;const data=await read();if(data?.joined&&(!home||data.version>revision))importState(data);syncBadge();}
async function flush(){if(!home||!user)return;dirty=true;
 writing=writing.then(async()=>{
  for(let attempt=0;attempt<3;attempt++){
   const snapshot=JSON.parse(JSON.stringify(state));
   const {data,error}=await db().rpc('dinner_save_household',{p_family_id:home.id,p_version:revision,p_state:snapshot});
   if(error)throw error;
   if(!data.conflict){revision=data.version;dirty=false;syncBadge();return;}
   revision=data.version;
   const remote=makeState(data.state);
   // Keep independent food votes from both devices; local values win only on exact conflict.
   for(const [id,votes] of Object.entries(snapshot.foodPrefs||{}))remote.foodPrefs[id]={...(remote.foodPrefs[id]||{}),...votes};
   remote.members=remote.members.map((m,i)=>JSON.stringify(snapshot.members[i])!==JSON.stringify(defaultMembers()[i])?snapshot.members[i]:m);
   remote.plan={...remote.plan,...snapshot.plan};
   remote.favourites=[...new Set([...(remote.favourites||[]),...(snapshot.favourites||[])])];
   remote.ratings={...remote.ratings,...snapshot.ratings};
   applying=true;state=makeState(remote);saveLocal();render();applying=false;
  }
  throw Error('Le tableau a changé sur un autre appareil. Réessayez.');
 }).catch(e=>{console.warn('Save failed',e);toast('Synchro indisponible. Les réponses restent sur ce téléphone.');});return writing;}
async function doSignup(form,signup){const email=String(form.get('email')||'').trim(),password=String(form.get('password')||'');const result=signup?await db().auth.signUp({email,password}):await db().auth.signInWithPassword({email,password});if(result.error)throw result.error;if(!result.data.session){toast('Vérifiez votre email, puis connectez-vous.');return;}user=result.data.user;const remote=await read();if(remote?.joined)importState(remote);dialog();toast('Compte connecté.');}
async function doAction(btn){const a=btn.dataset.sync;
 if(a==='copy'){await navigator.clipboard.writeText(home.invite_code);toast('Code copié.');}
 if(a==='refresh'){await refresh();toast('Données actualisées.');}
 if(a==='create'){const {data,error}=await db().rpc('dinner_create_household',{p_state:state});if(error)throw error;importState(data);dialog();toast('Sauvegarde centrale activée.');}
 if(a==='logout'){await db().auth.signOut();user=null;home=null;dirty=false;dialog();syncBadge();}
}
function attach(){
 const previous=mutate;
 mutate=function(fn){const result=previous(fn);if(!applying&&home)flush();return result;};
 document.addEventListener('click',e=>{const btn=e.target.closest('[data-sync]');if(btn){e.preventDefault();e.stopImmediatePropagation();doAction(btn).catch(err=>toast(err.message));return;}
 if(e.target.closest('[data-action="account"]')){e.preventDefault();e.stopImmediatePropagation();dialog();}},true);
 document.addEventListener('submit',e=>{if(e.target.id==='syncAuth'){e.preventDefault();e.stopImmediatePropagation();doSignup(new FormData(e.target),e.submitter?.dataset.mode==='signup').catch(err=>toast(err.message));}
 if(e.target.id==='syncJoin'){e.preventDefault();e.stopImmediatePropagation();const code=String(new FormData(e.target).get('code')||'').trim();db().rpc('dinner_join_household',{p_invite_code:code}).then(({data,error})=>{if(error)throw error;importState(data);dialog();toast('Foyer rejoint.');}).catch(err=>toast(err.message));}},true);
}
async function start(){try{if(!db()){console.warn('Supabase library unavailable');return;}const {data,error}=await db().auth.getSession();if(error)throw error;user=data.session?.user||null;if(user){const remote=await read();if(remote?.joined)importState(remote);}syncBadge();db().auth.onAuthStateChange((_event,session)=>{user=session?.user||null;if(!user){home=null;dirty=false;}syncBadge();});setInterval(()=>refresh().catch(e=>console.warn(e)),15000);}catch(e){console.warn('Sync startup',e);}}
attach();start();
})();