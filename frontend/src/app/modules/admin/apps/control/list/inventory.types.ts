export interface InventoryProduct
{
    id: string;
    category?: string;
    name: string;
    description?: string;
    tags?: string[];
    sku?: string | null;
    barcode?: string | null;
    brand?: string | null;
    vendor: string | null;
    stock: string;
    reserved: string;
    cost: string;
    basePrice: string;
    taxPercent: string;
    price: string;
    weight: string;
    thumbnail: string;
    images: string[];
    active: boolean;
    


    
}

export interface InventoryPagination
{
    length: number;
    size: number;
    page: number;
    lastPage: number;
    startIndex: number;
    endIndex: number;
}

export interface InventoryCategory
{
    id: string;
    parentId: string;
    name: string;
    slug: string;
}

export interface Bien {
    tipo: string;
    observacion: string;
    unidad: string;
    caracteristicas: Caracteristicas;
  }
  export interface Caracteristicas {
    MARCA: string;
    MODELO: string;
    SERIE: string;
  }
  export interface BienesResponse {
    data: Bien;
  }

export interface InventoryBrand
{
    id: string;
    name: string;
    slug: string;
}

export interface InventoryTag
{
    id?: string;
    title?: string;
}

export interface InventoryVendor
{
    id: string;
    name: string;
    slug: string;
}



export interface InventoryEquipment {
    

    equipos_id: number; // Equipos_id es la clave primaria
    ip?: string | null; // Dirección IP del equipo
    procesador?: string | null; // Tipo de procesador
    funcionariousuario?: string | null; // Usuario asignado al equipo
    lector?: boolean | null; // Lector de tarjetas, CDs, etc.
    tarjetavideo?: string | null; // Información sobre la tarjeta de videofrontend/src/app/modules/admin/apps/ecommerce/inventory/inventory.types.ts
    funcionarioasignado?: string | null; // Funcionario al que se asigna el equipo
    oficina?: string | null; // Oficina donde se encuentra el equipo
    fecharegistro?: string | null; // Fecha de registro del equipo
    codigo?: string | null; // Código del equipo
    memoria?: string | null; // Información de la memoria RAM
    tarjetamadre?: string | null; // Información de la tarjeta madre
    antivirus?: string | null; // Software antivirus instalado
    garantia?: string | null; // Garantía del equipo
    discoduro?: string | null; // Información sobre el disco duro
    marca?: string | null; // Marca del equipo
    tipo?: number | null; // Tipo de equipo (PC, Laptop, etc.)cd
    modelo?: string | null; // Modelo del equipo
    serie?: string | null; // Número de serie
    so?: string | null; // Sistema operativo
    responsable?: number | null; // ID del responsable
    mac?: string | null; // Dirección MAC de la tarjeta de red
    responsabledelregistroString?: string | null;// String del responsable
    tipoDescripcion:string | null;
}

export interface Empleado {
    nombre_completo: string;
    otroNombre: string;
    nombre: string;
    paterno: string;
    materno: string;
    fechanac: string;
    sexo: string;
    nroItem: string;
    tipoContrato: string;
    cargo: string;
    unidad: string;
    numDocumento: string;
    expedidoci: string;
    email: string;
    telefono: string;
    direccion: string;
    fechaIncorporacion: string;
    fechaBaja: string | null;
    resideCapital: string;
    
  }
  


