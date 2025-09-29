const input=document.getElementById("task-input");
const addBtn=document.getElementById("add-btn");
const taskList=document.getElementById("task-list");
const themeToggle=document.getElementById("theme-toggle");
const filterBtns=document.querySelectorAll(".filters button");
const progressBar=document.getElementById("progress-bar");
let dragSrc=null;
let placeholder=document.createElement("li");
placeholder.classList.add("placeholder");

window.onload=()=>{
  const saved=JSON.parse(localStorage.getItem("tasks"))||[];
  saved.forEach(t=>createTask(t.text,t.done));
  if(localStorage.getItem("theme")==="light"){ document.body.classList.add("light"); themeToggle.textContent="☀️"; }
  updateProgress();
};

addBtn.addEventListener("click", addTask);
input.addEventListener("keypress", e=>{ if(e.key==="Enter") addTask(); });

themeToggle.addEventListener("click", ()=>{
  document.body.classList.toggle("light");
  themeToggle.textContent=document.body.classList.contains("light")?"☀️":"🌙";
  localStorage.setItem("theme", document.body.classList.contains("light")?"light":"dark");
});

filterBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    filterBtns.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    applyFilter(btn.dataset.filter);
  });
});

function addTask(){
  const text=input.value.trim();
  if(!text) return;
  createTask(text,false);
  saveTasks();
  applyFilter(document.querySelector(".filters button.active").dataset.filter);
  updateProgress();
  input.value="";
}

function createTask(text,done){
  const li=document.createElement("li"); li.draggable=true;
  if(done) li.classList.add("done");
  const span=document.createElement("span"); span.textContent=text;
  const btns=document.createElement("div"); btns.classList.add("task-buttons");

  const doneBtn=document.createElement("button"); doneBtn.textContent="✔";
  doneBtn.addEventListener("click", ()=>{
    li.classList.toggle("done");
    saveTasks();
    applyFilter(document.querySelector(".filters button.active").dataset.filter);
    updateProgress();
  });

  const delBtn=document.createElement("button"); delBtn.textContent="✖";
  delBtn.addEventListener("click", ()=>{
    li.remove();
    saveTasks();
    updateProgress();
  });

  btns.appendChild(doneBtn); btns.appendChild(delBtn);
  li.appendChild(span); li.appendChild(btns);
  taskList.appendChild(li);

  addSwipeEvents(li);
  addDragEvents(li);
}

function saveTasks(){
  const tasks=[];
  document.querySelectorAll("#task-list li").forEach(li=>{
    tasks.push({text: li.querySelector("span").textContent, done: li.classList.contains("done")});
  });
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function applyFilter(filter){
  document.querySelectorAll("#task-list li").forEach(li=>{
    if(filter==="all") li.style.display="flex";
    else if(filter==="done") li.style.display=li.classList.contains("done")?"flex":"none";
    else if(filter==="pending") li.style.display=li.classList.contains("done")?"none":"flex";
  });
}

function updateProgress(){
  const tasks=document.querySelectorAll("#task-list li");
  if(!tasks.length){ progressBar.style.width="0%"; return; }
  const doneTasks=document.querySelectorAll("#task-list li.done").length;
  const percent=Math.round((doneTasks/tasks.length)*100);
  progressBar.style.width=percent+"%";
}

// Swipe-to-delete
function addSwipeEvents(li){
  let startX=0,currentX=0,moving=false;
  li.addEventListener('touchstart',e=>{ startX=e.touches[0].clientX; moving=true; });
  li.addEventListener('touchmove',e=>{
    if(!moving) return;
    currentX=e.touches[0].clientX;
    const diff=currentX-startX;
    if(diff<0) li.style.transform=`translateX(${diff}px)`;
  });
  li.addEventListener('touchend',e=>{
    moving=false;
    const diff=currentX-startX;
    if(diff<-80){ li.classList.add('swipe-delete'); setTimeout(()=>{ li.remove(); saveTasks(); updateProgress(); },300);}
    else li.style.transform='translateX(0)';
  });
}

// Drag & Drop with animation
function addDragEvents(li){
  li.addEventListener('dragstart',e=>{
    dragSrc=li;
    li.classList.add('dragging');
    setTimeout(()=> li.style.display='none',0);
  });
  li.addEventListener('dragend',e=>{
    li.classList.remove('dragging');
    li.style.display='flex';
    placeholder.remove();
    saveTasks();
  });
  li.addEventListener('dragover',e=>{
    e.preventDefault();
    const target=e.currentTarget;
    if(target===dragSrc) return;
    const rect=target.getBoundingClientRect();
    const next=(e.clientY-rect.top)/(rect.bottom-rect.top)>0.5;
    taskList.insertBefore(placeholder,next?target.nextSibling:target);
  });
  li.addEventListener('drop',e=>{
    e.preventDefault();
    taskList.insertBefore(dragSrc,placeholder);
    placeholder.remove();
  });
}