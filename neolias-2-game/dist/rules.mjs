export const freshState=()=>({version:1,room:0,inventory:[],weights:[],balance:false,mirrors:[0,0],light:false,wand:false,final:false,seenEnd:false});
export const totalWeight=s=>s.weights.reduce((a,b)=>a+b,0);
export const balanceSolved=s=>totalWeight(s)===4;
export const lightSolved=s=>s.mirrors[0]===1&&s.mirrors[1]===1;
export const canCombine=s=>s.inventory.includes('prism')&&s.inventory.includes('branch');
export function combine(s){if(!canCombine(s))return false;s.inventory=s.inventory.filter(x=>!['prism','branch'].includes(x));s.inventory.push('wand');s.wand=true;return true;}
export function restore(raw){const s=freshState();if(!raw||raw.version!==1)return s;s.room=Math.min(2,Math.max(0,Math.floor(Number(raw.room)||0)));s.inventory=Array.isArray(raw.inventory)?[...new Set(raw.inventory.filter(x=>['w1','w2','w3','prism','branch','wand'].includes(x)))]:[];s.weights=Array.isArray(raw.weights)?[...new Set(raw.weights.filter(x=>[1,2,3].includes(x)&&s.inventory.includes('w'+x)))]:[];s.mirrors=[0,1].map(i=>raw.mirrors?.[i]===1?1:0);s.balance=!!raw.balance;s.light=!!raw.light;s.wand=s.inventory.includes('wand');s.final=!!raw.final&&s.wand;s.seenEnd=!!raw.seenEnd;s.room=s.balance?(s.light?s.room:Math.min(s.room,1)):0;return s;}
