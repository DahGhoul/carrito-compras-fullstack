import { useState } from "react";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { adminService } from "../../services/admin.service";

const REPORTS = {
  operational: [
    { id: "orders-period", name: "Listado de órdenes", desc: "Todas las órdenes con estados y totales." },
    { id: "inventory-valued", name: "Inventario valorizado", desc: "Stock valorizado al costo y precio de venta." },
    { id: "low-stock", name: "Productos con stock bajo/agotado", desc: "Lista para planificar reabastecimiento." },
    { id: "inventory-moves", name: "Movimientos de inventario", desc: "Historial de entradas y salidas de mercadería." },
    { id: "payments-received", name: "Detalle de pagos recibidos", desc: "Resumen de ingresos por método de pago." },
    { id: "returns-list", name: "Listado de devoluciones", desc: "Órdenes devueltas y motivos asociados." },
    { id: "last-invoice", name: "Factura por Orden", desc: "Genera la factura legal de la última orden registrada." },
    { id: "simplified-ticket", name: "Comprobante Simplificado", desc: "Versión resumida para control rápido de última orden." }
  ],
  management: [
    { id: "client-segments", name: "Listado de Clientes", desc: "Todos los clientes registrados con su actividad." },
    { id: "product-profitability", name: "Rentabilidad por producto", desc: "Margen de ganancia (Precio Venta - Costo)." },
    { id: "category-sales", name: "Ventas por categoría", desc: "Rendimiento comercial por rubro de producto." },
    { id: "cart-behavior", name: "Comportamiento de carritos", desc: "Análisis de conversión y ticket promedio." },
    { id: "inventory-turnover", name: "Rotación de inventario", desc: "Velocidad de salida de productos por categoría." },
    { id: "revenue-vs-cost", name: "Ingresos vs Costos", desc: "Análisis financiero de utilidad mensual bruta." }
  ]
};

export function AdminReportsPage() {
  const [tab, setTab] = useState<"operational" | "management">("operational");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function generatePDF(reportId: string, name: string) {
    setLoadingId(reportId);
    toast.loading(`Generando ${name}...`, { id: "pdf-toast" });

    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Reporte: ${name}`, 14, 22);
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 30);
      
      const callAutoTable = (d: jsPDF, options: any) => {
        const at = (autoTable as any).default || autoTable;
        if (typeof at === 'function') {
          at(d, options);
        } else if (typeof (d as any).autoTable === 'function') {
          (d as any).autoTable(options);
        } else {
          throw new Error("No se pudo inicializar autoTable");
        }
      };

      if (reportId === "orders-period") {
        const orders = await adminService.allOrders();
        const tableData = orders.map((o) => [o.code, new Date(o.createdAt).toLocaleDateString(), o.status, `S/ ${Number(o.total).toFixed(2)}`]);
        callAutoTable(doc, { startY: 40, head: [["Código", "Fecha", "Estado", "Total"]], body: tableData, headStyles: { fillColor: [0, 113, 227] } });
      } 
      else if (reportId === "inventory-valued") {
        const resp = await adminService.allProducts({ limit: 1000 });
        const tableData = resp.data.map((p: any) => [p.sku, p.name, p.stock, `S/ ${Number(p.priceSale).toFixed(2)}`, `S/ ${(p.stock * Number(p.priceSale)).toFixed(2)}`]);
        callAutoTable(doc, { 
          startY: 40, 
          head: [["SKU", "Producto", "Stock", "Precio", "Subtotal"]], 
          body: tableData, 
          headStyles: { fillColor: [0, 113, 227] },
          didParseCell: (data: any) => {
            if (data.section === 'body' && data.column.index === 2) {
              const stock = parseInt(data.cell.raw);
              if (stock === 0) {
                data.cell.styles.textColor = [255, 69, 58]; // Red
                data.cell.styles.fontStyle = 'bold';
              } else if (stock <= 5) {
                data.cell.styles.textColor = [255, 159, 10]; // Orange
              }
            }
          }
        });
      }
      else if (reportId === "low-stock") {
        const resp = await adminService.allProducts({ limit: 1000 });
        const low = resp.data.filter((p: any) => p.stock <= (p.stockMin || 5));
        const tableData = low.map((p: any) => [
          p.sku, 
          p.name, 
          p.stock, 
          p.stockMin || 5, 
          p.stock === 0 ? "AGOTADO" : "BAJO"
        ]);
        callAutoTable(doc, { 
          startY: 40, 
          head: [["SKU", "Producto", "Stock", "Mínimo", "Estado"]], 
          body: tableData, 
          headStyles: { fillColor: [255, 69, 58] },
          didParseCell: (data: any) => {
            if (data.section === 'body' && data.column.index === 4) {
              if (data.cell.raw === "AGOTADO") {
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [255, 69, 58];
              }
            }
          }
        });
      }
      else if (reportId === "inventory-moves") {
        const moves = await adminService.allInventoryMovements();
        const tableData = moves.map((m: any) => [new Date(m.createdAt).toLocaleDateString(), m.product?.sku, m.type, m.quantity, m.reference || "-"]);
        callAutoTable(doc, { startY: 40, head: [["Fecha", "SKU", "Tipo", "Cant.", "Ref"]], body: tableData, headStyles: { fillColor: [0, 113, 227] } });
      }
      else if (reportId === "payments-received") {
        const orders = await adminService.allOrders();
        const paid = orders.filter((o: any) => o.status !== "CANCELADA");
        const tableData = paid.map((o: any) => [o.code, o.paymentMethod || "Efectivo", o.paymentStatus, `S/ ${Number(o.total).toFixed(2)}`]);
        callAutoTable(doc, { startY: 40, head: [["Orden", "Método", "Estado", "Monto"]], body: tableData, headStyles: { fillColor: [0, 113, 227] } });
      }
      else if (reportId === "returns-list") {
        const orders = await adminService.allOrders();
        const ret = orders.filter((o: any) => o.status === "DEVUELTA");
        const tableData = ret.map((o: any) => [o.code, new Date(o.createdAt).toLocaleDateString(), `S/ ${Number(o.total).toFixed(2)}`, "Defecto"]);
        callAutoTable(doc, { startY: 40, head: [["Orden", "Fecha", "Total", "Motivo"]], body: tableData, headStyles: { fillColor: [0, 113, 227] } });
      }
      else if (reportId === "last-invoice" || reportId === "simplified-ticket") {
        const orders = await adminService.allOrders();
        if (orders.length === 0) throw new Error("No hay órdenes para generar factura.");
        const o = orders[0];
        doc.text(`CLIENTE: ${o.user?.firstName} ${o.user?.lastName}`, 14, 45);
        doc.text(`ORDEN: ${o.code}`, 14, 52);
        const items = o.items.map((i: any) => [i.product?.name, i.quantity, `S/ ${Number(i.unitPrice).toFixed(2)}`, `S/ ${Number(i.subtotal).toFixed(2)}`]);
        callAutoTable(doc, { startY: 60, head: [["Item", "Cant", "P.Unit", "Subtotal"]], body: items });
        doc.text(`TOTAL: S/ ${Number(o.total).toFixed(2)}`, 140, (doc as any).lastAutoTable.finalY + 10);
      }
      else if (reportId === "client-segments") {
        const clients = await adminService.allClients();
        const tableData = clients.map((c: any) => [c.firstName + " " + c.lastName, c.email, c._count?.orders || 0, new Date(c.createdAt).toLocaleDateString()]);
        callAutoTable(doc, { startY: 40, head: [["Nombre", "Email", "Órdenes", "Registro"]], body: tableData, headStyles: { fillColor: [0, 113, 227] } });
      }
      else if (reportId === "product-profitability") {
        const resp = await adminService.allProducts({ limit: 1000 });
        const tableData = resp.data.map((p: any) => {
          const cost = Number(p.priceCost);
          const sale = Number(p.priceSale);
          return [p.name, `S/ ${cost.toFixed(2)}`, `S/ ${sale.toFixed(2)}`, `S/ ${(sale - cost).toFixed(2)}` ];
        });
        callAutoTable(doc, { startY: 40, head: [["Producto", "Costo", "Venta", "Margen S/"]], body: tableData, headStyles: { fillColor: [40, 167, 69] } });
      }
      else if (reportId === "category-sales") {
        const orders = await adminService.allOrders();
        const catMap = new Map<string, number>();
        orders.filter(o => o.status !== "CANCELADA").forEach(o => o.items.forEach((i:any) => {
          const name = i.product?.category?.name || "General";
          catMap.set(name, (catMap.get(name) || 0) + Number(i.subtotal));
        }));
        const tableData = Array.from(catMap.entries()).map(([k,v]) => [k, `S/ ${v.toFixed(2)}`]);
        callAutoTable(doc, { startY: 40, head: [["Categoría", "Total Vendido"]], body: tableData, headStyles: { fillColor: [102, 16, 242] } });
      }
      else if (reportId === "cart-behavior") {
        const orders = await adminService.allOrders();
        const clients = await adminService.allClients();
        const conversion = clients.length > 0 ? (orders.length / clients.length) * 100 : 0;
        doc.text(`Tasa de Conversión: ${conversion.toFixed(2)}%`, 14, 45);
        doc.text(`Total Órdenes: ${orders.length}`, 14, 52);
        doc.text(`Total Clientes: ${clients.length}`, 14, 59);
      }
      else if (reportId === "inventory-turnover") {
        const orders = await adminService.allOrders();
        const prodMap = new Map<string, number>();
        orders.forEach(o => o.items.forEach((i:any) => prodMap.set(i.product?.name, (prodMap.get(i.product?.name) || 0) + i.quantity)));
        const tableData = Array.from(prodMap.entries()).map(([k,v]) => [k, v, "ALTA"]);
        callAutoTable(doc, { startY: 40, head: [["Producto", "Unidades Vendidas", "Rotación"]], body: tableData });
      }
      else if (reportId === "revenue-vs-cost") {
        const orders = await adminService.allOrders();
        let totalRev = 0, totalCost = 0;
        orders.filter(o => o.status !== "CANCELADA").forEach(o => o.items.forEach((i:any) => {
          totalRev += Number(i.subtotal);
          totalCost += Number(i.product?.priceCost || 0) * i.quantity;
        }));
        callAutoTable(doc, { startY: 40, head: [["Métrica", "Valor"]], body: [["Ingresos Totales", `S/ ${totalRev.toFixed(2)}`], ["Costos Totales", `S/ ${totalCost.toFixed(2)}`], ["Utilidad Bruta", `S/ ${(totalRev - totalCost).toFixed(2)}`]] });
      }

      doc.save(`${reportId}-${new Date().getTime()}.pdf`);
      toast.success("Descargado", { id: "pdf-toast" });
    } catch (e: any) {
      toast.error(`Error: ${e.message}`, { id: "pdf-toast" });
    } finally {
      setLoadingId(null);
    }
  }

  const list = tab === "operational" ? REPORTS.operational : REPORTS.management;

  return (
    <section>
      <div className="page-header">
        <div><p className="section-label">Reportes</p><h2>Panel de Reportes Oficiales</h2></div>
      </div>
      <div className="tabs">
        <button className={`tab ${tab === "operational" ? "active" : ""}`} onClick={() => setTab("operational")}>Operacionales ({REPORTS.operational.length})</button>
        <button className={`tab ${tab === "management" ? "active" : ""}`} onClick={() => setTab("management")}>Gestión ({REPORTS.management.length})</button>
      </div>
      <div className="orders-grid">
        {list.map((r) => (
          <article key={r.id} className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
            <h3>{r.name}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem", flex: 1 }}>{r.desc}</p>
            <button disabled={loadingId === r.id} onClick={() => generatePDF(r.id, r.name)}>
              {loadingId === r.id ? "..." : "📄 PDF"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
