(() => {
"use strict";
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const stages = $$(".stage");
let current = 0, musicStarted = false, bakeTimer = null, audioCtx = null, micStream = null, micRAF = null;

const messages = [
  "Gathering the sweetest ingredients...",
  "Mixing a little happiness...",
  "Adding extra layers of sweetness...",
  "Decorating with lots of love...",
  "Almost ready!"
];

function setStage(index, dir=1){
  index = Math.max(0, Math.min(stages.length-1,index));
  stages.forEach((s,i)=>s.classList.toggle("active", i===index));
  current=index;
  $("#backBtn").disabled = index===0;
  $("#stageDots").innerHTML = stages.map((_,i)=>`<i class="dot ${i===index?"active":""}"></i>`).join("");
  $("#stageDots").style.display = index===0 || index===stages.length-1 ? "none" : "flex";
  $(".stage-nav").classList.toggle("visible", index>0 && index<stages.length-1);
  window.scrollTo(0,0);
}
function next(){setStage(current+1,1)}
function back(){setStage(current-1,-1)}

$("#backBtn").addEventListener("click",back);

function burst(count=28){
  const fx=$("#effects");
  for(let i=0;i<count;i++){
    const e=document.createElement("span"); e.className="confetti";
    e.style.left=(45+Math.random()*10)+"%"; e.style.top=(20+Math.random()*15)+"%";
    e.style.background=["#e7a9bd","#c9b8e8","#f2c38f","#f5dca4","#fff0e9"][i%5];
    e.style.setProperty("--dx",((Math.random()-.5)*80)+"vw");
    e.style.animationDelay=(Math.random()*.18)+"s"; fx.appendChild(e);
    setTimeout(()=>e.remove(),2200);
  }
}
function hearts(count=14){
  const fx=$("#effects");
  for(let i=0;i<count;i++){
    const e=document.createElement("span");e.className="heart-fx";e.textContent=Math.random()>.5?"♡":"✦";
    e.style.left=(15+Math.random()*70)+"%";e.style.top=(55+Math.random()*15)+"%";
    e.style.setProperty("--dx",((Math.random()-.5)*160)+"px");fx.appendChild(e);
    setTimeout(()=>e.remove(),1900);
  }
}
function sparkles(count=12){
  const fx=$("#effects");
  for(let i=0;i<count;i++){
    const e=document.createElement("span");e.className="spark-fx";e.textContent="✦";
    e.style.left=(35+Math.random()*30)+"%";e.style.top=(35+Math.random()*25)+"%";
    e.style.setProperty("--dx",((Math.random()-.5)*180)+"px");e.style.setProperty("--dy",((Math.random()-.5)*180)+"px");
    fx.appendChild(e);setTimeout(()=>e.remove(),1100);
  }
}

function startMusic(){
  if(musicStarted) return;
  musicStarted=true;
  try{
    audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const master=audioCtx.createGain(); master.gain.value=.055; master.connect(audioCtx.destination);
    const notes=[261.63,329.63,392,523.25,392,329.63,293.66,349.23,440,523.25,440,349.23];
    let t=audioCtx.currentTime+.08;
    const playNote=(freq,time,dur)=>{
      const o=audioCtx.createOscillator(), g=audioCtx.createGain();
      o.type="sine";o.frequency.value=freq;
      g.gain.setValueAtTime(.0001,time);g.gain.exponentialRampToValueAtTime(.16,time+.035);
      g.gain.exponentialRampToValueAtTime(.0001,time+dur);
      o.connect(g);g.connect(master);o.start(time);o.stop(time+dur+.03);
    };
    let i=0;
    const loop=()=>{
      if(!audioCtx || audioCtx.state==="closed") return;
      const now=audioCtx.currentTime;
      while(t<now+1.5){playNote(notes[i%notes.length],t,.55);t+=.62;i++;}
      setTimeout(loop,700);
    };
    loop();
  }catch(e){/* music is intentionally non-blocking */}
}
$("#openSurprise").addEventListener("click",()=>{
  startMusic(); burst(36); sparkles(16);
  $("#welcomeGift").classList.add("opening");
  setTimeout(()=>{setStage(1);},700);
});
$("#decorNext").addEventListener("click",()=>{setStage(2);startBaking()});

function startBaking(){
  clearInterval(bakeTimer);
  let p=0, msg=0;
  $("#bakeProgress").style.width="0%"; $("#progressText").textContent="0%";
  $("#bakeMessage").textContent=messages[0];
  bakeTimer=setInterval(()=>{
    p+=2;
    if(p%20===0 && msg<messages.length-1){msg++;$("#bakeMessage").textContent=messages[msg]}
    $("#bakeProgress").style.width=p+"%";$("#progressText").textContent=p+"%";
    if(p>=100){clearInterval(bakeTimer);setTimeout(()=>{sparkles(22);setStage(3)},650)}
  },95);
}
$("#cakeContinue").addEventListener("click",()=>setStage(4));
let candlesLit=false,candlesDone=false;
$("#lightCandles").addEventListener("click",()=>{
  candlesLit=true; $(".interactive-cake").classList.add("candles-lit");
  $("#lightCandles").classList.add("hidden");$("#micBlow").classList.remove("hidden");$("#manualBlow").classList.remove("hidden");
  $("#microHelp").classList.remove("hidden");$("#wishInstruction").textContent="Close your eyes, make a beautiful wish!";
});
$("#manualBlow").addEventListener("click",()=>extinguishCandles("manual"));
$("#micBlow").addEventListener("click",startMic);

async function startMic(){
  if(!candlesLit || candlesDone) return;
  $("#listenStatus").textContent="Calibrating the microphone… stay quiet for a moment.";
  $("#micBlow").disabled=true;
  try{
    if(!window.isSecureContext && location.hostname!=="localhost" && location.hostname!=="127.0.0.1") throw new Error("insecure");
    if(!navigator.mediaDevices?.getUserMedia) throw new Error("unsupported");
    micStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:false,channelCount:1}});
    const ctx=new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==="suspended") await ctx.resume();
    const src=ctx.createMediaStreamSource(micStream), analyser=ctx.createAnalyser();
    analyser.fftSize=2048; analyser.smoothingTimeConstant=.35; src.connect(analyser);
    const data=new Float32Array(analyser.fftSize);
    let samples=0, noiseSum=0, noiseSq=0, noiseFloor=.012, burstStart=0, lastStrong=0;
    const started=performance.now();
    $("#listenStatus").textContent="Listening… now blow gently towards your microphone.";
    const tick=()=>{
      analyser.getFloatTimeDomainData(data);
      let sum=0, crossings=0, prev=data[0];
      for(let i=0;i<data.length;i++){
        const v=data[i]; sum+=v*v;
        if((v>=0)!==(prev>=0)) crossings++; prev=v;
      }
      const rms=Math.sqrt(sum/data.length);
      const zcr=crossings/data.length;
      const now=performance.now();
      // First ~900ms establishes the device's real ambient noise floor.
      if(now-started<900){
        noiseSum+=rms; noiseSq+=rms*rms; samples++;
        noiseFloor=Math.max(.008,noiseSum/samples);
      }
      const adaptive=Math.max(noiseFloor*2.8, .028);
      const broadbandBlow = rms>adaptive && zcr>0.035;
      if(broadbandBlow){
        if(!burstStart) burstStart=now;
        lastStrong=now;
        // Require a sustained breath-like burst, not one loud frame.
        if(now-burstStart>=220){cleanupMic(ctx);extinguishCandles("mic");return}
      }else if(lastStrong && now-lastStrong>140){
        burstStart=0;
      }
      if(now-started>13000){
        cleanupMic(ctx);
        $("#listenStatus").textContent="I couldn't hear a clear blow. Try again or use the manual button.";
        $("#micBlow").disabled=false;
        return;
      }
      micRAF=requestAnimationFrame(tick);
    };
    tick();
  }catch(e){
    cleanupMic();
    let msg="Microphone isn't available here — manual extinguishing is ready.";
    if(e.name==="NotAllowedError") msg="Microphone permission was declined — manual extinguishing is ready.";
    if(e.message==="insecure") msg="Microphone needs a secure page. On localhost it should work; manual extinguishing is always available.";
    $("#listenStatus").textContent=msg;
    $("#micBlow").disabled=false;
  }
}
function cleanupMic(ctx){
  if(micRAF)cancelAnimationFrame(micRAF);micRAF=null;
  if(micStream){micStream.getTracks().forEach(t=>t.stop());micStream=null}
  try{ctx?.close()}catch(e){}
}
function extinguishCandles(){
  if(candlesDone)return;candlesDone=true;
  cleanupMic();
  $(".interactive-cake").classList.remove("candles-lit");
  $(".interactive-cake").classList.add("candles-out");
  $("#micBlow").classList.add("hidden");$("#manualBlow").classList.add("hidden");$("#microHelp").classList.add("hidden");
  $("#listenStatus").textContent="";
  $("#wishCelebration").classList.remove("hidden");
  burst(45);hearts(20);sparkles(25);
}
$("#cutCake").addEventListener("click",()=>setStage(5));
$("#cutAction").addEventListener("click",()=>{
  $("#cutCakeArt").classList.add("cut-done");$("#cutAction").classList.add("hidden");
  $("#cutMessage").classList.remove("hidden");$("#toGifts").classList.remove("hidden");burst(18);
});
$("#toGifts").addEventListener("click",()=>setStage(6));

let openedGifts=0;
$$(".gift-card").forEach(card=>{
  card.querySelector(".gift-open").addEventListener("click",()=>{
    const was=card.classList.contains("open");
    card.classList.toggle("open");
    if(!was){openedGifts++;sparkles(8);hearts(5)}
    card.querySelector(".gift-open").textContent=card.classList.contains("open")?"Close ♡":"Open ♡";
    if(openedGifts>=4)$("#giftsNext").classList.remove("hidden");
  });
});
$("#giftsNext").addEventListener("click",()=>setStage(7));
$("#openLetter").addEventListener("click",()=>{
  $("#openLetter").classList.add("open");$("#letterOverlay").classList.add("open");$("#letterOverlay").setAttribute("aria-hidden","false");
  typeLetter();
});
$("#closeLetter").addEventListener("click",closeLetter);
$("#letterSkip").addEventListener("click",()=>setStage(8));
function closeLetter(){$("#letterOverlay").classList.remove("open");$("#letterOverlay").setAttribute("aria-hidden","true");setStage(8)}
const letterText="Today is a little reminder that your existence makes the world brighter. I hope this year brings you soft mornings, unexpected laughter, people who feel like home, and countless reasons to smile. Keep your beautiful heart, keep dreaming, and keep making ordinary moments magical. You deserve a birthday as wonderful as you are. Happy Birthday — today, tomorrow, and in all the little celebrations still waiting for you. ♡";
let typingTimer;
function typeLetter(){
  clearInterval(typingTimer);$("#typedLetter").textContent="";let i=0;
  typingTimer=setInterval(()=>{if(i<letterText.length){$("#typedLetter").textContent+=letterText[i++]}else clearInterval(typingTimer)},24);
}
$("#magicStar").addEventListener("click",()=>{$("#extraMessage").textContent="A tiny wish for you: may something you secretly hope for surprise you in the sweetest way. ✨";sparkles(18)});
$("#bubblePop").addEventListener("click",()=>{
  $("#extraMessage").textContent="Pop, pop, pop! Three tiny hearts for your day. ♡";
  for(let i=0;i<10;i++){const b=document.createElement("span");b.className="bubble";b.style.left=(20+Math.random()*60)+"%";b.style.top="65%";b.style.setProperty("--dx",((Math.random()-.5)*100)+"px");$("#effects").appendChild(b);setTimeout(()=>b.remove(),2100)}
});
$("#catTap").addEventListener("click",()=>{$("#extraMessage").textContent="Chef Cat says: the secret ingredient was always extra love. 🐱‍🍰";hearts(10)});
$("#finaleNext").addEventListener("click",()=>{setStage(9);burst(50);hearts(30);sparkles(30)});
$("#replay").addEventListener("click",()=>{
  clearInterval(bakeTimer);candlesLit=false;candlesDone=false;openedGifts=0;
  $(".interactive-cake").classList.remove("candles-lit","candles-out");$("#lightCandles").classList.remove("hidden");$("#micBlow").classList.add("hidden");$("#manualBlow").classList.add("hidden");$("#wishCelebration").classList.add("hidden");
  $("#cutCakeArt").classList.remove("cut-done");$("#cutAction").classList.remove("hidden");$("#cutMessage").classList.add("hidden");$("#toGifts").classList.add("hidden");
  $$(".gift-card").forEach(c=>{c.classList.remove("open");c.querySelector(".gift-open").textContent="Open ♡"});
  $("#giftsNext").classList.add("hidden");$("#letterOverlay").classList.remove("open");$("#openLetter").classList.remove("open");
  $("#bakeProgress").style.width="0%";$("#progressText").textContent="0%";$("#extraMessage").textContent="Choose a tiny surprise above ✨";
  setStage(0);burst(20);
});

// Three.js lightweight starfield with graceful fallback.
(function initThree(){
  const canvas=$("#starfield");
  try{
    if(!window.THREE || !window.WebGLRenderingContext) return;
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
    const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,1,1000);camera.position.z=80;
    const geo=new THREE.BufferGeometry(),count=130,arr=new Float32Array(count*3);
    for(let i=0;i<count;i++){arr[i*3]=(Math.random()-.5)*120;arr[i*3+1]=(Math.random()-.5)*80;arr[i*3+2]=(Math.random()-.5)*100}
    geo.setAttribute("position",new THREE.BufferAttribute(arr,3));
    const mat=new THREE.PointsMaterial({color:0xe4c8d5,size:1.4,transparent:true,opacity:.7});
    const points=new THREE.Points(geo,mat);scene.add(points);
    function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
    addEventListener("resize",resize);resize();
    let last=0;function frame(t){if(t-last>33){points.rotation.y+=.00035;points.rotation.x+=.00012;renderer.render(scene,camera);last=t}requestAnimationFrame(frame)}requestAnimationFrame(frame);
  }catch(e){canvas.style.display="none"}
})();
setStage(0);
})();