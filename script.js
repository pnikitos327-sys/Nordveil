// Three.js код
(function() {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    scene.background = null;
    
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 12);
    
    const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const ambientLight = new THREE.AmbientLight(0x404060);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(1, 1, 1);
    scene.add(dirLight);
    
    const sphereGroup = new THREE.Group();
    sphereGroup.position.set(2, 0, 0);
    
    const wireframeGeo = new THREE.SphereGeometry(1.8, 24, 24);
    const wireframeMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.15
    });
    const wireframeSphere = new THREE.Mesh(wireframeGeo, wireframeMat);
    sphereGroup.add(wireframeSphere);
    
    scene.add(sphereGroup);
    
    function createParticles(count, size, opacity) {
        const particlesGeo = new THREE.BufferGeometry();
        const particlesPos = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            const radius = 5 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            particlesPos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            particlesPos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            particlesPos[i * 3 + 2] = radius * Math.cos(phi);
        }
        
        particlesGeo.setAttribute('position', new THREE.BufferAttribute(particlesPos, 3));
        
        const particlesMat = new THREE.PointsMaterial({
            color: 0xffffff,
            size: size,
            transparent: true,
            opacity: opacity,
            sizeAttenuation: true
        });
        
        return new THREE.Points(particlesGeo, particlesMat);
    }
    
    const particles = createParticles(1000, 0.02, 0.4);
    scene.add(particles);
    
    function animate() {
        requestAnimationFrame(animate);
        
        sphereGroup.rotation.y += 0.001;
        sphereGroup.rotation.x += 0.0005;
        particles.rotation.y += 0.0002;
        
        renderer.render(scene, camera);
    }
    
    animate();
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
})();

// Корзина
let cartCount = 0;

window.addToCart = function(event, name, price) {
    event.stopPropagation();
    cartCount++;
    alert(`${name} добавлен в корзину! Цена: €${price}`);
};

// Избранное (wishlist)
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const card = this.closest('.product-card');
        const productId = card.dataset.product;
        
        if (wishlist.includes(productId)) {
            wishlist = wishlist.filter(id => id !== productId);
            this.classList.remove('active');
            this.textContent = '♡';
        } else {
            wishlist.push(productId);
            this.classList.add('active');
            this.textContent = '♥';
        }
        
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    });
});

// Фильтрация
const filterBtns = document.querySelectorAll('.filter-btn');
const products = document.querySelectorAll('.product-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.dataset.filter;
        
        products.forEach(product => {
            if (filter === 'all' || product.dataset.category === filter) {
                product.classList.remove('hidden');
            } else {
                product.classList.add('hidden');
            }
        });
        
        updateCarouselPosition();
    });
});

// Карусель
const track = document.getElementById('carousel-track');
const leftArrow = document.getElementById('carousel-left');
const rightArrow = document.getElementById('carousel-right');
const indicatorsContainer = document.getElementById('carousel-indicators');

let currentIndex = 0;
const cardsPerView = 3;

function updateCarouselPosition() {
    const visibleCards = [...products].filter(p => !p.classList.contains('hidden'));
    if (visibleCards.length === 0) return;
    
    const cardWidth = products[0].offsetWidth + 15;
    const maxIndex = Math.max(0, visibleCards.length - cardsPerView);
    if (currentIndex > maxIndex) currentIndex = maxIndex;
    
    track.style.transform = `translateX(-${currentIndex * cardWidth}px)`;
    updateIndicators();
    updateArrows();
}

function updateArrows() {
    const visibleCards = [...products].filter(p => !p.classList.contains('hidden'));
    const maxIndex = Math.max(0, visibleCards.length - cardsPerView);
    
    leftArrow.classList.toggle('disabled', currentIndex === 0);
    rightArrow.classList.toggle('disabled', currentIndex >= maxIndex);
}

function createIndicators() {
    const visibleCards = [...products].filter(p => !p.classList.contains('hidden'));
    const numIndicators = Math.ceil(visibleCards.length / cardsPerView);
    
    indicatorsContainer.innerHTML = '';
    
    for (let i = 0; i < numIndicators; i++) {
        const indicator = document.createElement('div');
        indicator.classList.add('indicator');
        if (i === 0) indicator.classList.add('active');
        
        indicator.addEventListener('click', () => {
            currentIndex = i * cardsPerView;
            updateCarouselPosition();
        });
        
        indicatorsContainer.appendChild(indicator);
    }
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    const visibleCards = [...products].filter(p => !p.classList.contains('hidden'));
    const activeIndex = Math.floor(currentIndex / cardsPerView);
    
    indicators.forEach((ind, idx) => {
        if (idx === activeIndex) {
            ind.classList.add('active');
        } else {
            ind.classList.remove('active');
        }
    });
}

leftArrow.addEventListener('click', () => {
    const visibleCards = [...products].filter(p => !p.classList.contains('hidden'));
    if (currentIndex > 0) {
        currentIndex -= cardsPerView;
        updateCarouselPosition();
    }
});

rightArrow.addEventListener('click', () => {
    const visibleCards = [...products].filter(p => !p.classList.contains('hidden'));
    const maxIndex = Math.max(0, visibleCards.length - cardsPerView);
    
    if (currentIndex < maxIndex) {
        currentIndex += cardsPerView;
        updateCarouselPosition();
    }
});

createIndicators();

// Таймер
function updateTimer() {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 24);
    endDate.setHours(endDate.getHours() + 12);
    endDate.setMinutes(endDate.getMinutes() + 30);
    endDate.setSeconds(endDate.getSeconds() + 45);
    
    const now = new Date();
    const diff = endDate - now;
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days;
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
}

setInterval(updateTimer, 1000);

// Size guide
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        this.parentElement.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

// Активация меню при скролле
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav a');

function updateActiveMenu() {
    let current = '';
    const scrollPos = window.scrollY + 120;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;
        
        if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

updateActiveMenu();

window.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
        updateActiveMenu();
    });
});

window.addEventListener('resize', updateCarouselPosition);