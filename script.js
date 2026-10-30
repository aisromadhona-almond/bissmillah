const $ = (id) => document.getElementById(id);
const ANSWERS = {1:{x:6,y:4}, 2:{x:5,y:4}, 3:48000};
let score = 0;
let completed = {1:false, 2:false, 3:false};
let activeLevel = 1;
let attempts = {1:0, 2:0, 3:0};

function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}
function toast(message){
  const el=$("toast"); el.textContent=message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.classList.remove("show"),2300);
}
function updateScore(points){
  score += points;
  $("headerScore").textContent=score;
  $("sideScore").textContent=score;
}
function updateProgress(){
  const count=Object.values(completed).filter(Boolean).length;
  $("progressText").textContent=`${count}/3 selesai`;
  $("progressBar").style.width=(count/3*100)+"%";
}
// GeoGebra dimuat hanya saat levelnya dibuka (hemat koneksi/laptop)
function loadFrame(level){
  const frame=$("geo"+level);
  if(frame && !frame.getAttribute("src")) frame.setAttribute("src",frame.dataset.src);
}
function setModelRevealed(level, revealed){
  const panel=$("level"+level+"Panel");
  panel.querySelectorAll(".model-secret").forEach(el=>el.classList.toggle("hidden",!revealed));
  panel.querySelectorAll(".model-placeholder").forEach(el=>el.classList.toggle("hidden",revealed));
  const btn=panel.querySelector(".reveal-btn");
  if(btn) btn.classList.toggle("hidden",revealed);
}
function selectLevel(level){
  if(level>1 && !completed[level-1]){toast("Selesaikan misi sebelumnya terlebih dahulu!");return;}
  activeLevel=level;
  [1,2,3].forEach(n=>{
    $("level"+n+"Panel").classList.toggle("hidden",n!==level);
    const btn=document.querySelector(`[data-level="${n}"].map-item`);
    btn.classList.toggle("selected",n===level);
  });
  if(level<3) loadFrame(level);
  const banners={
    1:["LEVEL 1 · MUDAH","Stationery Shop","Label harga alat tulis menghilang. Bantu Miko menemukannya!","✏️📒"],
    2:["LEVEL 2 · MENENGAH","Fruit Shop","Sekarang bantu Miko menemukan harga buah-buahan!","🍎🍊"],
    3:["FINAL MISSION","Checkout Counter","Hitung total belanja Miko sebelum meninggalkan toko.","🛒🧾"]
  };
  const b=banners[level];
  $("missionBanner").querySelector(".level-tag").textContent=b[0];
  $("missionBanner").querySelector("h2").textContent=b[1];
  $("missionBanner").querySelector("p").textContent=b[2];
  $("missionBanner").querySelector(".banner-emoji").textContent=b[3];
  $("levelHint").textContent=level===3?"Selesaikan checkout untuk menuntaskan permainan.":"Selesaikan misi untuk membuka toko berikutnya.";
  window.scrollTo({top:0,behavior:"smooth"});
}
function markCompleted(level){
  completed[level]=true;
  const status=$("status"+level);
  status.textContent="✓";
  status.style.color="#4a9b7b";
  const next=level+1;
  if(next<=3){
    const btn=document.querySelector(`[data-level="${next}"].map-item`);
    btn.classList.remove("locked");
    btn.style.opacity="1";
    btn.style.cursor="pointer";
    $("status"+next).textContent="●";
  }
  updateProgress();
}
function validatePair(level){
  const xInput=$("l"+level+"x"), yInput=$("l"+level+"y");
  const feedback=$("feedback"+level);
  // Input kosong tidak dihitung sebagai percobaan
  if(xInput.value==="" || yInput.value===""){
    feedback.textContent="Isi kedua nilai terlebih dahulu, ya!";
    feedback.className="feedback bad";return;
  }
  const x=Number(xInput.value), y=Number(yInput.value);
  const {x:expectedX,y:expectedY}=ANSWERS[level];
  const alreadyDone=completed[level];
  if(!alreadyDone) attempts[level]++;
  if(x===expectedX && y===expectedY){
    feedback.textContent=`🎉 Tepat! x = ${expectedX} dan y = ${expectedY}. Label harga berhasil ditemukan!`;
    feedback.className="feedback good";
    if(!alreadyDone){
      updateScore(attempts[level]===1?100:70);
      markCompleted(level);
      toast("Misi berhasil! "+(level===1?"Fruit Shop terbuka.":"Checkout Counter terbuka."));
      // Pindah level otomatis hanya saat pertama kali selesai
      setTimeout(()=>{ if(activeLevel===level) selectLevel(level+1); },1300);
    }
  }else{
    feedback.textContent="Belum tepat. Periksa kembali titik potong kedua garis di GeoGebra. Ingat satuannya ribuan rupiah.";
    feedback.className="feedback bad";
  }
}
$("startBtn").addEventListener("click",()=>{
  showScreen("gameScreen");
  selectLevel(1);
});
$("check1").addEventListener("click",()=>validatePair(1));
$("check2").addEventListener("click",()=>validatePair(2));
document.querySelectorAll(".reveal-btn").forEach(btn=>{
  btn.addEventListener("click",()=>setModelRevealed(Number(btn.dataset.level),true));
});
$("notesBtn").addEventListener("click",()=>{
  $("priceNotes").classList.toggle("hidden");
  $("notesBtn").textContent=$("priceNotes").classList.contains("hidden")?"📒 Buka catatan harga Miko":"📒 Tutup catatan harga Miko";
});
$("checkFinal").addEventListener("click",()=>{
  const feedback=$("feedbackFinal");
  if($("finalAnswer").value===""){feedback.textContent="Masukkan total belanja terlebih dahulu.";feedback.className="feedback bad";return;}
  const value=Number($("finalAnswer").value);
  const alreadyDone=completed[3];
  if(!alreadyDone) attempts[3]++;
  if(value===ANSWERS[3]){
    feedback.textContent="Checkout berhasil! Total belanja Miko Rp48.000.";
    feedback.className="feedback good";
    if(!alreadyDone){
      updateScore(attempts[3]===1?100:70);
      markCompleted(3);
      setTimeout(()=>{
        $("finalScore").textContent=score;
        showScreen("completeScreen");
      },1100);
    }
  }else{
    feedback.textContent="Totalnya belum tepat. Kalikan jumlah tiap barang dengan harganya, lalu jumlahkan semuanya.";
    feedback.className="feedback bad";
  }
});
document.querySelectorAll(".map-item").forEach(btn=>{
  btn.addEventListener("click",()=>selectLevel(Number(btn.dataset.level)));
});
$("backToMap").addEventListener("click",()=>{
  toast("Pilih toko yang sudah terbuka pada peta misi.");
  document.querySelector(".sidebar").scrollIntoView({behavior:"smooth",block:"center"});
});
document.querySelectorAll(".copy-btn").forEach(btn=>{
  btn.addEventListener("click",async()=>{
    const text=btn.dataset.copy;
    try{await navigator.clipboard.writeText(text);toast("Persamaan berhasil disalin!");}
    catch(e){toast("Salin persamaan secara manual: "+text);}
  });
});
$("restartBtn").addEventListener("click",()=>{
  score=0;completed={1:false,2:false,3:false};attempts={1:0,2:0,3:0};
  ["l1x","l1y","l2x","l2y","finalAnswer"].forEach(id=>$(id).value="");
  ["feedback1","feedback2","feedbackFinal"].forEach(id=>{$(id).textContent="";$(id).className="feedback";});
  $("headerScore").textContent="0";$("sideScore").textContent="0";
  [1,2].forEach(n=>{
    setModelRevealed(n,false);
    const frame=$("geo"+n);
    frame.removeAttribute("src"); // GeoGebra dimuat ulang saat level dibuka lagi
  });
  $("priceNotes").classList.add("hidden");
  $("notesBtn").textContent="📒 Buka catatan harga Miko";
  [1,2,3].forEach(n=>{
    $("status"+n).textContent=n===1?"●":"🔒";
    $("status"+n).style.color="";
    const btn=document.querySelector(`[data-level="${n}"].map-item`);
    btn.classList.toggle("locked",n!==1);
    btn.style.opacity=n===1?"1":".48";
    btn.style.cursor=n===1?"pointer":"not-allowed";
  });
  updateProgress();showScreen("welcomeScreen");
});
