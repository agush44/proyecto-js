// Variables DOM
let rowPadre = document.getElementById('rowPadre');
let cardContenedor = document.getElementById('cardContenedor');
let modalCarrito = document.getElementById('modalCarrito');
let contadorCarrito = document.getElementById('contadorCarrito');
let precioTotal = document.getElementById('precioTotal');
let botonCarrito = document.getElementById('boton-carrito');
let ingreso = document.getElementById('ingreso');
let login = document.getElementById('login');
let contProd = document.getElementById('contProd');
let irAlRegistro = document.getElementById('irAlRegistro');
let registro = document.getElementById('registro');
let formReset = document.getElementById('formReset');
let data;

const API = "../stockProd.json";

const getData = async () => {
    const resp = await fetch (API);
    const data = await resp.json();
    return data
}

// Array de usuarios
let usuarios = [];

// Se guarda el listado de usuarios en LS
function guardarUsuarios(){
    localStorage.setItem('ListadoUsuarios', JSON.stringify(usuarios));
}

// Se recuperan los usuarios del LS
let usuariosEnLS = JSON.parse(localStorage.getItem('ListadoUsuarios'));

function cargarUsuarios(){
    // OPERADOR AND
    usuariosEnLS && (usuarios = usuariosEnLS);
}

cargarUsuarios();

// Array de carrito donde se sumarán los productos
let carrito = [];

// Se guarda el carrito en el LS
function guardarCarrito(){
    localStorage.setItem('ListadoProductos', JSON.stringify(carrito));
}

// Se recupera el carrito del LS
let carritoEnLS = JSON.parse(localStorage.getItem('ListadoProductos'));

function cargarCarrito() {
    if(carritoEnLS){
        for(element of carritoEnLS){
            agregarAlCarrito(element.id, element.cantidad);
        }
        actualizarCarrito()
    }
}

// Imprime los productos en el html a partir de un forEach (creando un div y su estructura interna para luego agregarlo al elemento padre) para evitar sobrecargar el código html. Luego captura el id de cada botón para disparar un evento click que llama a la función agregarAlCarrito
const mostrarProductos = async () => {
    data = await getData();
    data.forEach(item =>{
        let div = document.createElement('div');
        div.className = "col-12 col-sm-12 col-md-6 col-lg-4 cardContenedor";
        div.innerHTML = `<div class="card" style="width: 18rem">
                            <img src="${item.img}" class="card-img-top panes" alt="${item.nombre}"/>
                            <div class="card-body">
                                <h5 class="card-title">${item.nombre}</h5>
                                <p class="card-text">
                                    Some quick example text to build on the card title and make up the
                                    bulk of the card's content.
                                    Precio: $${item.precio}
                                </p>
                                <a href="#" class="btn btn-primary" id="btnAgregar${item.id}" data-bs-toggle="modal" data-bs-target="#miModal">Agregar</a>
                            </div>
                        </div>` 
        rowPadre.appendChild(div);

        let btnAgregar = document.getElementById(`btnAgregar${item.id}`);
        btnAgregar.addEventListener('click', () =>{
            agregarAlCarrito(item.id, item.cantidad);
        })
    })
}

mostrarProductos(data);

// Agrega el producto elegido al carrito a partir del id capturado en la función anterior o suma la cantidad del producto si ya se encuentra en el carrito
const agregarAlCarrito = async (id, cantidad) =>{
    // Si el mismo producto ya se encuentra en el carrito, se lo guarda en la variable productoEnCarrito. Se almacena el producto elegido en la variable productoElegido
    data = await getData();
    let productoEnCarrito = carrito.find(item => item.id == id);
    let productoElegido = data.find(item => item.id == id);
    // Si el mismo producto ya se encuentra en el carrito, se evalúa el stock. Si hay stock, se suma 1 a la cantidad y se resta 1 de stock. Se captura el id de cantidad para poder modificar dinámicamente el valor de cantidad. Se actualiza carrito
    if(productoEnCarrito){
        if(productoEnCarrito.stock === 0){
            alert(`No hay más stock del producto`);
        }else{
            // OPERADOR ++
            productoEnCarrito.cantidad++;
            // OPERADOR --
            productoEnCarrito.stock--;    
            document.getElementById(`cant${productoEnCarrito.id}`).innerHTML = `<p id="cant${productoEnCarrito.id}">Cantidad: ${productoEnCarrito.cantidad}</p>`
            actualizarCarrito();
        }
    // Si el producto no se encuentra en el carrito, se evalúa si hay productos en carritoEnLS. Si hay y el id pasado como parámetro coincide con un producto en carritoEnLS, se le pasa la cantidad tomada por parámetro y se le resta el stock según la cantidad. Si no coincide, le suma 1 a la cantidad y se resta 1 en stock. Si no hay productos en el LS, se repite la acción anterior. Se pushea y se llama a la función mostrarCarrito y actualizarCarrito en todos los casos.
    }else{
        if(carritoEnLS){
            let productoEnLS = carritoEnLS.find(item => item.id == id);
            if(productoEnLS){
                productoElegido.cantidad = cantidad;
                productoElegido.stock -= cantidad;
            }else{
                productoElegido.cantidad = 1;
                productoElegido.stock --;
            }
        }else{
            productoElegido.cantidad = 1;
            productoElegido.stock --;
        }
        carrito.push(productoElegido);      
        mostrarCarrito(productoElegido);
        actualizarCarrito();
    }
}

// Muestra el carrito imprimiendo la estructura html del producto elegido en el modal 
function mostrarCarrito(productoElegido){
    let div = document.createElement('div');
    div.className = "modal-body";
    div.innerHTML = `<p>${productoElegido.nombre}</p>
                    <div class="precio-btnEliminar">
                        <p class="precio">Precio: $${productoElegido.precio}</p>
                        <p id="cant${productoElegido.id}">Cantidad: ${productoElegido.cantidad}</p>
                        <button class="btn-eliminar" id="eliminar${productoElegido.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>`
    modalCarrito.appendChild(div);
    eliminarProducto(productoElegido);
    document.getElementById('pagar').addEventListener('click', () =>{
        pagar()
    })
}

// Se actualiza el contador y el precio total a través de un reduce. Llama a la función guardarEnCarrito()
function actualizarCarrito(){
    contadorCarrito.innerText = carrito.reduce((total, item) => total + item.cantidad, 0);
    precioTotal.innerText = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    guardarCarrito();
}

// Elimina un producto a través del evento click el cual desencadena una función anónima que filtra el carrito (retorna un array que cumple con la condición pasada como parámetro, es decir, un array de carrito sin el producto elegido) y elimina el elemento padre del elemento padre del botón
function eliminarProducto(productoElegido){
    let btnEliminar = document.getElementById(`eliminar${productoElegido.id}`);
    btnEliminar.addEventListener('click', () =>{
        // SWEET ALERT
        Swal.fire({
            title: '¿Eliminar producto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Sí, eliminar producto'
        }).then((result) => {
            if (result.isConfirmed) {
                carrito = carrito.filter(item => item.id !== productoElegido.id);
                productoElegido.stock += productoElegido.cantidad;
                productoElegido.cantidad = 0;
                btnEliminar.parentElement.parentElement.remove();
                carritoEnLS = carrito;
                actualizarCarrito();
                Swal.fire(
                'Eliminado',
                'El producto fue eliminado del carrito.',
                'success'
                )
            }
        })
    });
}

cargarCarrito();

// API mercado pago
const pagar = async () => {
        const productos = carrito.map(element => {
            let nuevoElemento =
            {
                title: element.nombre,
                description: "",
                picture_url: element.img,
                category_id: element.id,
                quantity: element.cantidad,
                currency_id: "ARS",
                unit_price: element.precio
            }
            return nuevoElemento;
        })
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
            Authorization: "Bearer TEST-7125339915055250-092019-1c5411761f3006cb060829635dea88e7-210191190"
        },
        body: JSON.stringify({
            items: productos
        })
    })
    let data = await response.json()
    console.log(data)
    window.open(data.init_point, "_blank");
}

// LOGIN / REGISTRO DE USUARIOS
class Usuario{
    constructor(obj){
        this.nombre = obj.nombre;
        this.apellido = obj.apellido;
        this.password = obj.password;
        this.email = obj.email;
    }
}

// Función que registra usuarios. Llama a la función guardarUsuarios (en LS)
const registrarse = irAlRegistro.addEventListener('click', () =>{
    contProd.style.display = 'none';
    login.style.display = 'none';
    registro.style.display = 'block';

    document.getElementById('btn-registrar').addEventListener('click', () => {
        const nombreIngresado = document.getElementById('nombre').value;
        const apellidoIngresado = document.getElementById('apellido').value;
        const emailIngresado = document.getElementById('email2').value;
        const passwordIngresado = document.getElementById('password2').value;
    
        let obj = {nombre: nombreIngresado, apellido: apellidoIngresado, password: passwordIngresado, email: emailIngresado};

        let usuarioRegistrado = usuarios.find(usuario => usuario.email == obj.email);
        if(usuarioRegistrado){
            document.getElementById('form').innerHTML = `<label for="email">Email</label>
            <input type="text" name="email" id="email1" placeholder="Email" class="input" value="">

            <label for="password">Contraseña</label>
            <input type="password" name="password" id="password1" placeholder="Contraseña" required class="input" value="">

            <p>Ya estás registrado/a. <br> Inicia sesión para continuar</p>

            <button type="button" id="btn-ingresar">Iniciar sesión</button>`;
        }else{
            document.getElementById('usuarioLogueado').innerHTML = `<a class="nav-link" href="./productos.html" id="cerrarSesion">Cerrar sesión</a>`
            contProd.style.display = 'block';
            login.style.display = 'none';
            registro.style.display = 'none';
            usuarios.push(new Usuario(obj));
            guardarUsuarios();
            // SWEET ALERT
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Te registraste correctamente',
                showConfirmButton: false,
                timer: 1500
            })
        }
    })
});

// Evento del botón "Ingresar" del nav. Dispara la función ingresar
ingreso.addEventListener('click', () =>{
    contProd.style.display = 'none';
    login.style.display = 'block';
    registro.style.display = 'none';

    ingresar();
});

// Función para iniciar sesión desde el botón "Iniciar sesión"
function ingresar(){
    document.getElementById('btn-ingresar').addEventListener('click', () =>{
        let emailIngresado = document.getElementById('email1').value;
        let passwordIngresado = document.getElementById('password1').value;
    
        let usuarioRegistrado = usuarios.find(usuario => usuario.email == emailIngresado);
        if(usuarioRegistrado){
            // OPERADOR TERNARIO
            usuarioRegistrado.password == passwordIngresado ? iniciarSesion() : document.getElementById('textoLogin').innerText = "Contraseña incorrecta. Intente nuevamente";
        }else{
            document.getElementById('textoLogin').innerText = "No está registrado/a";
            formReset.reset();
        }
    })
}   

// Cambios en el html cuando la contraseña ingresada es correcta
const iniciarSesion = () =>{
    document.getElementById('ingreso').innerText = "Cerrar sesión"
    document.getElementById('ingreso').setAttribute('id', 'cerrarSesion');
    document.getElementById('cerrarSesion').setAttribute('href', './productos.html');
    login.style.display = 'none';
    registro.style.display = 'none';
    contProd.style.display = 'block';
    // SWEET ALERT
    Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Ingresaste correctamente',
        showConfirmButton: false,
        timer: 1500
    })
}

