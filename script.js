const input = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('taskList');
const themeBtn = document.getElementById('themeBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const progressBar = document.getElementById('progressBar');
const countLeft = document.getElementById('countLeft');
const toast = document.getElementById('toast');
const tmpl = document.getElementById('taskTemplate');
const confettiCanvas = document.getElementById('confetti');
const ctx = confettiCanvas.getContext('2d');
let confettiPieces = [];

function resizeCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function spawnConfetti(n = 100) {
  for (let i = 0; i < n; i++) {
    confettiPieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -10,
      r: 3 + Math.random() * 4,
      vx: -2 + Math.random() * 4,
      vy: 2 + Math.random() * 3,
      color: `hsl(${Math.floor(Math.random()*360)},85%,60%)`,
      life: 120 + Math.random() * 120
    });
  }
}
function tickConfetti() {
  ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += 0.02; p.life--;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.r, p.r);
  });
  confettiPieces = confettiPieces.filter(p => p.life > 0);
  requestAnimationFrame(tickConfetti);
}
tickConfetti();

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
renderAll(); updateProgress();

addBtn.onclick = onAdd;
input.addEventListener('keydown', e => { if (e.key === 'Enter') onAdd(); });
themeBtn.onclick = toggleTheme;
clearAllBtn.onclick = clearAll;

function onAdd() {
  const text = input.value.trim();
  if (!text) { showToast("Champ vide 😅"); return; }
  const task = { id: Date.now(), text, done: false, priority: false };
  tasks.push(task); save();
  addItem(task);
  input.value = "";
  updateProgress();
}
function addItem(task) {
  const li = tmpl.content.firstElementChild.cloneNode(true);
  li.dataset.id = task.id;
  const checkbox = li.querySelector('.check');
  const textSpan = li.querySelector('.text');
  const delBtn = li.querySelector('.del');
  const editBtn = li.querySelector('.edit');
  const prioBtn = li.querySelector('.priority');
  checkbox.checked = task.done;
  textSpan.textContent = task.text;
  if (task.done) li.classList.add('done');
  if (task.priority) li.classList.add('priority');
  checkbox.onchange = () => { task.done = checkbox.checked; li.classList.toggle('done'); save(); updateProgress(); maybeCelebrate(); };
  delBtn.onclick = () => { li.classList.add('exit'); setTimeout(()=>{ li.remove(); tasks = tasks.filter(t=>t.id!==task.id); save(); updateProgress(); }, 350); };
  editBtn.onclick = () => { const newText = prompt("Modifier :", task.text); if(newText){ task.text=newText; textSpan.textContent=newText; save(); } };
  prioBtn.onclick = () => { task.priority=!task.priority; li.classList.toggle('priority'); save(); };
  list.appendChild(li);
}
function renderAll() { list.innerHTML=""; tasks.forEach(addItem); }
function updateProgress() { countLeft.textContent = tasks.filter(t=>!t.done).length; }
function maybeCelebrate() { if (tasks.length && tasks.every(t=>t.done)) { spawnConfetti(150); showToast("🎉 Bravo ! Tout est terminé"); } }
function toggleTheme() { document.body.dataset.theme = document.body.dataset.theme==="dark"?"light":"dark"; }
function clearAll() { list.innerHTML=""; tasks=[]; save(); updateProgress(); }
function save() { localStorage.setItem('tasks', JSON.stringify(tasks)); }
function showToast(msg) { toast.textContent=msg; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2200); }
