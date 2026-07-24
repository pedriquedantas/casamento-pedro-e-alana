// ===== CONFIGURAÇÕES =====
const CONFIG = {
    dataCasamento: new Date('2026-10-30T17:00:00')
};

// ===== NAVBAR =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== CONTAGEM REGRESSIVA =====
function atualizarContagem() {
    const agora = new Date();
    const diferenca = CONFIG.dataCasamento - agora;

    if (diferenca <= 0) {
        document.getElementById('countdown').innerHTML =
            '<p style="color: var(--primary-light); font-family: var(--font-display); font-size: 2rem;">Chegou o grande dia! 🎉</p>';
        return;
    }

    document.getElementById('dias').textContent = Math.floor(diferenca / (1000 * 60 * 60 * 24));
    document.getElementById('horas').textContent = Math.floor((diferenca / (1000 * 60 * 60)) % 24);
    document.getElementById('minutos').textContent = Math.floor((diferenca / (1000 * 60)) % 60);
    document.getElementById('segundos').textContent = Math.floor((diferenca / 1000) % 60);
}

setInterval(atualizarContagem, 1000);
atualizarContagem();

// ===== SCROLL ANIMATIONS =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

// ===== FIREBASE - PRESENTES AUTOMÁTICOS =====
const FIREBASE_URL = 'https://casamento-pedro-e-alana-default-rtdb.firebaseio.com';

// Carregar presentes já dados ao abrir o site
async function carregarPresenteados() {
    try {
        const response = await fetch(`${FIREBASE_URL}/presenteados.json`);
        const data = await response.json();
        if (data) {
            const nomesPresenteados = Object.values(data);
            document.querySelectorAll('.modal-presente-item').forEach(item => {
                if (nomesPresenteados.includes(item.dataset.item)) {
                    item.classList.add('presenteado');
                    item.style.opacity = '0.4';
                    item.style.pointerEvents = 'none';
                }
            });
        }
    } catch (e) {
        console.log('Erro ao carregar presenteados:', e);
    }
}

// Salvar presentes no Firebase após confirmação
async function salvarPresenteados(presentes) {
    for (const p of presentes) {
        await fetch(`${FIREBASE_URL}/presenteados.json`, {
            method: 'POST',
            body: JSON.stringify(p.nome),
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

carregarPresenteados();

// ===== PRESENTES - MÚLTIPLA SELEÇÃO =====
let presentesSelecionados = [];
const presentesContainer = document.getElementById('presentesEscolhidos');
const presenteHidden = document.getElementById('presenteHidden');
const btnEscolher = document.getElementById('btnEscolherPresente');
const modalIntro = document.getElementById('modalIntro');
const modalPresentes = document.getElementById('modalPresentes');
const modalClose = document.getElementById('modalClose');
const btnVerPresentes = document.getElementById('btnVerPresentes');

function atualizarPresentes() {
    const submitBtn = document.querySelector('.btn-submit');
    if (presentesSelecionados.length === 0) {
        presentesContainer.innerHTML = '<p class="presentes-placeholder">Nenhum presente selecionado ainda</p>';
        presenteHidden.value = '';
        submitBtn.classList.remove('visivel');
    } else {
        presentesContainer.innerHTML = presentesSelecionados.map((p, i) =>
            `<span class="presente-tag">${p.nome} <button class="remover-presente" data-index="${i}">&times;</button></span>`
        ).join('');
        presenteHidden.value = presentesSelecionados.map(p => `${p.nome} (${p.valor})`).join(', ');
        submitBtn.classList.add('visivel');
    }
}

// Remover presente
presentesContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remover-presente')) {
        const index = parseInt(e.target.dataset.index);
        const removido = presentesSelecionados[index].nome;
        presentesSelecionados.splice(index, 1);
        atualizarPresentes();

        // Desmarcar no modal também
        document.querySelectorAll('.modal-presente-item').forEach(item => {
            if (item.dataset.item === removido) {
                item.classList.remove('selecionado');
            }
        });
        atualizarStatusModal();
    }
});

// Abrir modal intro ao clicar no botão
let jaViuIntro = false;
btnEscolher.addEventListener('click', () => {
    if (!jaViuIntro) {
        modalIntro.hidden = false;
        document.body.style.overflow = 'hidden';
        jaViuIntro = true;
    } else {
        modalPresentes.hidden = false;
        document.body.style.overflow = 'hidden';
        sincronizarModal();
    }
});

// Do intro para os presentes
btnVerPresentes.addEventListener('click', () => {
    modalIntro.hidden = true;
    modalPresentes.hidden = false;
    sincronizarModal();
});

// Sincronizar estado visual do modal com presentes selecionados
function sincronizarModal() {
    document.querySelectorAll('.modal-presente-item:not(.presenteado)').forEach(item => {
        const nome = item.dataset.item;
        if (presentesSelecionados.find(p => p.nome === nome)) {
            item.classList.add('selecionado');
        } else {
            item.classList.remove('selecionado');
        }
    });
    atualizarStatusModal();
}

// Fechar modal intro clicando no overlay
modalIntro.querySelector('.modal-overlay').addEventListener('click', () => {
    modalIntro.hidden = true;
    document.body.style.overflow = '';
});

// Fechar modal presentes
function fecharModalPresentes() {
    modalPresentes.hidden = true;
    document.body.style.overflow = '';
    document.getElementById('modalFooter').classList.remove('visivel');
}

modalClose.addEventListener('click', fecharModalPresentes);
modalPresentes.querySelector('.modal-overlay').addEventListener('click', fecharModalPresentes);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!modalPresentes.hidden) fecharModalPresentes();
        else if (!modalIntro.hidden) {
            modalIntro.hidden = true;
            document.body.style.overflow = '';
        }
    }
});

// Selecionar presente no modal (toggle)
const modalStatus = document.getElementById('modalStatus');
const btnConfirmar = document.getElementById('btnConfirmarPresentes');

function atualizarStatusModal() {
    const count = presentesSelecionados.length;
    const footer = document.getElementById('modalFooter');
    if (count === 0) {
        modalStatus.textContent = 'Nenhum presente selecionado';
        footer.classList.remove('visivel');
    } else {
        footer.classList.add('visivel');
        if (count === 1) {
            modalStatus.textContent = '1 presente selecionado';
        } else {
            modalStatus.textContent = `${count} presentes selecionados`;
        }
    }
}

document.querySelectorAll('.modal-presente-item:not(.presenteado)').forEach(item => {
    item.addEventListener('click', () => {
        const nome = item.dataset.item;
        const valor = parseFloat(item.dataset.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        // Toggle: se já selecionado, remove
        const index = presentesSelecionados.findIndex(p => p.nome === nome);
        if (index !== -1) {
            presentesSelecionados.splice(index, 1);
            item.classList.remove('selecionado');
        } else {
            presentesSelecionados.push({ nome, valor });
            item.classList.add('selecionado');
        }

        atualizarPresentes();
        atualizarStatusModal();
    });
});

// Botão "Pronto" no modal já confirma presença direto
btnConfirmar.addEventListener('click', () => {
    if (presentesSelecionados.length === 0) {
        showToast('Selecione ao menos um presente!');
        return;
    }

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();

    if (!nome || !email) {
        fecharModalPresentes();
        showToast('Preencha seu nome e e-mail primeiro!');
        document.getElementById('nome').focus();
        return;
    }

    fecharModalPresentes();
    // Dispara o submit do formulário automaticamente
    atualizarPresentes();
    rsvpForm.requestSubmit();
});

// ===== FORMULÁRIO RSVP =====
const rsvpForm = document.getElementById('rsvpForm');
const formSuccess = document.getElementById('formSuccess');

rsvpForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (presentesSelecionados.length === 0) {
        showToast('Escolha ao menos um presente! 🎁');
        btnEscolher.click();
        return;
    }

    const submitBtn = rsvpForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verificando disponibilidade...';

    // Verificar se algum presente já foi dado
    try {
        const response = await fetch(`${FIREBASE_URL}/presenteados.json`);
        const data = await response.json();
        const jaPreseneados = data ? Object.values(data) : [];

        const conflitos = presentesSelecionados.filter(p => jaPreseneados.includes(p.nome));

        if (conflitos.length > 0) {
            // Remover os que já foram dados
            conflitos.forEach(c => {
                const idx = presentesSelecionados.findIndex(p => p.nome === c.nome);
                if (idx !== -1) presentesSelecionados.splice(idx, 1);
            });
            atualizarPresentes();
            sincronizarModal();

            // Marcar no modal como presenteado
            document.querySelectorAll('.modal-presente-item').forEach(item => {
                if (jaPreseneados.includes(item.dataset.item)) {
                    item.classList.add('presenteado');
                    item.classList.remove('selecionado');
                    item.style.opacity = '0.4';
                    item.style.pointerEvents = 'none';
                }
            });

            const nomes = conflitos.map(c => c.nome).join(', ');
            showToast(`⚠️ ${nomes} já foi presenteado! Escolha outro.`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Confirmar Presença';
            return;
        }
    } catch (err) {
        // Se der erro na verificação, continua mesmo assim
        console.log('Erro ao verificar:', err);
    }

    if (presentesSelecionados.length === 0) {
        showToast('Todos os presentes que você escolheu já foram dados. Escolha outros! 🎁');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar Presença';
        btnEscolher.click();
        return;
    }

    submitBtn.textContent = 'Enviando...';

    const formData = new FormData(rsvpForm);

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
    }).then(response => response.json()).then(data => {
        if (data.success) {
            // Salvar presentes no Firebase
            salvarPresenteados(presentesSelecionados);
            rsvpForm.hidden = true;
            formSuccess.hidden = false;
            showToast('Presença confirmada com sucesso! 🎉');
        } else {
            throw new Error('Erro');
        }
    }).catch(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmar Presença';
        showToast('Erro ao enviar. Tente novamente.');
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - 70;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ===== TOAST =====
function showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
