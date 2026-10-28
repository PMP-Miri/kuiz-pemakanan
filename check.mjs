import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import * as core from '../src/core.js';
import {demo} from '../src/demo.js';
import {runScenarios} from './scenarios.js';
class MemoryStorage { constructor(){this.map=new Map();} getItem(k){return this.map.has(k)?this.map.get(k):null;}setItem(k,v){this.map.set(k,String(v));}removeItem(k){this.map.delete(k);}clear(){this.map.clear();} }
function setup(){
 Object.defineProperty(globalThis,'crypto',{value:webcrypto,configurable:true});
 globalThis.localStorage=new MemoryStorage();globalThis.sessionStorage=new MemoryStorage();
 globalThis.window=new EventTarget();
 Object.defineProperty(globalThis,'navigator',{value:{locks:{request:async(key,fn)=>fn()}},configurable:true});
 return {participant:id=>sessionStorage.setItem('nutriarena-demo-player',id),expire:code=>{const key='nutriarena-demo-v1',d=JSON.parse(localStorage.getItem(key));d.rooms.find(x=>x.code===code).opened_at=new Date(Date.now()-180000).toISOString();localStorage.setItem(key,JSON.stringify(d));}};
}
test('Core dan aliran demo',async()=>{const result=await runScenarios(core,demo,setup());assert.ok(result.checks>=40);console.log(result.checks+' semakan logik lulus.');});
