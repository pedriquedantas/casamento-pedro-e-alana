// ===== CONFIGURAÇÕES =====
const CONFIG = {
    dataCasamento: new Date('2026-10-30T17:00:00'),
    pixKey: '099.094.295-35'
};

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Fechar menu ao clicar em um link
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== CONTAGEM REGRESSIVA =====
const diasEl = document.getElementById('dias');
const horasEl = document.getElementById('horas');
const minutosEl = document.getElementById('minutos');
const segundosEl = document.getElementById('segundos');

function atualizarContagem() {
    const agora = new Date();
    const diferenca = CONFIG.dataCasamento - agora;

    if (diferenca <= 0) {
        document.getElementById('countdown').innerHTML =
            '<p style="color: var(--primary-light); font-family: var(--font-display); font-size: 2rem;">Chegou o grande dia! 🎉</p>';
        return;
    }

    const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferenca / (1000 * 60)) % 60);
    const segundos = Math.floor((diferenca / 1000) % 60);

    diasEl.textContent = dias;
    horasEl.textContent = horas;
    minutosEl.textContent = minutos;
    segundosEl.textContent = segundos;
}

setInterval(atualizarContagem, 1000);
atualizarContagem();

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
}

initScrollAnimations();

// ===== FORMULÁRIO RSVP =====
const rsvpForm = document.getElementById('rsvpForm');
const formSuccess = document.getElementById('formSuccess');

rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    const formData = new FormData(rsvpForm);

    fetch(rsvpForm.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    }).then(response => {
        rsvpForm.hidden = true;
        formSuccess.hidden = false;
        showToast('Presença confirmada com sucesso! 🎉');
    }).catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar Presença';
        showToast('Erro ao enviar. Verifique sua conexão e tente novamente.');
    });
});

// ===== MARCAR PRESENTEADOS =====
document.querySelectorAll('.presente-card.presenteado .btn-presente').forEach(btn => {
    btn.textContent = 'Presenteado';
});

// ===== PRESENTES / MODAL =====
const modal = document.getElementById('modalPresente');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalValor = document.getElementById('modalValor');
const modalCopyPix = document.getElementById('modalCopyPix');

document.querySelectorAll('.btn-presente').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.dataset.item;
        const valor = btn.dataset.valor;

        modalTitle.textContent = `Presentear: ${item}`;
        const valorFormatado = parseFloat(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        modalValor.textContent = valor > 0 ? valorFormatado : 'valor livre';
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
    });
});

function fecharModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', fecharModal);
modal.querySelector('.modal-overlay').addEventListener('click', fecharModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) {
        fecharModal();
    }
});

// ===== COPIAR PIX =====
function copiarPix() {
    navigator.clipboard.writeText(CONFIG.pixKey).then(() => {
        showToast('Chave Pix copiada! 📋');
    }).catch(() => {
        // Fallback para navegadores antigos
        const textArea = document.createElement('textarea');
        textArea.value = CONFIG.pixKey;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('Chave Pix copiada! 📋');
    });
}

document.getElementById('btnCopyPix').addEventListener('click', copiarPix);
modalCopyPix.addEventListener('click', copiarPix);

// ===== UTILITÁRIOS =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message) {
    // Remove toast anterior se existir
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== SMOOTH SCROLL para links âncora =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offset = 70;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});
