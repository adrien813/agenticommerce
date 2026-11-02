'use strict';
(() => {
  const form=document.getElementById('unlock-form'), input=document.getElementById('password'), status=document.getElementById('status'), button=form.querySelector('button');
  const decode=s=>Uint8Array.from(atob(s), c=>c.charCodeAt(0));
  window.addEventListener('pageshow',e=>{if(e.persisted) location.reload();});
  form.addEventListener('submit',async e=>{
    e.preventDefault(); button.disabled=true; status.textContent='Ouverture du document…';
    let password=input.value; input.value='';
    try {
      if(!crypto.subtle) throw new Error('unsupported');
      const response=await fetch('document.enc.json',{cache:'no-store'});
      if(!response.ok) throw new Error('unavailable');
      const data=await response.json();
      if(data.version!==1 || data.iterations!==600000) throw new Error('format');
      const material=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']); password='';
      const key=await crypto.subtle.deriveKey({name:'PBKDF2',salt:decode(data.salt),iterations:data.iterations,hash:'SHA-256'},material,{name:'AES-GCM',length:256},false,['decrypt']);
      const clear=await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(data.iv),tagLength:128},key,decode(data.ciphertext));
      const doc=new DOMParser().parseFromString(new TextDecoder().decode(clear),'text/html');
      document.title=doc.title;
      const style=doc.querySelector('style'); if(style) document.head.appendChild(style);
      document.body.replaceChildren(...Array.from(doc.body.childNodes));
      document.getElementById('lock-page').addEventListener('click',()=>location.reload());
      window.scrollTo(0,0);
    } catch(error) {
      status.textContent=error.message==='unsupported'?'Ce navigateur ne permet pas l’ouverture sécurisée. Essayez un navigateur récent.':error.message==='unavailable'?'Le document est temporairement indisponible. Réessayez.':'Mot de passe incorrect ou document non disponible. Réessayez.';
      button.disabled=false;input.focus();
    } finally {password='';}
  });
})();
