const nav=document.querySelector('.main-nav');
const menu=document.querySelector('.menu-button');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav?.classList.toggle('mobile-open')});

const track=document.getElementById('projectTrack');
const progressBar=document.getElementById('horizontalProgress');
const yearButtons=document.querySelectorAll('[data-target-year]');

function updateProgress(){if(!track||!progressBar)return;const max=Math.max(1,track.scrollWidth-track.clientWidth);progressBar.style.width=`${(track.scrollLeft/max)*100}%`;}

function setActiveYear(){if(!track||!yearButtons.length)return;const trackLeft=track.getBoundingClientRect().left;let activeYear='2022';let closest=Infinity;document.querySelectorAll('[data-year]').forEach(panel=>{const rect=panel.getBoundingClientRect();const distance=Math.abs(rect.left-trackLeft);if(distance<closest){closest=distance;activeYear=panel.dataset.year||activeYear;}});yearButtons.forEach(button=>button.classList.toggle('is-current',button.dataset.targetYear===activeYear));}

if(track){
  track.addEventListener('wheel',event=>{
    const dominantDelta=Math.abs(event.deltaY)>=Math.abs(event.deltaX)?event.deltaY:event.deltaX;
    const maxScroll=track.scrollWidth-track.clientWidth;
    const canMoveForward=dominantDelta>0&&track.scrollLeft<maxScroll-2;
    const canMoveBackward=dominantDelta<0&&track.scrollLeft>2;
    if(canMoveForward||canMoveBackward){event.preventDefault();track.scrollLeft+=dominantDelta;}
  },{passive:false});

  let dragging=false,startX=0,startingScroll=0;
  track.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'){dragging=true;startX=event.clientX;startingScroll=track.scrollLeft;track.setPointerCapture(event.pointerId);}});
  track.addEventListener('pointermove',event=>{if(dragging)track.scrollLeft=startingScroll-(event.clientX-startX);});
  ['pointerup','pointercancel','lostpointercapture'].forEach(name=>track.addEventListener(name,()=>dragging=false));
  track.addEventListener('scroll',()=>{updateProgress();setActiveYear();},{passive:true});
}

yearButtons.forEach(button=>button.addEventListener('click',()=>{const target=document.getElementById(`year-${button.dataset.targetYear}`);if(track&&target)track.scrollTo({left:target.offsetLeft,behavior:'smooth'});}));

track?.addEventListener('keydown',event=>{const amount=Math.min(window.innerWidth*.72,720);if(event.key==='ArrowRight'){event.preventDefault();track.scrollBy({left:amount,behavior:'smooth'});}if(event.key==='ArrowLeft'){event.preventDefault();track.scrollBy({left:-amount,behavior:'smooth'});}});

updateProgress();
setActiveYear();
