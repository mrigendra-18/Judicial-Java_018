let loginpage=document.querySelector("#loginpage")
let registerpage=document.querySelector("#registerpage")
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;
ctx.fillStyle="#FFFFFF"
let isDrawing = false;
let tool = 'pen';
let startX, startY;
let drawingSettings = {
    color: '#000',
    lineThickness: 2,
};
let isLocked = false;
let zoomLevel = 1;
let username = localStorage.getItem('username') || '';
const draggable = document.getElementById('draggable');
const draggable2 = document.getElementById('draggable2');
if (username) {
    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    loadWhiteboard();
} else {
    document.getElementById('app').style.display = 'none';
}

function register() {
    const registerUsername = document.getElementById('registerUsername').value;
    const registerPassword = document.getElementById('registerPassword').value;
    
    if (registerUsername && registerPassword) {
        localStorage.setItem(`user_${registerUsername}`, registerPassword);
        showNotification('Registration successful. Please log in.');
    registerpage.innerHTML=""
    loginpage.innerHTML=`  <div  class="form-container">
                <h2>Login</h2>
                <input type="text" id="username" placeholder="Username" required>
                <input type="password" id="password" placeholder="Password" required>
                <button onclick="login()">Login</button>
            </div>`
    } else {
        showNotification('Please enter a username and password.');
    }
   
}

function login() {
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const storedPassword = localStorage.getItem(`user_${usernameInput}`);
    if (storedPassword && storedPassword === passwordInput) {
        username = usernameInput;
        localStorage.setItem('username', username);
        document.getElementById('auth').style.display = 'none';
        document.getElementById('app').style.display = 'flex';
        loadWhiteboard();

    } else {
        showNotification('Invalid username or password.');
    }
}

function logout() {
    localStorage.removeItem('username');
    username = '';
    document.getElementById('app').style.display = 'none';
    document.getElementById('auth').style.display = 'block';
}

function changeTool(selectedTool) {
    tool = selectedTool;
}

function changeColor(selectedColor) {
    drawingSettings.color = selectedColor;
}

function changeThickness(value) {
    drawingSettings.lineThickness = value;
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

function startDrawing(event) {
    if (isLocked) return;
    isDrawing = true;
    startX = (event.clientX - canvas.offsetLeft) / zoomLevel;
    startY = (event.clientY - canvas.offsetTop) / zoomLevel;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
}

function stopDrawing(event) {
    if (isLocked || !isDrawing) return;
    isDrawing = false;
    ctx.closePath();

    if (tool !== 'pen' && tool !== 'eraser') {
        drawShape(event);
    }
}
let value=document.querySelector("#backgroundSelect")
function draw(event) {
    if (isLocked || !isDrawing) return;

    const x = (event.clientX - canvas.offsetLeft) / zoomLevel;
    const y = (event.clientY - canvas.offsetTop) / zoomLevel;

    ctx.lineWidth = tool === 'eraser' ? 10 : drawingSettings.lineThickness;
    ctx.strokeStyle = tool === 'eraser' ? ctx.fillStyle: drawingSettings.color;
    ctx.lineCap = 'round';

    if (tool === 'pen' || tool === 'eraser') {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
}

function drawShape(event) {
    const x = (event.clientX - canvas.offsetLeft) / zoomLevel;
    const y = (event.clientY - canvas.offsetTop) / zoomLevel;

    ctx.lineWidth = drawingSettings.lineThickness;
    ctx.strokeStyle = drawingSettings.color;

    switch (tool) {
        case 'line':
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
            break;
        case 'rectangle':
            ctx.strokeRect(startX, startY, x - startX, y - startY);
            break;
        case 'circle':
            const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
        case 'ellipse':
            const centerX = (startX + x) / 2;
            const centerY = (startY + y) / 2;
            const radiusX = Math.abs(x - startX) / 2;
            const radiusY = Math.abs(y - startY) / 2;
            ctx.beginPath();
            ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;
        
            
    }
}

function clearBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveWhiteboard();
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

function zoomIn() {
    zoomLevel += 0.1;
    canvas.style.transform = `scale(${zoomLevel})`;
}

function zoomOut() {
    zoomLevel = Math.max(1, zoomLevel - 0.1);
    canvas.style.transform = `scale(${zoomLevel})`;
}

function lockCanvas() {
    isLocked = !isLocked;
    document.getElementById('lock').classList.toggle('active');
}

function viewCanvas() {
    document.getElementById('view').classList.toggle('active');
    document.getElementById('app').classList.toggle('view-mode');
}

function saveWhiteboard() {
    const dataURL = canvas.toDataURL();
    localStorage.setItem(`whiteboard_${username}`, dataURL);
    showNotification('Whiteboard saved!');
}

function loadWhiteboard() {
    const dataURL = localStorage.getItem(`whiteboard_${username}`);
    if (dataURL) {
        const img = new Image();
        img.src = dataURL;
        img.onload = () => {
            ctx.drawImage(img, 0, 0);
        };
    }
}

function addStickyNote() {
    draggable.style.display="flex"
    draggable.style.flexDirection="column"
    draggable.style.justifyContent="center"
    draggable.style.alignItems="center"
   let textarea=document.createElement("textarea")
   textarea.placeholder="Enter Text"
   textarea.style.backgroundColor="rgb(229, 255, 247)"
   draggable.append(textarea)
}

function addtext() {
    draggable2.style.display="flex"
    draggable2.style.flexDirection="column"
    draggable2.style.justifyContent="center"
    draggable2.style.alignItems="center"
   let textarea=document.createElement("textarea")
   textarea.placeholder="Enter Text"
   textarea.style.border="none"
   draggable2.append(textarea)
}

function changeCanvasBackground(color) {
    ctx.fillStyle = color === 'custom' ? prompt('Enter custom color:') : color;

    ctx.fillRect(0, 0, canvas.width, canvas.height);
 
}

function exportCanvas() {
    const dataURL = canvas.toDataURL();
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'whiteboard.png';
    link.click();
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function openNewPage() {
    const newWindow = window.open('', '_blank');
    newWindow.document.write(document.documentElement.outerHTML);
    newWindow.document.close();
}

document.addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'z':
                event.preventDefault();
                undo();
                break;
            case 'y':
                event.preventDefault();
                redo();
                break;
            case 's':
                event.preventDefault();
                saveWhiteboard();
                break;
        }
    }
});

function undo() {
    // Implement undo functionality
}

function redo() {
    // Implement redo functionality
}

window.addEventListener('beforeunload', () => {
    saveWhiteboard();
});


draggable.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', '');
    draggable.style.opacity = '0.5';
});

draggable2.addEventListener('dragstart', (event) => {
    event.dataTransfer.setData('text/plain', '');
    draggable2.style.opacity = '0.5';
});

draggable.addEventListener('dragend', (event) => {
    const container = document.getElementById('body');
    const offsetX = event.clientX - container.getBoundingClientRect().left;
    const offsetY = event.clientY - container.getBoundingClientRect().top;
    draggable.style.left = `${offsetX}px`;
    draggable.style.top = `${offsetY}px`;
    draggable.style.opacity = '1';
});

draggable2.addEventListener('dragend', (event) => {
    const container = document.getElementById('body');
    const offsetX = event.clientX - container.getBoundingClientRect().left;
    const offsetY = event.clientY - container.getBoundingClientRect().top;
    draggable2.style.left = `${offsetX}px`;
    draggable2.style.top = `${offsetY}px`;
    draggable2.style.opacity = '1';
});


draggable.addEventListener('dragover', (event) => {
    event.preventDefault();
});

draggable2.addEventListener('dragover', (event) => {
    event.preventDefault();
});
