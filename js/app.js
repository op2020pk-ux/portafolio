// js/app.js
const MASTER_KEY = "";  // <-- Introdusca su clave unica aqui..

// Rutas de nuestra API PHP local
const API_PROYECTOS = 'api/proyectos.php';
const API_COMPRAS = 'api/compras.php';

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('grid-proyectos')) {
        renderCatalogoCliente();
        configurarManejadorCompraCliente();
    }
    
    if (document.getElementById('form-seguridad')) {
        evaluarSesionActiva();
        configurarManejadorAdmin();
    }

    if (document.getElementById('tabla-compras-body')) {
        evaluarSesionActivaEnCompras();
    }
});

/* ==========================================
   LÓGICA DEL CLIENTE & COMPRAS (index.html)
   ========================================== */
async function renderCatalogoCliente() {
    const grid = document.getElementById('grid-proyectos');
    if(!grid) return;
    grid.innerHTML = '';
    
    try {
        const res = await fetch(API_PROYECTOS);
        const proyectos = await res.json();

        if(proyectos.length === 0) {
            grid.innerHTML = `<p style="color: var(--text-muted); grid-column: 1/-1; text-align:center;">No hay proyectos publicados por el momento.</p>`;
            return;
        }

        proyectos.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${p.imagen}" alt="${p.titulo}">
                <div class="card-body">
                    <h3 class="card-title">${p.titulo}</h3>
                    <p class="card-text">${p.descripcion}</p>
                    <div class="card-footer">
                        <span class="price">${p.precio}</span>
                        <button class="btn-neon" onclick="abrirModalCompra('${p.titulo.replace(/'/g, "\\'")}', '${p.precio}', '${p.imagen}')"><i class="fa-solid fa-cart-shopping"></i> Adquirir</button>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Error al cargar catálogo:", error);
    }
}

window.abrirModalCompra = function(titulo, precio, imagen) {
    const modal = document.getElementById('modal-compra');
    if(!modal) return;

    document.getElementById('compra-proyecto-titulo').value = titulo;
    document.getElementById('compra-proyecto-precio').value = precio;
    
    let inputImagen = document.getElementById('compra-proyecto-imagen');
    if (!inputImagen) {
        inputImagen = document.createElement('input');
        inputImagen.type = 'hidden';
        inputImagen.id = 'compra-proyecto-imagen';
        document.getElementById('form-procesar-compra').appendChild(inputImagen);
    }
    inputImagen.value = imagen;
    
    document.getElementById('form-procesar-compra').classList.remove('hidden');
    document.getElementById('resultado-codigo').classList.add('hidden');
    document.getElementById('form-procesar-compra').reset();
    
    modal.style.display = 'flex';
}

window.cerrarModalCompra = function() {
    const modal = document.getElementById('modal-compra');
    if(modal) modal.style.display = 'none';
}

function configurarManejadorCompraCliente() {
    const formCompra = document.getElementById('form-procesar-compra');
    if(!formCompra) return;

    formCompra.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let tokenAleatorio = 'OP-';
        for (let i = 0; i < 5; i++) {
            tokenAleatorio += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }

        const nuevaCompra = {
            action: "registrar",
            codigo: tokenAleatorio,
            nombre: document.getElementById('c-nombre').value,
            telefono: document.getElementById('c-telefono').value,
            correo: document.getElementById('c-correo').value,
            proyecto: document.getElementById('compra-proyecto-titulo').value,
            precio: document.getElementById('compra-proyecto-precio').value,
            imagen: document.getElementById('compra-proyecto-imagen') ? document.getElementById('compra-proyecto-imagen').value : 'https://picsum.photos/400/250?random=1'
        };

        try {
            const res = await fetch(API_COMPRAS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevaCompra)
            });
            const data = await res.json();

            if(data.status === 'success') {
                document.getElementById('token-generado').innerText = tokenAleatorio;
                formCompra.classList.add('hidden');
                document.getElementById('resultado-codigo').classList.remove('hidden');
            }
        } catch (error) {
            alert("Error al procesar solicitud en el servidor.");
        }
    });
}

/* ==========================================
   LÓGICA DEL ADMINISTRADOR (CRUD)
   ========================================== */
function evaluarSesionActiva() {
    if (sessionStorage.getItem('op_sesion') === 'activa') {
        mostrarPanelPrivado();
    }
}

function evaluarSesionActivaEnCompras() {
    if (sessionStorage.getItem('op_sesion') !== 'activa') {
        alert('Acceso denegado. Por favor inicie sesión en el panel.');
        window.location.href = 'admin.html';
    } else {
        renderTablaCompras();
    }
}

function configurarManejadorAdmin() {
    const formSeguridad = document.getElementById('form-seguridad');
    const formProyecto = document.getElementById('form-proyecto');
    const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');

    if(formSeguridad) {
        formSeguridad.addEventListener('submit', (e) => {
            e.preventDefault();
            const inputPass = document.getElementById('pass-control').value;
            if (inputPass === MASTER_KEY) {
                sessionStorage.setItem('op_sesion', 'activa');
                mostrarPanelPrivado();
            } else {
                alert('Firma incorrecta. Acceso bloqueado.');
            }
            formSeguridad.reset();
        });
    }

    if(formProyecto) {
        formProyecto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('proyecto-id').value;
            const titulo = document.getElementById('p-titulo').value;
            const imagen = document.getElementById('p-imagen').value;
            const precio = document.getElementById('p-precio').value;
            const demo = document.getElementById('p-demo').value || '#';
            const descripcion = document.getElementById('p-descripcion').value;

            const payload = { id, titulo, imagen, precio, demo, descripcion };

            try {
                await fetch(API_PROYECTOS, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                document.getElementById('btn-guardar').innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Publicar en Catálogo`;
                formProyecto.reset();
                document.getElementById('proyecto-id').value = '';
                renderGridAdmin();
            } catch (error) {
                console.error("Error al guardar proyecto:", error);
            }
        });
    }

    if(btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
            sessionStorage.removeItem('op_sesion');
            window.location.reload();
        });
    }
}

function mostrarPanelPrivado() {
    const bloqueAuth = document.getElementById('bloque-auth');
    const zonaPrivada = document.getElementById('zona-privada');
    if(bloqueAuth) bloqueAuth.classList.add('hidden');
    if(zonaPrivada) zonaPrivada.classList.remove('hidden');
    renderGridAdmin();
}

async function renderGridAdmin() {
    const gridAdmin = document.getElementById('admin-grid-proyectos');
    if(!gridAdmin) return;
    gridAdmin.innerHTML = '';

    try {
        const res = await fetch(API_PROYECTOS);
        const proyectos = await res.json();

        proyectos.forEach(p => {
            const div = document.createElement('div');
            div.className = 'admin-card';
            div.innerHTML = `
                <div>
                    <strong style="color: var(--neon-blue);">${p.titulo}</strong>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">${p.precio}</p>
                </div>
                <div>
                    <button class="btn-warn" onclick="cargarProyectoEnFormulario(${p.id}, '${p.titulo.replace(/'/g, "\\'")}', '${p.imagen}', '${p.precio}', '${p.demo}', '${p.descripcion.replace(/'/g, "\\'")}')"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="btn-danger" onclick="eliminarProyectoDelCatalogo(${p.id})"><i class="fa-solid fa-trash"></i></button>
                </div>
            `;
            gridAdmin.appendChild(div);
        });
    } catch (error) {
        console.error("Error en administrador de proyectos:", error);
    }
}

window.cargarProyectoEnFormulario = function(id, titulo, imagen, precio, demo, descripcion) {
    document.getElementById('proyecto-id').value = id;
    document.getElementById('p-titulo').value = titulo;
    document.getElementById('p-imagen').value = imagen;
    document.getElementById('p-precio').value = precio;
    document.getElementById('p-demo').value = demo;
    document.getElementById('p-descripcion').value = descripcion;

    document.getElementById('btn-guardar').innerHTML = `<i class="fa-solid fa-rotate"></i> Guardar Cambios Realizados`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.eliminarProyectoDelCatalogo = function(id) {
    if (confirm('¿Seguro que deseas eliminar permanentemente este software?')) {
        fetch(API_PROYECTOS, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        }).then(() => renderGridAdmin());
    }
}

/* ==========================================
   VISTA EXCLUSIVA DE COMPRAS (compras.html) & ACCIONES
   ========================================== */
async function renderTablaCompras() {
    const tbody = document.getElementById('tabla-compras-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    try {
        const res = await fetch(API_COMPRAS);
        const compras = await res.json();

        if (compras.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="padding: 2rem; text-align: center; color: var(--text-muted);">No hay transacciones registradas todavía.</td></tr>`;
            return;
        }

        compras.forEach(c => {
            let celdaAccion = '';

            if (c.estado === "Pendiente") {
                celdaAccion = `
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="btn-success" onclick="cambiarEstadoCompra('${c.codigo}', 'Autorizado', '${c.correo}')" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;"><i class="fa-solid fa-circle-check"></i> Autorizar</button>
                        <button class="btn-danger" onclick="cambiarEstadoCompra('${c.codigo}', 'Denegado', '${c.correo}')" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;"><i class="fa-solid fa-circle-xmark"></i> Denegar</button>
                    </div>
                `;
            } else if (c.estado === "Autorizado") {
                celdaAccion = `<span style="color: var(--accent-green); font-weight: bold;"><i class="fa-solid fa-check"></i> Autorizado</span>`;
            } else {
                celdaAccion = `<span style="color: var(--accent-red); font-weight: bold;"><i class="fa-solid fa-ban"></i> Denegado</span>`;
            }

            const urlImagen = c.imagen || 'https://picsum.photos/400/250?random=1';

            const fila = document.createElement('tr');
            fila.style.borderBottom = "1px solid rgba(255,255,255,0.05)";
            fila.innerHTML = `
                <td style="padding: 1rem; display: flex; align-items: center; gap: 12px; font-weight: bold; color: var(--neon-purple);">
                    <img src="${urlImagen}" alt="preview" style="width: 45px; height: 32px; object-fit: cover; border-radius: 4px; border: 1px solid rgba(0, 242, 254, 0.3); box-shadow: 0 0 6px rgba(0, 242, 254, 0.2);">
                    <span>${c.codigo}</span>
                </td>
                <td style="padding: 1rem;">${c.nombre}</td>
                <td style="padding: 1rem; color: var(--text-muted);">${c.telefono}</td>
                <td style="padding: 1rem; color: var(--text-muted);">${c.correo}</td>
                <td style="padding: 1rem; color: var(--neon-blue);">${c.proyecto}</td>
                <td style="padding: 1rem; font-weight: bold;">${c.precio}</td>
                <td style="padding: 1rem; text-align: center;">${celdaAccion}</td>
            `;
            tbody.appendChild(fila);
        });
    } catch (error) {
        console.error("Error al cargar logs de compras:", error);
    }
}

window.cambiarEstadoCompra = async function(codigo, nuevoEstado, correoCliente) {
    try {
        const res = await fetch(API_COMPRAS, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: "cambiar_estado", codigo: codigo, estado: nuevoEstado })
        });
        const data = await res.json();
        if(data.status === 'success') {
            alert(`Envío ${nuevoEstado.toUpperCase()} para el correo: ${correoCliente}`);
            renderTablaCompras();
        }
    } catch (error) {
        console.error(error);
    }
}

window.limpiarHistorialCompras = async function() {
    if(confirm('¿Está seguro de que desea vaciar todo el registro de clientes compradores?')) {
        try {
            await fetch(API_COMPRAS, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: "limpiar" })
            });
            renderTablaCompras();
        } catch (error) {
            console.error(error);
        }
    }
}