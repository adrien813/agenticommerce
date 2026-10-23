import assert from 'node:assert/strict';
import {freshState,restore,totalWeight,balanceSolved,lightSolved,canCombine,combine} from './dist/rules.mjs';
let s=freshState();
assert.equal(combine(s),false);
assert.equal(restore({version:1,room:2}).room,0);
s.inventory=['w1','w2','w3'];
const solutions=[];for(let mask=0;mask<8;mask++){s.weights=[1,2,3].filter((_,i)=>mask&(1<<i));if(balanceSolved(s))solutions.push([...s.weights]);}
assert.deepEqual(solutions,[[1,3]]);
s.weights=[1,3];s.balance=true;s.room=1;
assert.equal(totalWeight(s),4);
let lightSolutions=0;for(let a=0;a<2;a++)for(let b=0;b<2;b++){s.mirrors=[a,b];if(lightSolved(s))lightSolutions++;}
assert.equal(lightSolutions,1);s.light=true;s.room=2;
s.inventory.push('prism','branch');assert(canCombine(s));assert(combine(s));assert(!combine(s));assert.equal(s.inventory.filter(i=>i==='wand').length,1);
s.final=true;assert.deepEqual(restore(JSON.parse(JSON.stringify(s))),s);
s.room=0;assert.equal(restore(s).room,0);assert(restore(s).wand);
assert.deepEqual(restore({version:1,inventory:['w1','w1','bad'],weights:[1,1,8],mirrors:[9,-1]}).weights,[1]);
console.log('PASS: balance, mirror configurations, crafting, round-trip save, room revisits, malformed save.');
