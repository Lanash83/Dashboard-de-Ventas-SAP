const API_URL = "http://localhost:3000/ejecutar-sql";
let datosCompletos = [];
let datosFiltrados = [];
let modoActual = "";

const BODEGAS_FILTRO = `'P102', 'P101', 'M100', 'I001', 'I002', 'I003', 'I004', 'I007', 'I008', 'I009', 'P112', 'P100', 'T005', 'T015', 'T031', 'T050', 'T002', 'T053', 'T045', 'T046', 'T012', 'T039', 'T042', 'T009', 'T022', 'T021', 'T023', 'T034', 'T057', 'T035', 'T036', 'T037', 'T052'`;

function navegar(mod) {
    document.getElementById('pantalla-inicio').classList.add('hidden');
    document.getElementById('contenedor-app').classList.remove('hidden');
    document.getElementById('mod-inventario').classList.toggle('hidden', mod !== 'inventario');
    document.getElementById('mod-ventas').classList.toggle('hidden', mod !== 'ventas');
    document.getElementById('txt-modulo').innerText = mod === 'inventario' ? 'Gestión de Inventario' : 'Panel de Control de Ventas';
}

function irMenu() {
    document.getElementById('pantalla-inicio').classList.remove('hidden');
    document.getElementById('contenedor-app').classList.add('hidden');
}

function abrirSubModulo(id, nombre) {
    modoActual = id;
    document.getElementById('txt-submodulo').innerText = nombre;
    document.getElementById('menu-submodulos-inv').classList.add('hidden');
    document.getElementById('vista-tabla').classList.remove('hidden');
    ejecutarConsultaActual();
}

function regresarMenuSub() {
    document.getElementById('menu-submodulos-inv').classList.remove('hidden');
    document.getElementById('vista-tabla').classList.add('hidden');
}

async function ejecutarConsultaActual() {
    const querySQL = `
        SELECT 'BD_PRUEBAS1' AS "Empresa", T0."WhsCode" AS "Almacen", T0."ItemCode" AS "Codigo", T1."ItemName" AS "Descripcion", T0."OnHand" AS "Stock", T0."AvgPrice" AS "CostoU", (T0."OnHand" * T0."AvgPrice") AS "Total"
        FROM "BD_PRUEBAS1.OITW T0 INNER JOIN "BD_PRUEBAS1".OITM T1 ON T0."ItemCode" = T1."ItemCode"
        WHERE T0."WhsCode" IN (${BODEGAS_FILTRO}) AND T0."OnHand" <> 0
        UNION ALL
        SELECT 'BD_PRUEBAS2' AS "Empresa", T0."WhsCode" AS "Almacen", T0."ItemCode" AS "Codigo", T1."ItemName" AS "Descripcion", T0."OnHand" AS "Stock", T0."AvgPrice" AS "CostoU", (T0."OnHand" * T0."AvgPrice") AS "Total"
        FROM "BD_PRUEBAS2".OITW T0 INNER JOIN "BD_PRUEBAS2".OITM T1 ON T0."ItemCode" = T1."ItemCode"
        WHERE T0."WhsCode" IN (${BODEGAS_FILTRO}) AND T0."OnHand" <> 0
        UNION ALL
        SELECT 'BD_PRUEBAS3' AS "Empresa", T0."WhsCode" AS "Almacen", T0."ItemCode" AS "Codigo", T1."ItemName" AS "Descripcion", T0."OnHand" AS "Stock", T0."AvgPrice" AS "CostoU", (T0."OnHand" * T0."AvgPrice") AS "Total"
        FROM "BD_PRUEBAS3".OITW T0 INNER JOIN "BD_PRUEBAS3".OITM T1 ON T0."ItemCode" = T1."ItemCode"
        WHERE T0."WhsCode" IN (${BODEGAS_FILTRO}) AND T0."OnHand" <> 0
        ORDER BY "Empresa", "Almacen"`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: querySQL })
        });
        datosCompletos = await response.json();
        
        const selectAlmacen = document.getElementById('filtro-almacen');
        const almacenes = [...new Set(datosCompletos.map(i => i.Almacen))].sort();
        selectAlmacen.innerHTML = '<option value="">Todos los Almacenes</option>' + 
                                  almacenes.map(a => `<option value="${a}">${a}</option>`).join('');

        datosFiltrados = [...datosCompletos];
        renderizar();
    } catch (e) {
        console.error("Error", e);
    }
}

function renderizar() {
    const head = document.getElementById('tabla-head');
    const body = document.getElementById('tabla-body');
    
    if (modoActual === 'stock-almacen') {
        head.innerHTML = `
            <tr>
                <th style="width: 10%" class="p-3 text-center">ALM</th>
                <th style="width: 20%" class="p-3">CÓDIGO</th>
                <th style="width: 55%" class="p-3">DESCRIPCIÓN</th>
                <th style="width: 15%" class="p-3 text-center">STOCK</th>
            </tr>`;
        body.innerHTML = datosFiltrados.map(f => `
            <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
                <td class="p-3 text-center text-slate-500 font-bold">${f.Almacen}</td>
                <td class="p-3 text-cyan-400 font-mono">${f.Codigo}</td>
                <td class="p-3 text-white uppercase text-[10px]">${f.Descripcion}</td>
                <td class="p-3 text-center font-bold text-white text-lg">${Number(f.Stock).toLocaleString()}</td>
            </tr>`).join('');
    } else {
        head.innerHTML = `
            <tr>
                <th style="width: 12%" class="p-3">EMPRESA</th>
                <th style="width: 8%" class="p-3 text-center">ALM</th>
                <th style="width: 15%" class="p-3">CÓDIGO</th>
                <th style="width: 35%" class="p-3">DESCRIPCIÓN</th>
                <th style="width: 10%" class="p-3 text-center">STOCK</th>
                <th style="width: 10%" class="p-3 text-right">COSTO U.</th>
                <th style="width: 10%" class="p-3 text-right">TOTAL</th>
            </tr>`;
        body.innerHTML = datosFiltrados.map(f => `
            <tr class="border-b border-slate-800 hover:bg-slate-800/40 transition">
                <td class="p-3 font-bold text-[10px] ${f.Empresa === 'BD_PRUEBAS2' ? 'text-rose-400' : f.Empresa === 'BD_PRUEBAS3' ? 'text-purple-400' : 'text-cyan-400'}">${f.Empresa}</td>
                <td class="p-3 text-center text-slate-500 font-bold">${f.Almacen}</td>
                <td class="p-3 text-cyan-400 font-mono">${f.Codigo}</td>
                <td class="p-3 text-white uppercase text-[10px]">${f.Descripcion}</td>
                <td class="p-3 text-center font-bold text-white">${Number(f.Stock).toLocaleString()}</td>
                <td class="p-3 text-right text-slate-400 font-mono text-[10px]">$ ${Number(f.CostoU).toFixed(2)}</td>
                <td class="p-3 text-right text-emerald-400 font-bold font-mono text-[10px]">$ ${Number(f.Total).toLocaleString()}</td>
            </tr>`).join('');
    }
}

function filtrarTabla() {
    const alm = document.getElementById('filtro-almacen').value;
    const txt = document.getElementById('buscador-texto').value.toLowerCase();
    datosFiltrados = datosCompletos.filter(f => (alm === "" || f.Almacen === alm) && 
                    (f.Codigo.toLowerCase().includes(txt) || f.Descripcion.toLowerCase().includes(txt)));
    renderizar();
}

function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(datosFiltrados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SAP_Report");
    XLSX.writeFile(wb, "Reporte.xlsx");
}