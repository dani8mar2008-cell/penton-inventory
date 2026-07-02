const API_URL = 'http://localhost:5000/api';
let token = localStorage.getItem('token');
let usuarioActual = JSON.parse(localStorage.getItem('usuario') || 'null');

// Elementos del DOM
const btnLogin = document.getElementById('btnLogin');
const btnMisCuentas = document.getElementById('btnMisCuentas');
const btnLogout = document.getElementById('btnLogout');
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');
const registroForm = document.getElementById('registroForm');
const formProducto = document.getElementById('formProducto');
const dashboardAdmin = document.getElementById('dashboardAdmin');
const mainCatalogo = document.getElementById('mainCatalogo');

// Eventos
btnLogin.addEventListener('click', abrirModal);
btnLogout.addEventListener('click', cerrarSesion);
btnMisCuentas.addEventListener('click', irAlDashboard);
loginForm.addEventListener('submit', handleLogin);
registroForm.addEventListener('submit', handleRegistro);
formProducto.addEventListener('submit', handleAgregarProducto);

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    actualizarUI();
    cargarProductosPublicos();
    if (token) {
        cargarProductosDelUsuario();
    }
});

// ===== AUTENTICACIÓN =====

function abrirModal() {
    authModal.style.display = 'block';
}

function cerrarModal() {
    authModal.style.display = 'none';
}

function mostrarTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registroForm = document.getElementById('registroForm');
    const tabs = document.querySelectorAll('.tab-button');

    loginForm.classList.remove('active');
    registroForm.classList.remove('active');
    tabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        loginForm.classList.add('active');
        tabs[0].classList.add('active');
    } else {
        registroForm.classList.add('active');
        tabs[1].classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            alert('Error: ' + data.error);
            return;
        }

        const data = await response.json();
        token = data.token;
        usuarioActual = data.usuario;

        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuarioActual));

        cerrarModal();
        actualizarUI();
        cargarProductosDelUsuario();
        mostrarMensaje('Bienvenido ' + usuarioActual.nombre, 'exito');
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el servidor');
    }
}

async function handleRegistro(e) {
    e.preventDefault();

    const nombre = document.getElementById('registroNombre').value;
    const email = document.getElementById('registroEmail').value;
    const password = document.getElementById('registroPassword').value;

    try {
        const response = await fetch(`${API_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password }),
        });

        if (!response.ok) {
            const data = await response.json();
            alert('Error: ' + data.error);
            return;
        }

        const data = await response.json();
        token = data.token;
        usuarioActual = data.usuario;

        localStorage.setItem('token', token);
        localStorage.setItem('usuario', JSON.stringify(usuarioActual));

        cerrarModal();
        actualizarUI();
        cargarProductosDelUsuario();
        mostrarMensaje('Cuenta creada exitosamente', 'exito');
    } catch (error) {
        console.error('Error:', error);
        alert('Error en el servidor');
    }
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    token = null;
    usuarioActual = null;
    actualizarUI();
    mostrarMensaje('Sesión cerrada', 'exito');
    cargarProductosPublicos();
}

function actualizarUI() {
    if (token && usuarioActual) {
        btnLogin.style.display = 'none';
        btnMisCuentas.style.display = 'inline-block';
        btnLogout.style.display = 'inline-block';
        dashboardAdmin.style.display = 'block';
        mainCatalogo.style.display = 'none';
    } else {
        btnLogin.style.display = 'inline-block';
        btnMisCuentas.style.display = 'none';
        btnLogout.style.display = 'none';
        dashboardAdmin.style.display = 'none';
        mainCatalogo.style.display = 'block';
    }
}

function irAlDashboard() {
    mainCatalogo.style.display = 'none';
    dashboardAdmin.style.display = 'block';
    window.scrollTo(0, 0);
}

// ===== PRODUCTOS =====

async function handleAgregarProducto(e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const categoria = document.getElementById('categoria').value || 'General';

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                nombre,
                descripcion,
                precio,
                cantidad,
                categoria,
            }),
        });

        if (!response.ok) {
            const data = await response.json();
            alert('Error: ' + data.error);
            return;
        }

        formProducto.reset();
        mostrarMensaje('Producto agregado exitosamente', 'exito');
        cargarProductosDelUsuario();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar producto');
    }
}

async function cargarProductosDelUsuario() {
    try {
        const response = await fetch(`${API_URL}/products/mis-productos`, {
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) return;

        const productos = await response.json();
        const container = document.getElementById('misProductos');

        if (productos.length === 0) {
            container.innerHTML = '<p>No tienes productos aún</p>';
            return;
        }

        container.innerHTML = productos.map(p => `
            <div class="producto-card">
                <div class="producto-imagen">📦</div>
                <div class="producto-info">
                    <h4>${p.nombre}</h4>
                    <p class="producto-descripcion">${p.descripcion}</p>
                    <span class="producto-categoria">${p.categoria}</span>
                    <p class="producto-precio">$${p.precio.toFixed(2)}</p>
                    <p class="producto-cantidad">Stock: ${p.cantidad}</p>
                    <div class="producto-acciones">
                        <button class="btn-editar" onclick="editarProducto('${p._id}')">Editar</button>
                        <button class="btn-eliminar" onclick="eliminarProducto('${p._id}')">Eliminar</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function cargarProductosPublicos() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const productos = await response.json();
        const container = document.getElementById('productosPublicos');

        if (productos.length === 0) {
            container.innerHTML = '<p>No hay productos disponibles</p>';
            return;
        }

        container.innerHTML = productos.map(p => `
            <div class="producto-card">
                <div class="producto-imagen">📦</div>
                <div class="producto-info">
                    <h4>${p.nombre}</h4>
                    <p class="producto-descripcion">${p.descripcion}</p>
                    <span class="producto-categoria">${p.categoria}</span>
                    <p class="producto-precio">$${p.precio.toFixed(2)}</p>
                    <p style="font-size: 12px; color: #999;">Por: ${p.propietario?.nombre || 'Tienda'}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error:', error);
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` },
        });

        if (!response.ok) {
            alert('Error al eliminar producto');
            return;
        }

        mostrarMensaje('Producto eliminado', 'exito');
        cargarProductosDelUsuario();
    } catch (error) {
        console.error('Error:', error);
    }
}

function editarProducto(id) {
    alert('Función de edición en desarrollo');
}

// ===== UTILIDADES =====

function mostrarMensaje(texto, tipo = 'exito') {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje mensaje-${tipo}`;
    mensaje.textContent = texto;
    document.body.insertBefore(mensaje, document.body.firstChild);

    setTimeout(() => mensaje.remove(), 3000);
}

// Cerrar modal al hacer click fuera
window.onclick = function(event) {
    if (event.target === authModal) {
        cerrarModal();
    }
};
