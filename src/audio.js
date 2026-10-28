// Muzik instrumental sintesis tempatan. Tiada fail lagu pihak ketiga.
let ctx, bus, enabled=false, timer, step=0, scene='lobby';
export function soundOn(){return enabled;}
function tone(freq,time,duration,volume=.08,type='sine'){
 const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;
 g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(volume,time+.012);g.gain.exponentialRampToValueAtTime(.0001,time+duration);o.connect(g);g.connect(bus);o.start(time);o.stop(time+duration+.02);
}
function tick(){if(!enabled||!ctx)return;const t=ctx.currentTime+.025;const chords=[[220,261.63,329.63,392],[174.61,220,261.63,349.23],[196,246.94,293.66,392],[164.81,196,246.94,329.63]];const c=chords[Math.floor(step/16)%4];
 tone(c[[0,2,1,3,2,1,3,2][step%8]],t,.38,scene==='question'?.025:.055,'triangle');
 if(step%4===0){tone(c[0]/2,t,.45,.075,'sine');tone(95,t,.09,.08,'sine');}
 if(scene==='finished'&&step%8===0)c.forEach((f,i)=>tone(f*2,t+i*.045,.7,.028));step++;}
export async function toggleSound(){if(!ctx){ctx=new (window.AudioContext||window.webkitAudioContext)();bus=ctx.createGain();bus.gain.value=.6;bus.connect(ctx.destination);}await ctx.resume();enabled=!enabled;if(enabled){timer=setInterval(tick,150);tick();}else{clearInterval(timer);}return enabled;}
export function setScene(value){scene=value;}
export function effect(type='tap'){if(!enabled||!ctx)return;const t=ctx.currentTime;if(type==='correct'){[523.25,659.25,783.99].forEach((f,i)=>tone(f,t+i*.08,.25,.09));}else if(type==='wrong'){tone(196,t,.25,.055,'triangle');tone(164.81,t+.12,.25,.055,'triangle');}else tone(660,t,.08,.04);}
