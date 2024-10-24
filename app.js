const hamburger = document.getElementById('hamburger');
const menuLinks = document.getElementById('menuLinks');

hamburger.addEventListener('click', () => {
    menuLinks.classList.toggle('active');
});

const reactionDropdown = document.getElementById('formula');
const formulaDisplay = document.getElementById('formulaplaceholder');

const formulas = {
    water: '2H₂ + O₂ → 2H₂O',
    ammonia: 'N₂ + 3H₂ → 2NH₃',
    methane: 'CH₄ + 2O₂ → CO₂ + 2H₂O'
};

function resetComponents() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    molecules = [];
    drawRandomMolecules(12);
    leftCtx.clearRect(0, 0, canvasLeft.width, canvasLeft.height);  
    rightCtx.clearRect(0, 0, canvasLeft.width, canvasLeft.height);  
    purplemolecules = [];
    yellowmolecules = [];
    purpleleftovers = [];
    yellowleftovers = [];
    updateCount();
}

reactionDropdown.addEventListener('change', () => {
    const selectedValue = reactionDropdown.value;
    formulaDisplay.textContent = formulas[selectedValue];
    resetComponents();
});

/**
 * 
 * DRAGGING LOGIC
 */

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasLeft = document.getElementById('canvasleft');
const leftCtx = canvasLeft.getContext('2d');
const gravity = 0.6;

let molecules = [];
let purplemolecules = [];
let yellowmolecules = [];
const productmolecules = Math.min(purplemolecules.length, yellowmolecules.length);
let purpleleftovers = [];
let yellowleftovers = [];
let isDragging = false;
let draggedMolecule = null;
let mousePosition = { x: 0, y: 0 };

const purpleImage = new Image();
purpleImage.src = '../assets/purple.png';

const yellowImage = new Image();
yellowImage.src = '../assets/yellow.png';

const productImage = new Image();
productImage.src = '../assets/combined.png';

function createMolecule(x, y, image, id, type) {
    const targetY = Math.random() * 100;
    let bounced = false;
    let bounceFactor = -0.7;  
    const friction = 0.98;  
    const minVelocity = 0.5; 

    return {
        id: id,
        x: x,
        y: y,
        velocityY: Math.random() * 2,
        radius: 20,
        image: image,
        hasDropped: false,
        isDraggable: false,
        type: type,
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.radius * 2, this.radius * 2);
        },
        update() {
            if (!this.hasDropped) {
                this.y += this.velocityY;
                this.velocityY += gravity;

                if (this.y + this.radius * 2 >= canvas.height) {
                    this.y = canvas.height - this.radius * 2; 

                    if (!bounced || Math.abs(this.velocityY) > minVelocity) {
                        this.velocityY *= bounceFactor; 
                        this.velocityY *= friction;
                        bounced = true; 
                    } else {
                        this.velocityY = 0;  
                    }
                }
                if (bounced && this.y >= targetY && Math.abs(this.velocityY) < minVelocity) {
                    this.y = targetY;
                    this.velocityY = 0;  
                    this.hasDropped = true; 
                    this.isDraggable = true;  
                }
            }
        }
    };
}


function drawRandomMolecules(numMolecules) {
    Promise.all([purpleImage.decode(), yellowImage.decode()]).then(() => {
        for (let i = 0; i < numMolecules; i++) {
            const x = Math.random() * (canvas.width - 40);
            const y = Math.random() * canvas.height / 2;  // Random initial Y
            const image = (i < numMolecules / 2) ? purpleImage : yellowImage;  
            molecules[i] = (createMolecule(x, y, image, i, (i < numMolecules / 2) ? "purple" : "yellow"));
        }
        animate();
    });

}


function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    molecules.forEach(molecule => {
        molecule.update();
        molecule.draw(ctx);
    });
    requestAnimationFrame(animate);
}


function isMouseOverMolecule(molecule, mouseX, mouseY) {
    const dx = mouseX - (molecule.x + molecule.radius);
    const dy = mouseY - (molecule.y + molecule.radius);
    return (dx * dx + dy * dy) <= molecule.radius * molecule.radius;
}


canvas.addEventListener('mousemove', (event) => {
    mousePosition.x = event.clientX - canvas.offsetLeft;
    mousePosition.y = event.clientY - canvas.offsetTop;

    let moleculeHovered = false;

    if (isDragging && draggedMolecule) {
        draggedMolecule.x = mousePosition.x - draggedMolecule.radius;
        draggedMolecule.y = mousePosition.y - draggedMolecule.radius;
    } else {
        molecules.forEach((molecule) => {
            if (isMouseOverMolecule(molecule, mousePosition.x, mousePosition.y) && molecule.isDraggable) {
                canvas.style.cursor = 'grab';  
                moleculeHovered = true;
            }
        });
    }

    if (!moleculeHovered && !isDragging) {
        canvas.style.cursor = 'default'; 
    }
});

canvasleft.addEventListener('mousemove', (event) => {
    mousePosition.x = event.clientX - canvas.offsetLeft;
    mousePosition.y = event.clientY - canvas.offsetTop;

    let moleculeHovered = false;

    if (isDragging && draggedMolecule) {
        draggedMolecule.x = mousePosition.x - draggedMolecule.radius;
        draggedMolecule.y = mousePosition.y - draggedMolecule.radius;
    } else {
        // Check if the mouse is hovering over any molecule
        molecules.forEach((molecule) => {
            if (isMouseOverMolecule(molecule, mousePosition.x, mousePosition.y) && molecule.isDraggable) {
                canvas.style.cursor = 'grab'; 
                moleculeHovered = true;
            }
        });
    }

    if (!moleculeHovered && !isDragging) {
        canvas.style.cursor = 'default'; 
    }
});

canvas.addEventListener('mousedown', (event) => {
    mousePosition.x = event.clientX - canvas.offsetLeft;
    mousePosition.y = event.clientY - canvas.offsetTop;


    molecules.forEach((molecule) => {
        if (isMouseOverMolecule(molecule, mousePosition.x, mousePosition.y) && molecule.isDraggable) {
            isDragging = true;
            draggedMolecule = molecule;
            canvas.style.cursor = 'grabbing';  
        }
    });
});


canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedMolecule = null;
    canvas.style.cursor = 'default'; 
});


canvasLeft.addEventListener('drop', (event) => {
    event.preventDefault();

    const dropX = event.clientX - canvasLeft.offsetLeft;
    const dropY = event.clientY - canvasLeft.offsetTop;

    if (draggedMolecule) {
        draggedMolecule.x = dropX - draggedMolecule.radius;
        draggedMolecule.y = dropY - draggedMolecule.radius;
        draggedMolecule.draw(leftCtx);
        if (draggedMolecule.type == "purple") {
            purplemolecules.push(draggedMolecule);
            purpleleftovers.push(draggedMolecule);
        } else {
            yellowmolecules.push(draggedMolecule);
            yellowleftovers.push(draggedMolecule);
        }
        updateCount();
        drawProductsAndLeftovers();
        delete molecules[draggedMolecule.id];
        draggedMolecule = null;

    }
});


canvasLeft.addEventListener('dragover', (event) => {
    event.preventDefault();
});

const resetButton = document.getElementById('reset');
resetButton.addEventListener('click', () => {
    resetComponents();
});


canvas.addEventListener('mousedown', () => {
    window.scrollTo(0, 0);
});

function updateCount() {
    let purpleDisplay = document.getElementById("purplevalueatom");
    let yellowDisplay = document.getElementById("yellowvalueatom");
    let productDisplay = document.getElementById("productvalueatom");
    let yellowLeftover = document.getElementById("yellowleftover");
    let purpleLeftover = document.getElementById("purpleleftover");
    purpleDisplay.textContent = purplemolecules.length;
    yellowDisplay.textContent = yellowmolecules.length;
    const products = Math.min(purplemolecules.length, yellowmolecules.length);
    productDisplay.textContent = products;
    yellowLeftover.textContent = yellowleftovers.length - products;
    purpleLeftover.textContent = purpleleftovers.length - products;
}

const canvasRight = document.getElementById('canvasright');
const rightCtx = canvasRight.getContext('2d');


function drawProductsAndLeftovers() {
    rightCtx.clearRect(0, 0, canvasRight.width, canvasRight.height);  

    const productCount = Math.min(purplemolecules.length, yellowmolecules.length);  
    const purpleLeftoverCount = purplemolecules.length - productCount;  
    const yellowLeftoverCount = yellowmolecules.length - productCount;  

    let xOffset = 10;
    const yOffset = 10;
    const moleculeSize = 40;  

    for (let i = 0; i < productCount; i++) {
        rightCtx.drawImage(productImage, xOffset, yOffset, moleculeSize, moleculeSize); 
        xOffset += moleculeSize * 2 + 10;  
    }


    for (let i = 0; i < purpleLeftoverCount; i++) {
        rightCtx.drawImage(purpleImage, xOffset, yOffset, moleculeSize, moleculeSize); 
        xOffset += moleculeSize + 10;  
    }

    for (let i = 0; i < yellowLeftoverCount; i++) {
        rightCtx.drawImage(yellowImage, xOffset, yOffset, moleculeSize, moleculeSize); 
        xOffset += moleculeSize + 10; 
    }
}