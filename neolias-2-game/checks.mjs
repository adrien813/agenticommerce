import assert from 'node:assert/strict';
import {freshState,restore,totalWeight,balanceSolved,lightSolved,canCombine,combine} from './dist/rules.mjs';
import {levelState,stickVector,STORY,STORY_ART} from './dist/experience.mjs';
import {readFileSync} from 'node:fs';
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

for(const room of [0,1,2]){
 const source=freshState(),before=JSON.stringify(source),direct=levelState(source,room,true);
 assert.equal(direct.room,room);assert.equal(restore(direct).room,room);
 assert.equal(JSON.stringify(source),before);
 assert.equal([direct.balance,direct.light,direct.final][room],false);
 assert.notEqual(direct.inventory,source.inventory);assert.notEqual(direct.weights,source.weights);assert.notEqual(direct.mirrors,source.mirrors);
}
let direct=levelState(freshState(),2,true);
assert(direct.inventory.includes('prism'));assert(!direct.inventory.includes('branch'));
direct.inventory.push('branch');assert(canCombine(direct));assert(combine(direct));
direct.final=true;direct.seenEnd=true;
const replay=levelState(direct,2,true);assert.equal(replay.wand,false);assert.equal(replay.final,false);assert.equal(replay.seenEnd,false);
assert.deepEqual(replay.inventory,['prism']);assert.equal(direct.wand,true);
const completed={...freshState(),inventory:['w1','w2','w3'],weights:[1,3],balance:true,mirrors:[1,1],light:true};
assert.deepEqual(levelState(completed,0,true).weights,[]);assert.equal(levelState(completed,0,true).balance,false);
assert.deepEqual(levelState(completed,1,true).mirrors,[0,0]);assert.equal(levelState(completed,1,true).light,false);
for(const bad of [-1,3,1.5,NaN])assert.throws(()=>levelState(freshState(),bad,true),RangeError);
assert.deepEqual(stickVector(0,0,40),{x:0,y:0});
assert.deepEqual(stickVector(2,2,40),{x:0,y:0});
assert.deepEqual(stickVector(20,0,40),{x:.5,y:0});
assert.deepEqual(stickVector(-80,0,40),{x:-1,y:0});
const diagonal=stickVector(80,80,40);assert(Math.abs(Math.hypot(diagonal.x,diagonal.y)-1)<1e-12);assert(diagonal.x>0&&diagonal.y>0);
assert.equal(STORY.length,4);assert.equal(STORY_ART.length,4);
assert(STORY.every(part=>part.chapter&&part.title&&part.text&&part.note));assert(STORY_ART.every(svg=>svg.startsWith('<svg')&&svg.endsWith('</svg>')));
console.log('PASS: direct room selection, room replay, required items, save compatibility, joystick deadzone and analog movement, story data.');

new Function(readFileSync(new URL('./dist/game.js',import.meta.url),'utf8').replace(/^import .*;$/gm,''));
console.log('PASS: game JavaScript syntax.');
