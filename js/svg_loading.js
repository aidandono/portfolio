let balloonElement = null;
let balloonTime = 0;

fetch('svgs/scene.svg')
    .then(response => response.text())
    .then(svgText => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgText;
        const svgElement = tempDiv.querySelector('svg');
        
        if (svgElement) {
            svgElement.style.width = '100vw';
            svgElement.style.height = '100vh';
            svgElement.style.display = 'block';
            svgElement.style.objectFit = 'cover';
            svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice');
            
            document.getElementById('svg-container').appendChild(svgElement);
        }
    })
    .catch(error => console.error('Error loading landscape SVG:', error));

fetch('svgs/name.svg')
    .then(response => response.text())
    .then(svgText => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgText;
        const svgElement = tempDiv.querySelector('svg');
        
        if (svgElement) {
            const viewBox = svgElement.getAttribute('viewBox');
            if (viewBox) {
                const [, , width, height] = viewBox.split(' ').map(Number);
                svgElement.setAttribute('width', width);
                svgElement.setAttribute('height', height);
            }
            document.getElementById('name-container').appendChild(svgElement);
        }
    })
    .catch(error => console.error('Error loading name SVG:', error));

fetch('svgs/balloon.svg')
    .then(response => response.text())
    .then(svgText => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgText;
        const svgElement = tempDiv.querySelector('svg');
        
        if (svgElement) {
            const viewBox = svgElement.getAttribute('viewBox');
            if (viewBox) {
                const [, , width, height] = viewBox.split(' ').map(Number);
                svgElement.setAttribute('width', width);
                svgElement.setAttribute('height', height);
            }
            balloonElement = document.getElementById('balloon-container');
            balloonElement.appendChild(svgElement);
            
            startBalloonAnimation();
        }
    })
    .catch(error => console.error('Error loading balloon SVG:', error));

fetch('svgs/cloud1.svg')
    .then(response => response.text())
    .then(svgText => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgText;
        const svgElement = tempDiv.querySelector('svg');
        
        if (svgElement) {
            const viewBox = svgElement.getAttribute('viewBox');
            if (viewBox) {
                const [, , width, height] = viewBox.split(' ').map(Number);
                svgElement.setAttribute('width', width);
                svgElement.setAttribute('height', height);
            }
            const cloudContainer = document.getElementById('cloud1-container');
            cloudContainer.appendChild(svgElement);
        }
    })
    .catch(error => console.error('Error loading cloud1 SVG:', error));

fetch('svgs/cloud2.svg')
    .then(response => response.text())
    .then(svgText => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgText;
        const svgElement = tempDiv.querySelector('svg');
        
        if (svgElement) {
            const viewBox = svgElement.getAttribute('viewBox');
            if (viewBox) {
                const [, , width, height] = viewBox.split(' ').map(Number);
                svgElement.setAttribute('width', width);
                svgElement.setAttribute('height', height);
            }
            const cloudContainer = document.getElementById('cloud2-container');
            cloudContainer.appendChild(svgElement);
        }
    })
    .catch(error => console.error('Error loading cloud2 SVG:', error));


fetch('svgs/cloud3.svg')
    .then(response => response.text())
    .then(svgText => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgText;
        const svgElement = tempDiv.querySelector('svg');
        
        if (svgElement) {
            const viewBox = svgElement.getAttribute('viewBox');
            if (viewBox) {
                const [, , width, height] = viewBox.split(' ').map(Number);
                svgElement.setAttribute('width', width);
                svgElement.setAttribute('height', height);
            }
            const cloudContainer = document.getElementById('cloud3-container');
            cloudContainer.appendChild(svgElement);
        }
    })
    .catch(error => console.error('Error loading cloud3 SVG:', error));

function startBalloonAnimation() {
    function animateBalloon() {
        if (!balloonElement) return;
        
        balloonTime += 0.002; 
        
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const scaleX = Math.min(window.innerWidth * 0.3, 300); 
        const scaleY = Math.min(window.innerHeight * 0.2, 150); 
        
        const balloonX = centerX + Math.sin(balloonTime) * scaleX;
        const balloonY = centerY + Math.sin(2 * balloonTime) * scaleY;
        
        // Update balloon position
        balloonElement.style.left = balloonX + 'px';
        balloonElement.style.top = balloonY + 'px';
        
        requestAnimationFrame(animateBalloon);
    }
    
    animateBalloon();
}