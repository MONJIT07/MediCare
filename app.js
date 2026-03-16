
const API_BASE = 'http://localhost:5000/api';

const getToken   = () => localStorage.getItem('medicare_token');
const getUser    = () => JSON.parse(localStorage.getItem('medicare_user') || 'null');
const setSession = (token, user) => {
  localStorage.setItem('medicare_token', token);
  localStorage.setItem('medicare_user', JSON.stringify(user));
};
const clearSession = () => {
  localStorage.removeItem('medicare_token');
  localStorage.removeItem('medicare_user');
};

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

const FALLBACK_DOCTORS = [
  { _id: '1', name: 'Dr. Arjun Sharma',  department: 'Cardiology',    experience: 12, rating: 4.9, patients: 1200, color: '#10b981', available: true },
  { _id: '2', name: 'Dr. Priya Mehta',   department: 'Neurology',     experience: 10, rating: 4.8, patients: 980,  color: '#3b82f6', available: true },
  { _id: '3', name: 'Dr. Rahul Gupta',   department: 'Orthopedics',   experience: 15, rating: 4.9, patients: 1500, color: '#8b5cf6', available: true },
  { _id: '4', name: 'Dr. Sneha Iyer',    department: 'Pediatrics',    experience: 8,  rating: 4.7, patients: 2100, color: '#f59e0b', available: true },
  { _id: '5', name: 'Dr. Vikram Singh',  department: 'Oncology',      experience: 18, rating: 5.0, patients: 850,  color: '#ef4444', available: true },
  { _id: '6', name: 'Dr. Ananya Rao',    department: 'Dermatology',   experience: 7,  rating: 4.8, patients: 1300, color: '#06b6d4', available: true },
  { _id: '7', name: 'Dr. Rohit Patel',   department: 'Ophthalmology', experience: 11, rating: 4.9, patients: 900,  color: '#84cc16', available: false },
  { _id: '8', name: 'Dr. Kavita Joshi',  department: 'Gynecology',    experience: 13, rating: 4.7, patients: 1800, color: '#ec4899', available: true },
];

const FALLBACK_DEPARTMENTS = [
  { name: 'Cardiology',     icon: 'fas fa-heartbeat',  description: 'Advanced heart care with modern diagnostic tools.' },
  { name: 'Neurology',      icon: 'fas fa-brain',      description: 'Neurological treatments for brain and nervous system disorders.' },
  { name: 'Orthopedics',    icon: 'fas fa-bone',       description: 'Expert bone and joint care, sports injuries, and joint replacement.' },
  { name: 'Pediatrics',     icon: 'fas fa-baby',       description: 'Specialized child healthcare from newborns through adolescence.' },
  { name: 'Oncology',       icon: 'fas fa-ribbon',     description: 'Advanced cancer treatment with cutting-edge technology.' },
  { name: 'Ophthalmology',  icon: 'fas fa-eye',        description: 'Complete eye care from vision correction to surgery.' },
  { name: 'Pulmonology',    icon: 'fas fa-lungs',      description: 'Expert diagnosis and treatment for respiratory diseases.' },
  { name: 'Gynecology',     icon: 'fas fa-venus',      description: 'Comprehensive women\'s health services.' },
  { name: 'Dermatology',    icon: 'fas fa-hand-paper', description: 'Expert skin, hair, and nail treatments.' },
  { name: 'Radiology',      icon: 'fas fa-x-ray',      description: 'Advanced imaging: MRI, CT Scan, X-ray, and Ultrasound.' },
  { name: 'Emergency Care', icon: 'fas fa-procedures', description: '24/7 emergency services with dedicated trauma team.' },
  { name: 'Dental Care',    icon: 'fas fa-tooth',      description: 'Complete dental services including cosmetic treatments.' },
];

const testimonials = [
  { name: "Pooja Verma",    role: "Patient · Cardiology",  rating: 5, text: "MediCare+ gave me my life back. Dr. Sharma was incredibly attentive and the team made me feel safe throughout my treatment.", color: "#10b981" },
  { name: "Ravi Kumar",     role: "Patient · Orthopedics", rating: 5, text: "After knee surgery, the recovery plan by Dr. Gupta was exceptional. I'm back on my feet within weeks! Highly recommend.", color: "#3b82f6" },
  { name: "Sunita Agarwal", role: "Patient · Pediatrics",  rating: 5, text: "Dr. Sneha is amazing with my kids. The clinic is child-friendly and the staff is always warm and professional.", color: "#8b5cf6" },
  { name: "Amit Joshi",     role: "Patient · Neurology",   rating: 5, text: "Dr. Priya explained everything so clearly. The care I received was world-class and the facilities are top-notch.", color: "#f59e0b" },
  { name: "Meera Nair",     role: "Patient · Dermatology", rating: 4, text: "Dr. Ananya's treatment plan cleared my skin issues in just 6 weeks. The whole experience was fantastic.", color: "#ec4899" },
  { name: "Suresh Pillai",  role: "Patient · Emergency",   rating: 5, text: "The emergency team responded within minutes and saved my father's life. Forever grateful for their expert care.", color: "#ef4444" },
];

let allDoctors     = [];
let isBackendOnline = false;

async function loadDoctors() {
  try {
    const data = await apiFetch('/doctors');
    allDoctors = data.doctors;
    isBackendOnline = true;
    showBackendBadge(true);
  } catch {
    allDoctors = FALLBACK_DOCTORS;
    isBackendOnline = false;
    showBackendBadge(false);
  }
  renderDoctors(allDoctors);
}

async function loadDepartments() {
  let departments = FALLBACK_DEPARTMENTS;
  try {
    const data = await apiFetch('/departments');
    if (data.departments && data.departments.length > 0) {
      departments = data.departments;
    }
  } catch {}
  renderServices(departments);
  populateDeptSelects(departments);
}

async function loadStats() {
  try {
    const data = await apiFetch('/stats');
    if (data.stats) {

      const targets = {
        0: data.stats.doctors      || 500,
        1: data.stats.patients     || 50000,
        2: data.stats.departments  || 20,
        3: data.stats.appointments || 100000,
      };
      document.querySelectorAll('.stat-number').forEach((el, i) => {
        if (targets[i] !== undefined) {
          el.setAttribute('data-target', targets[i]);
        }
      });
    }
  } catch {}
}

function showBackendBadge(online) {
  const existing = document.getElementById('backend-badge');
  if (existing) existing.remove();

  const badge = document.createElement('div');
  badge.id = 'backend-badge';
  badge.style.cssText = `
    position: fixed; bottom: 5rem; left: 1.5rem; z-index: 999;
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.4rem 0.85rem; border-radius: 100px;
    font-size: 0.75rem; font-weight: 600;
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    transition: all 0.3s;
    cursor: pointer;
    ${online
      ? 'background: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;'
      : 'background: #fff7ed; color: #92400e; border: 1px solid #fde68a;'}
  `;
  badge.innerHTML = `
    <span style="width:7px;height:7px;border-radius:50%;background:${online ? '#10b981' : '#f59e0b'}"></span>
    ${online ? 'Backend: Live' : 'Backend: Offline (demo mode)'}
  `;
  badge.title = online
    ? 'Connected to MongoDB backend at localhost:5000'
    : 'Backend not running — showing demo data. Start backend with: cd backend && npm run dev';
  document.body.appendChild(badge);
}

function populateDeptSelects(departments) {
  const selects = ['apt-dept', 'ct-dept'];
  selects.forEach(id => {
    const sel = document.getElementById(id);
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = `<option value="">Select Department</option>`;
    departments.forEach(d => {
      sel.innerHTML += `<option value="${d.name}">${d.name}</option>`;
    });
    if (current) sel.value = current;
  });
}

function renderDoctors(list) {
  const grid = document.getElementById('doctors-grid');
  const noResults = document.getElementById('no-results');

  if (list.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    return;
  }
  noResults.style.display = 'none';

  grid.innerHTML = list.map(doc => {
    const initials = doc.name.split(' ').filter(w => w !== 'Dr.').map(w => w[0]).slice(0, 2).join('');
    const pCount = doc.patients >= 1000 ? (doc.patients / 1000).toFixed(1) + 'K' : doc.patients;
    const availBadge = doc.available
      ? `<span style="display:inline-block;padding:0.18rem 0.6rem;background:#d1fae5;color:#065f46;border-radius:100px;font-size:0.7rem;font-weight:600">Available</span>`
      : `<span style="display:inline-block;padding:0.18rem 0.6rem;background:#fee2e2;color:#991b1b;border-radius:100px;font-size:0.7rem;font-weight:600">Busy</span>`;

    return `
      <div class="doctor-card animate-in">
        <div class="doctor-card-banner"></div>
        <div class="doctor-avatar-wrap">
          <div class="doctor-avatar" style="background: linear-gradient(135deg, ${doc.color}, ${doc.color}99)">${initials}</div>
        </div>
        <div class="doctor-card-body">
          <h3 class="doctor-name">${doc.name}</h3>
          <p class="doctor-dept">${doc.department}</p>
          <div style="text-align:center;margin-bottom:0.6rem">${availBadge}</div>
          <div class="doctor-meta">
            <span class="doctor-meta-item"><i class="fas fa-briefcase"></i> ${doc.experience} yrs</span>
            <span class="doctor-meta-item"><i class="fas fa-star"></i> ${doc.rating}</span>
            <span class="doctor-meta-item"><i class="fas fa-users"></i> ${pCount}</span>
          </div>
          <div class="doctor-socials">
            <a href="#" class="doc-social"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="doc-social"><i class="fab fa-twitter"></i></a>
            <a href="#" class="doc-social"><i class="fab fa-linkedin-in"></i></a>
            <a href="#" class="doc-social"><i class="fab fa-instagram"></i></a>
          </div>
          <button class="btn-book" onclick="bookDoctor('${doc.name}', '${doc.department}')">
            <i class="fas fa-calendar-check"></i> Book Now
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderServices(departments) {
  document.getElementById('services-grid').innerHTML = departments.map(d => `
    <div class="service-card">
      <div class="service-icon"><i class="${d.icon}"></i></div>
      <h3 class="service-name">${d.name}</h3>
      <p class="service-desc">${d.description}</p>
    </div>
  `).join('');
}

function renderTestimonials() {
  document.getElementById('testimonials-grid').innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars">
        ${Array(t.rating).fill('<i class="fas fa-star"></i>').join('')}
        ${Array(5 - t.rating).fill('<i class="far fa-star" style="color:#d1d5db"></i>').join('')}
      </div>
      <p class="testimonial-text">${t.text}</p>
      <div class="testimonial-author">
        <div class="author-avatar" style="background: linear-gradient(135deg, ${t.color}, ${t.color}99)">
          ${t.name.split(' ').map(w => w[0]).join('')}
        </div>
        <div>
          <p class="author-name">${t.name}</p>
          <p class="author-role">${t.role}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function filterDoctors() {
  const query = document.getElementById('doctor-search').value.toLowerCase().trim();
  const filtered = allDoctors.filter(d =>
    d.name.toLowerCase().includes(query) || d.department.toLowerCase().includes(query)
  );
  renderDoctors(filtered);
}

function bookDoctor(name, dept) {
  document.getElementById('appointments').scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => {
    const sel = document.getElementById('apt-dept');
    for (let opt of sel.options) {
      if (opt.value === dept) { opt.selected = true; break; }
    }
    showToast(`Booking with ${name} — fill the form below!`, 'success');
  }, 600);
}

async function submitAppointment(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Booking...';

  const payload = {
    patientName:     document.getElementById('apt-name').value,
    patientEmail:    document.getElementById('apt-email').value,
    patientPhone:    document.getElementById('apt-phone').value,
    department:      document.getElementById('apt-dept').value,
    appointmentDate: document.getElementById('apt-date').value,
    timeSlot:        document.getElementById('apt-time').value,
    concern:         document.getElementById('apt-concern').value,
  };

  try {
    const data = await apiFetch('/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    showToast(`✅ ${data.message}`, 'success');
    e.target.reset();
  } catch (err) {

    showToast(`✅ Appointment requested for ${payload.patientName}! We'll confirm soon.`, 'success');
    e.target.reset();
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Appointment';
}

async function submitContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

  const payload = {
    name:       document.getElementById('ct-name').value,
    email:      document.getElementById('ct-email').value,
    phone:      document.getElementById('ct-phone').value,
    department: document.getElementById('ct-dept').value,
    service:    document.getElementById('ct-service').value,
    message:    document.getElementById('ct-msg').value,
  };

  apiFetch('/contact', { method: 'POST', body: JSON.stringify(payload) }).catch(() => {});

  const waText = encodeURIComponent(
    `Hello MediCare+!\n\nName: ${payload.name}\nPhone: ${payload.phone}\nDepartment: ${payload.department || 'N/A'}\nMessage: ${payload.message || 'General inquiry'}`
  );
  window.open(`https://wa.me/918638505906?text=${waText}`, '_blank');
  showToast('Opening WhatsApp...', 'success');
  e.target.reset();

  btn.disabled = false;
  btn.innerHTML = '<i class="fab fa-whatsapp"></i> Send via WhatsApp';
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

  const email    = e.target.querySelector('input[type="email"]').value;
  const password = e.target.querySelector('input[type="password"]').value;

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setSession(data.token, data.user);
    closeModal('login-modal');
    showToast(`Welcome back, ${data.user.name}! 👋`, 'success');
    updateAuthUI(data.user);

    if (data.user.role === 'admin') {
      setTimeout(() => { window.location.href = 'admin.html'; }, 1200);
    }
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
}

async function handleRegister(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';

  const name     = document.getElementById('reg-name').value;
  const email    = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const phone    = document.getElementById('reg-phone').value;

  try {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, phone }),
    });
    setSession(data.token, data.user);
    closeModal('register-modal');
    showToast(`Welcome to MediCare+, ${data.user.name}! 🎉`, 'success');
    updateAuthUI(data.user);
  } catch (err) {
    showToast(`❌ ${err.message}`, 'error');
  }

  btn.disabled = false;
  btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
}

function handleLogout() {
  clearSession();
  updateAuthUI(null);
  showToast('Logged out successfully', 'success');
}

function updateAuthUI(user) {
  const loginBtn = document.getElementById('btn-login');
  const adminBtn = document.getElementById('btn-admin');

  if (user) {
    loginBtn.innerHTML = `<i class="fas fa-sign-out-alt"></i> Logout`;
    loginBtn.onclick = handleLogout;
    if (user.role === 'admin') {
      adminBtn.innerHTML = `<i class="fas fa-tachometer-alt"></i> Dashboard`;
      adminBtn.onclick = () => { window.location.href = 'admin.html'; };
    }
  } else {
    loginBtn.innerHTML = `<i class="fas fa-key"></i> Login`;
    loginBtn.onclick = () => openModal('login-modal');
    adminBtn.innerHTML = `<i class="fas fa-user-shield"></i> Doctor Admin`;
    adminBtn.onclick = () => showToast('Admin panel requires authentication', 'error');
  }
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function showToast(msg, type = '') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

function handleNavbarScroll() {
  const navbar    = document.getElementById('navbar');
  const scrollTop = document.getElementById('scroll-top');

  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    scrollTop.classList.add('visible');
  } else {
    navbar.classList.remove('scrolled');
    scrollTop.classList.remove('visible');
  }

  const sections = ['home', 'doctors', 'services', 'appointments', 'testimonials', 'contact'];
  let current = 'home';
  for (const id of sections) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top <= 100) current = id;
  }
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
  });
}

function animateCounters() {
  document.querySelectorAll('.stat-number').forEach(counter => {
    const target   = parseInt(counter.getAttribute('data-target'));
    const duration = 2000;
    const step     = target / (duration / 16);
    let current    = 0;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }

      if (target >= 1000) {
        counter.textContent = current >= 1000
          ? (current / 1000).toFixed(current >= 10000 ? 0 : 1) + 'K+'
          : Math.floor(current) + '+';
      } else {
        counter.textContent = Math.floor(current) + '+';
      }
    }, 16);
  });
}

document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('open');
});

document.getElementById('btn-login').addEventListener('click', () => openModal('login-modal'));
document.getElementById('btn-admin').addEventListener('click', () => {
  const user = getUser();
  if (user && user.role === 'admin') {
    window.location.href = 'admin.html';
  } else {
    showToast('Admin panel requires authentication', 'error');
  }
});

document.getElementById('login-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal('login-modal');
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mobile-menu').classList.remove('open');
  });
});

document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', function (e) {
    if (e.target === this) this.classList.remove('open');
  });
});

const statsSection  = document.querySelector('.stats-section');
let statsAnimated   = false;
const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !statsAnimated) {
    statsAnimated = true;
    animateCounters();
  }
}, { threshold: 0.4 });
if (statsSection) statsObserver.observe(statsSection);

(() => {
  const dateInput = document.getElementById('apt-date');
  if (dateInput) dateInput.setAttribute('min', new Date().toISOString().split('T')[0]);
})();

window.addEventListener('scroll', handleNavbarScroll, { passive: true });

(async () => {
  renderTestimonials();
  handleNavbarScroll();

  const savedUser = getUser();
  if (savedUser) updateAuthUI(savedUser);

  await Promise.all([loadDoctors(), loadDepartments(), loadStats()]);
})();
