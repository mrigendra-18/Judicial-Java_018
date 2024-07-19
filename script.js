const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth - 20;
canvas.height = window.innerHeight - 100;

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

function draw(event) {
    if (isLocked || !isDrawing) return;

    const x = (event.clientX - canvas.offsetLeft) / zoomLevel;
    const y = (event.clientY - canvas.offsetTop) / zoomLevel;

    ctx.lineWidth = tool === 'eraser' ? 10 : drawingSettings.lineThickness;
    ctx.strokeStyle = tool === 'eraser' ? '#fff' : drawingSettings.color;
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
        case 'text':
            const text = prompt('Enter text:');
            if (text) {
                ctx.font = `${drawingSettings.lineThickness * 10}px Arial`;
                ctx.fillStyle = drawingSettings.color;
                ctx.fillText(text, x, y);
            }
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
    const note = prompt('Enter your note:');
    if (note) {
        ctx.font = '20px Arial';
        ctx.fillStyle = 'yellow';
        ctx.fillRect(startX, startY, 200, 100);
        ctx.fillStyle = 'black';
        ctx.fillText(note, startX + 10, startY + 50);
    }
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


window.addEventListener('beforeunload', () => {
    saveWhiteboard();
});
