/**
 * ARCHIVO DE PERSONALIZACIÓN CENTRALIZADA
 * ======================================
 * Aquí se definen TODOS los textos de la aplicación.
 * Modifica los valores aquí para cambiar los textos en toda la app.
 */

// ============================================================================
// SECCIÓN 1: HOMEPAGE (Página principal del catálogo)
// ============================================================================

export const HomepageTextos = {
  // Header / Encabezado
  header: {
    titulo: 'Catálogo de Productos',
    subtitulo: 'El Retorno',
    logoAlt: 'El Retorno',
  },

  // Barra de búsqueda
  busqueda: {
    placeholder: 'Buscar por nombre, descripción o categoría...',
    botonCategoriasTitle: 'Ver categorías',
    limpiarBusquedaTitle: 'Limpiar búsqueda',
    categoriaSeleccionadaLabel: 'Categoría:',
    limpiarCategoriaTitle: 'Limpiar categoría',
    sinResultados: (searchTerm: string) => `No se encontraron productos que coincidan con "${searchTerm}"`,
  },

  // Estados de carga y error
  estados: {
    cargando: 'Cargando productos...',
    errorBotonReintentar: 'Reintentar',
    sinProductos: 'No hay productos disponibles en este momento.',
  },

  // Grid de productos
  productos: {
    contadorProductos: (count: number) => `(${count} productos)`,
  },

  // Footer / Pie de página
  footer: {
    // Sección de contacto
    contacto: {
      titulo: 'CONTACTO',
      nombreEmpresa: 'EL RETORNO',
      direccion: '📍 Atanasio Sierra 418 - Tacuarembó.',
      horario: '🕒 Lunes a Viernes de 08:00 a 12:30, 16:00 a 19:00 hs. Sábados de 08:00 a 12:00 hs.',
      telefono: '📞 46328493',
    },

    // Redes sociales
    redesSociales: {
      titulo: 'SEGUINOS EN:',
      facebookTitle: 'Facebook',
      instagramTitle: 'Instagram',
    },

    // Formas de pago
    formasPago: {
      titulo: 'FORMAS DE PAGO',
      metodos: ['OCA', 'MC', 'LIDER', 'CREDITEL', 'VISA', 'DINERS', 'MP', 'ABITAB', 'REDPAGOS'],
    },

    // Mapa
    mapa: {
      titulo: 'DÓNDE ESTAMOS',
      botonAbrirMaps: 'Abrir en Maps',
    },

    // Links de interés
    linksInteres: {
      titulo: 'TE PUEDE INTERESAR',
      links: [
        { texto: 'Sobre Nosotros', url: '#' },
        { texto: 'Términos y Condiciones', url: '#' },
        { texto: 'Contacto', url: '#' },
      ],
    },

    // Copyright
    copyright: '© 2026 Catálogo Retorno - Todos los derechos reservados',
    footerLinks: [
      { texto: 'Sobre Nosotros', url: '#' },
      { texto: 'Términos y Condiciones', url: '#' },
      { texto: 'Contacto', url: '#' },
    ],
  },
};

// ============================================================================
// SECCIÓN 2: ADMINISTRACIÓN (Panel de admin)
// ============================================================================

export const AdministracionTextos = {
  // Sidebar / Menú lateral
  sidebar: {
    menu: {
      inicio: { icono: '🏠', texto: 'Inicio' },
      productos: { icono: '📦', texto: 'Productos' },
      categorias: { icono: '🏷️', texto: 'Categorías' },
      pedidos: { icono: '🛒', texto: 'Pedidos' },
      imagenes: { icono: '🖼️', texto: 'Imágenes' },
    },
    volverCatalogo: { icono: '↩️', texto: 'Volver al catálogo' },
  },

  // Títulos de secciones
  secciones: {
    inicio: 'Panel de Administración',
    productos: 'Gestión de Productos',
    categorias: 'Gestión de Categorías',
    pedidos: 'Gestión de Pedidos',
    imagenes: 'Gestión de Imágenes',
  },

  // Sección Inicio / Dashboard
  dashboard: {
    bienvenida: {
      titulo: 'Bienvenido al Panel de Administración',
      descripcion: 'Desde aquí podrás gestionar todos los aspectos de tu catálogo de productos.',
    },
    estadisticas: {
      productos: { icono: '📦', titulo: 'Productos' },
      pedidosPendientes: { icono: '🛒', titulo: 'Pedidos Pendientes' },
      imagenes: { icono: '🖼️', titulo: 'Imágenes' },
    },
  },

  // Sección Productos
  productos: {
    botonNuevo: '+ Nuevo Producto',
    botonAgregarPrimero: 'Agregar primer producto',

    // Filtros
    filtros: {
      nombre: { label: '📦 Nombre:', placeholder: 'Buscar por nombre...' },
      peso: { label: '⚖️ Peso:', placeholder: 'Buscar por peso...' },
      precioMin: { label: '💲 Precio Min:', placeholder: 'Ej: 1000' },
      precioMax: { label: '💲 Precio Max:', placeholder: 'Ej: 5000' },
      categoria: { label: '🏷️ Categoría:', placeholder: 'Buscar por categoría...' },
      botonLimpiar: '🗑️ Limpiar Filtros',
    },

    // Estados
    sinProductos: 'No hay productos registrados.',
    cargando: 'Cargando productos...',
    errorReintentar: 'Reintentar',

    // Indicadores
    bannerIndicator: '🎯 BANNER',

    // Tabla/Grid
    tabla: {
      encabezados: {
        imagen: 'Imagen',
        nombre: 'Nombre',
        peso: 'Peso',
        precio: 'Precio',
        categoria: 'Categoría',
        acciones: 'Acciones',
      },
      botones: {
        editar: '✏️ Editar',
        eliminar: '🗑️ Eliminar',
      },
      confirmacionEliminar: (nombre: string) => `¿Eliminar "${nombre}"?`,
    },

    // Modal de producto
    modal: {
      tituloNuevo: 'Nuevo Producto',
      tituloEditar: 'Editar Producto',
      campos: {
        nombre: { label: 'Nombre:', placeholder: 'Nombre del producto' },
        descripcion: { label: 'Descripción:', placeholder: 'Descripción del producto' },
        peso: { label: 'Peso:', placeholder: 'Ej: 500g, 1kg' },
        precio: { label: 'Precio:', placeholder: '0.00' },
        categoria: { label: 'Categoría:', placeholder: 'Seleccione o escriba una categoría' },
        imagen: { label: 'Imagen:' },
      },
      botones: {
        cancelar: 'Cancelar',
        guardar: 'Guardar',
        guardando: 'Guardando...',
        seleccionarImagen: 'Seleccionar Imagen',
        cambiarImagen: 'Cambiar Imagen',
      },
      errores: {
        nombreRequerido: 'El nombre es requerido',
        precioRequerido: 'El precio es requerido',
        precioInvalido: 'Precio inválido',
        categoriaRequerida: 'La categoría es requerida',
      },
    },
  },

  // Sección Categorías
  categorias: {
    botonNueva: '+ Nueva Categoría',
    sinCategorias: 'No hay categorías registradas.',

    tabla: {
      encabezados: {
        nombre: 'Nombre',
        productos: 'Productos',
        acciones: 'Acciones',
      },
      botones: {
        editar: '✏️ Editar',
        eliminar: '🗑️ Eliminar',
      },
    },

    modal: {
      tituloNueva: 'Nueva Categoría',
      tituloEditar: 'Editar Categoría',
      campos: {
        nombre: { label: 'Nombre:', placeholder: 'Nombre de la categoría' },
      },
      botones: {
        cancelar: 'Cancelar',
        guardar: 'Guardar',
      },
      errores: {
        nombreRequerido: 'El nombre es requerido',
      },
    },
  },

  // Sección Pedidos
  pedidos: {
    sinPedidos: 'No hay pedidos registrados.',
    cargando: 'Cargando pedidos...',

    // Filtros
    filtros: {
      estado: { label: 'Estado:', placeholder: 'Todos los estados' },
      fechaDesde: { label: 'Desde:', placeholder: 'Fecha inicio' },
      fechaHasta: { label: 'Hasta:', placeholder: 'Fecha fin' },
      buscar: { label: 'Buscar:', placeholder: 'Cliente, email, teléfono...' },
      botonLimpiar: '🗑️ Limpiar',
    },

    // Estados de pedido
    estados: {
      pendiente: { label: 'Pendiente', color: 'warning' },
      procesando: { label: 'Procesando', color: 'info' },
      completado: { label: 'Completado', color: 'success' },
      cancelado: { label: 'Cancelado', color: 'error' },
    },

    // Tabla
    tabla: {
      encabezados: {
        id: 'ID',
        fecha: 'Fecha',
        cliente: 'Cliente',
        total: 'Total',
        estado: 'Estado',
        acciones: 'Acciones',
      },
      botones: {
        ver: '👁️ Ver',
        editarEstado: '✏️ Estado',
      },
    },

    // Modal de detalle
    modalDetalle: {
      titulo: 'Detalle del Pedido',
      infoCliente: 'Información del Cliente',
      infoPedido: 'Información del Pedido',
      productos: 'Productos',
      totales: {
        subtotal: 'Subtotal:',
        envio: 'Envío:',
        total: 'Total:',
      },
      botones: {
        cerrar: 'Cerrar',
        imprimir: '🖨️ Imprimir',
      },
    },
  },

  // Sección Imágenes
  imagenes: {
    botonSubir: '+ Subir Imagen',
    sinImagenes: 'No hay imágenes registradas.',
    cargando: 'Cargando imágenes...',

    dragDrop: {
      titulo: 'Arrastra y suelta imágenes aquí',
      o: 'o',
      botonSeleccionar: 'Seleccionar archivos',
      tiposPermitidos: 'Formatos: JPG, PNG, GIF, WebP (máx. 5MB)',
    },

    tabla: {
      encabezados: {
        preview: 'Vista previa',
        nombre: 'Nombre',
        tipo: 'Tipo',
        tamano: 'Tamaño',
        fecha: 'Fecha',
        acciones: 'Acciones',
      },
      botones: {
        copiarUrl: '📋 URL',
        eliminar: '🗑️',
      },
    },

    modal: {
      tituloSubir: 'Subir Imágenes',
      botones: {
        cancelar: 'Cancelar',
        subir: 'Subir',
        subiendo: 'Subiendo...',
      },
    },
  },
};

// ============================================================================
// SECCIÓN 3: COMPONENTES COMPARTIDOS
// ============================================================================

export const ComponentesTextos = {
  // Carrito de compras
  carrito: {
    titulo: 'Tu Pedido',
    vacio: {
      titulo: 'Tu carrito está vacío',
      mensaje: 'Agrega algunos productos para comenzar tu pedido.',
    },
    items: {
      cantidad: 'Cant:',
      eliminarTitle: 'Eliminar',
    },
    totales: {
      subtotal: 'Subtotal:',
      envio: 'Envío:',
      total: 'Total:',
    },
    botones: {
      seguirComprando: 'Seguir Comprando',
      vaciar: '🗑️ Vaciar',
      finalizar: 'Finalizar Pedido →',
    },
    envio: {
      gratis: '¡Envío GRATIS!',
      calculando: 'Calculando...',
      gratisDesde: (monto: number) => `Envío gratis en compras mayores a $${monto}`,
    },
  },

  // Modal de cliente
  modalCliente: {
    titulo: 'Finalizar Pedido',
    pasos: ['Carrito', 'Tus Datos', 'Confirmar'],
    campos: {
      nombre: { label: 'Nombre completo *', placeholder: 'Tu nombre y apellido' },
      email: { label: 'Email *', placeholder: 'tu@email.com' },
      telefono: { label: 'Teléfono *', placeholder: '09X XXX XXX' },
      direccion: { label: 'Dirección de entrega *', placeholder: 'Calle, número, apto, etc.' },
      notas: { label: 'Notas adicionales', placeholder: 'Instrucciones especiales, horario de entrega, etc.' },
    },
    errores: {
      nombreRequerido: 'El nombre es requerido',
      emailRequerido: 'El email es requerido',
      emailInvalido: 'Email inválido',
      telefonoRequerido: 'El teléfono es requerido',
      direccionRequerida: 'La dirección es requerida',
    },
    botones: {
      anterior: '← Anterior',
      siguiente: 'Siguiente →',
      confirmar: 'Confirmar Pedido',
      cancelar: 'Cancelar',
      confirmando: 'Procesando...',
    },
    resumen: {
      titulo: 'Resumen del Pedido',
      productos: 'Productos:',
      totalPedido: 'Total del pedido:',
    },
  },

  // WhatsApp Float
  whatsapp: {
    tooltip: '¡Hablemos por WhatsApp!',
    mensajeDefault: '¡Hola! Me interesa hacer un pedido del catálogo.',
  },

  // Alertas / Notificaciones
  alertas: {
    tipos: {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
    },
    botonCerrar: '×',
  },

  // Login
  login: {
    titulo: 'Acceso Administración',
    subtitulo: 'Ingresa tus credenciales',
    campos: {
      email: { label: 'Email', placeholder: 'admin@elretorno.com' },
      password: { label: 'Contraseña', placeholder: '••••••••' },
    },
    botones: {
      ingresar: 'Ingresar',
      ingresando: 'Ingresando...',
    },
    errores: {
      credencialesInvalidas: 'Credenciales inválidas',
      camposRequeridos: 'Todos los campos son requeridos',
    },
  },

  // Pagos (MercadoPago)
  pagos: {
    exito: {
      titulo: '¡Pago Exitoso!',
      mensaje: 'Tu pedido ha sido confirmado y el pago procesado correctamente.',
      botonVolver: 'Volver al Catálogo',
    },
    pendiente: {
      titulo: 'Pago Pendiente',
      mensaje: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
      botonVolver: 'Volver al Catálogo',
    },
    fallido: {
      titulo: 'Pago No Completado',
      mensaje: 'Hubo un problema con tu pago. Puedes intentarlo nuevamente.',
      botonReintentar: 'Reintentar Pago',
      botonVolver: 'Volver al Catálogo',
    },
  },

  // Drawer de categorías
  categoriasDrawer: {
    titulo: 'Categorías',
    todas: 'Todas las categorías',
    sinCategorias: 'No hay categorías disponibles.',
    botonCerrar: '×',
  },

  // Modal de producto
  modalProducto: {
    botonCerrar: '×',
    sinDescripcion: 'Sin descripción disponible.',
    especificaciones: {
      peso: 'Peso',
      categoria: 'Categoría',
    },
    botonAgregar: 'Agregar al Pedido',
    botonAgregado: '✓ Agregado',
  },
};

// ============================================================================
// SECCIÓN 4: MENSAJES DEL SISTEMA
// ============================================================================

export const MensajesSistema = {
  // Errores generales
  errores: {
    generico: 'Ha ocurrido un error. Por favor, intenta nuevamente.',
    conexion: 'Error de conexión. Verifica tu conexión a internet.',
    servidor: 'Error en el servidor. Por favor, intenta más tarde.',
    noAutorizado: 'No tienes permisos para realizar esta acción.',
    sesionExpirada: 'Tu sesión ha expirado. Por favor, ingresa nuevamente.',
  },

  // Confirmaciones
  confirmaciones: {
    eliminar: '¿Estás seguro de que deseas eliminar este elemento?',
    eliminarPermanente: 'Esta acción no se puede deshacer.',
    guardarCambios: '¿Deseas guardar los cambios?',
    descartarCambios: '¿Deseas descartar los cambios no guardados?',
  },

  // Éxitos
  exitos: {
    guardado: 'Los cambios se han guardado correctamente.',
    eliminado: 'El elemento ha sido eliminado correctamente.',
    creado: 'El elemento ha sido creado correctamente.',
    actualizado: 'Los datos se han actualizado correctamente.',
    pedidoEnviado: 'Tu pedido ha sido enviado correctamente.',
    imagenSubida: 'La imagen se ha subido correctamente.',
  },

  // Cargando
  cargando: {
    procesando: 'Procesando...',
    guardando: 'Guardando...',
    eliminando: 'Eliminando...',
    enviando: 'Enviando...',
    cargando: 'Cargando...',
  },
};

// ============================================================================
// SECCIÓN 5: CONFIGURACIÓN DE EMPRESA
// ============================================================================

export const EmpresaConfig = {
  nombre: 'El Retorno',
  nombreCompleto: 'Catálogo Retorno',
  descripcion: 'Catálogo de Productos',
  email: 'admin@elretorno.com',
  telefono: '+59899991013',
  telefonoFormateado: '46328493',
  direccion: 'Atanasio Sierra 418 - Tacuarembó',
  horario: 'Lunes a Viernes de 08:00 a 12:30, 16:00 a 19:00 hs. Sábados de 08:00 a 12:00 hs.',
  redes: {
    facebook: '#',
    instagram: '#',
    whatsapp: 'https://wa.me/59899991013',
  },
  mapa: {
    latitud: -31.723456,
    longitud: -55.9856789,
    direccionMapa: 'Atanasio+Sierra+418+Tacuarembó+Uruguay',
  },
};

// ============================================================================
// EXPORTACIÓN ÚNICA
// ============================================================================

export const Personalizacion = {
  homepage: HomepageTextos,
  administracion: AdministracionTextos,
  componentes: ComponentesTextos,
  mensajes: MensajesSistema,
  empresa: EmpresaConfig,
};

// Helper para acceder fácilmente a los textos
export function getTexto(path: string): string | any {
  const keys = path.split('.');
  let value: any = Personalizacion;

  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Texto no encontrado: ${path}`);
      return '';
    }
  }

  return value;
}

// Helper específico para textos con funciones (que requieren parámetros)
export function getTextoConParametros(path: string, ...params: any[]): string {
  const value = getTexto(path);

  if (typeof value === 'function') {
    return value(...params);
  }

  return value || '';
}
