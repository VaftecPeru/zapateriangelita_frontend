import { useMemo, useState } from "react";
import { Check, Minus, Pencil, Plus, X } from "lucide-react";
import { productService } from "../services/crudService";
import { getImageUrl } from "../config/api";
import { useCart } from "../hooks/useCart";

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
});

const colorNameToHex = (name: string) => {
  const colors: Record<string, string> = {
    blanco: "#ffffff", negro: "#111111", rojo: "#d62828", azul: "#2563eb",
    verde: "#2e8b57", amarillo: "#facc15", rosa: "#f472b6", morado: "#7c3aed",
    gris: "#9ca3af", cafe: "#8b5e3c", marron: "#8b5e3c", beige: "#d6c2a1",
  };
  const normalized = name.trim().toLowerCase();
  return colors[normalized] || (normalized.startsWith("#") ? name.trim() : "#888888");
};

const normalizeOptions = (product: any) => {
  const rawColors = product?.colors;
  const colors = Array.isArray(rawColors) && rawColors.length
    ? rawColors.map((color: any) => {
        const name = String(typeof color === "object" ? color.name || color.color : color).trim();
        return { name, hex: typeof color === "object" && (color.hex || color.color_hex) ? color.hex || color.color_hex : colorNameToHex(name) };
      }).filter((color: any) => color.name)
    : typeof product?.color === "string"
      ? product.color.split(/[,/|]/).map((name: string) => name.trim()).filter(Boolean).map((name: string) => ({ name, hex: colorNameToHex(name) }))
      : [];

  const rawSizes = product?.sizes ?? product?.size;
  const sizeRows = Array.isArray(rawSizes)
    ? rawSizes.map((entry: any) => ({
        size: String(typeof entry === "object" ? entry.size : entry ?? "").trim(),
        stock: Number(typeof entry === "object" ? entry.stock ?? product?.stock ?? 0 : product?.stock ?? 0),
      })).filter((entry: any) => entry.size)
    : typeof rawSizes === "string"
      ? rawSizes.split(/[,|]/).map((size: string) => ({ size: size.trim(), stock: Number(product?.stock || 0) })).filter((entry: any) => entry.size)
      : [];

  const colorSizes = product?.color_sizes && typeof product.color_sizes === "object" ? product.color_sizes : {};
  const colorImages = product?.color_images && typeof product.color_images === "object" ? product.color_images : {};

  return { colors, sizeRows, colorSizes, colorImages };
};

type Props = {
  onVariantChanged?: () => void;
};

export default function EditableOrderSummary({ onVariantChanged }: Props) {
  const { cart, cartTotal, updateCartItem } = useCart();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [editProduct, setEditProduct] = useState<any | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => normalizeOptions(editProduct), [editProduct]);
  const activeSizes = useMemo(() => {
    const allowed = color && Array.isArray(options.colorSizes?.[color]) ? options.colorSizes[color].map(String) : null;
    return allowed?.length ? options.sizeRows.filter((entry: any) => allowed.includes(entry.size)) : options.sizeRows;
  }, [color, options]);

  const openEditor = async (index: number) => {
    const item = cart[index];
    if (!item) return;
    setError(null);
    setLoadingIndex(index);
    try {
      const response = await productService.getById(Number(item.product.id));
      const fresh = { ...item.product, ...response.data };
      setEditProduct(fresh);
      setQuantity(Math.max(1, Number(item.quantity || 1)));
      setSize(String(typeof item.product.size === "object" ? item.product.size?.size || "" : item.product.size || ""));
      setColor(String(typeof item.product.color === "object" ? item.product.color?.name || item.product.color?.color || "" : item.product.color || ""));
      setEditingIndex(index);
    } catch {
      setError("No pudimos cargar las variantes disponibles. Intenta nuevamente.");
    } finally {
      setLoadingIndex(null);
    }
  };

  const saveChanges = () => {
    if (editingIndex === null || !editProduct) return;
    const maxStock = Math.max(0, Number(editProduct.stock || 0));
    const selectedSizeRow = activeSizes.find((entry: any) => entry.size === size);
    const sizeStock = selectedSizeRow ? Math.max(0, Number(selectedSizeRow.stock || 0)) : maxStock;
    const allowedQuantity = Math.min(maxStock || quantity, sizeStock || quantity);

    if (options.colors.length && !color) {
      setError("Selecciona un color.");
      return;
    }
    if (activeSizes.length && !size) {
      setError("Selecciona una talla.");
      return;
    }
    if (allowedQuantity > 0 && quantity > allowedQuantity) {
      setError(`Solo hay ${allowedQuantity} unidad${allowedQuantity === 1 ? "" : "es"} disponible${allowedQuantity === 1 ? "" : "s"} para esta variante.`);
      return;
    }

    const colorImages = color && Array.isArray(options.colorImages?.[color]) ? options.colorImages[color] : [];
    const nextImage = colorImages.length ? getImageUrl(String(colorImages[0])) : itemImage(editProduct);

    updateCartItem(editingIndex, {
      product: {
        ...cart[editingIndex].product,
        ...editProduct,
        price: Number(cart[editingIndex].product?.price ?? editProduct.discounted_price ?? editProduct.price ?? 0),
        size: size || null,
        color: color || null,
        image: nextImage,
      },
      quantity,
    });

    setEditingIndex(null);
    setEditProduct(null);
    setError(null);
    onVariantChanged?.();
  };

  const itemImage = (product: any) => {
    const image = product?.image || product?.img || (Array.isArray(product?.images) ? product.images[0] : "");
    return image ? getImageUrl(String(image)) : "";
  };

  return (
    <aside style={{ padding: "28px", background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,.06)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Resumen del pedido</h2>
          <p style={{ margin: "5px 0 0", fontSize: "11px", color: "#8a8a8a" }}>Puedes ajustar cantidad, talla y color antes de pagar.</p>
        </div>
      </div>

      {error && <p style={{ margin: "14px 0 0", padding: "10px 12px", background: "#fff0f0", color: "#a40000", borderRadius: "10px", fontSize: "12px" }}>{error}</p>}

      {cart.map((item, index) => {
        const isEditing = editingIndex === index;
        const currentColor = typeof item.product?.color === "object" ? item.product.color?.name || item.product.color?.color : item.product?.color;
        const currentSize = typeof item.product?.size === "object" ? item.product.size?.size : item.product?.size;
        const productStock = Math.max(1, Number(editProduct?.stock || item.product?.stock || 10));
        const selectedSizeRow = activeSizes.find((entry: any) => entry.size === size);
        const variantStock = selectedSizeRow ? Math.max(1, Number(selectedSizeRow.stock || 1)) : productStock;
        const maxQty = Math.max(1, Math.min(productStock, variantStock, 10));

        return (
          <div key={`${item.product?.id}-${currentSize || ""}-${currentColor || ""}-${index}`} style={{ position: "relative", padding: "16px 0", borderBottom: "1px solid #eee" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
              <img src={itemImage(item.product)} alt="" style={{ width: "62px", height: "62px", objectFit: "cover", borderRadius: "10px", background: "#f5f5f5" }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start" }}>
                  <strong style={{ fontSize: "14px", lineHeight: 1.35 }}>{item.product?.name || "Producto"}</strong>
                  {!isEditing && (
                    <button type="button" onClick={() => openEditor(index)} disabled={loadingIndex === index} aria-label="Editar producto" title="Editar producto" style={{ width: "32px", height: "32px", borderRadius: "10px", border: "1px solid #ececec", background: "#fff", color: "#e30613", display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 }}>
                      <Pencil size={15} />
                    </button>
                  )}
                </div>
                {!isEditing && (
                  <>
                    <div style={{ color: "#666", fontSize: "12px", marginTop: "4px" }}>
                      {currentSize ? `Talla: ${currentSize}` : ""}{currentSize && currentColor ? " · " : ""}{currentColor ? `Color: ${currentColor}` : ""}
                    </div>
                    <div style={{ color: "#666", fontSize: "12px", marginTop: "3px" }}>{item.quantity} x {money.format(Number(item.product?.price || 0))}</div>
                  </>
                )}
              </div>
            </div>

            {isEditing && editProduct && (
              <div style={{ marginTop: "14px", padding: "14px", borderRadius: "14px", background: "#fafafa", border: "1px solid #ededed" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <strong style={{ fontSize: "12px" }}>Editar producto</strong>
                  <button type="button" onClick={() => { setEditingIndex(null); setEditProduct(null); setError(null); }} style={{ border: 0, background: "transparent", cursor: "pointer", color: "#777" }} aria-label="Cancelar edición"><X size={16} /></button>
                </div>

                <div style={{ display: "grid", gap: "13px" }}>
                  <div>
                    <span style={{ display: "block", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".12em", color: "#777", marginBottom: "7px" }}>Cantidad</span>
                    <div style={{ display: "inline-flex", alignItems: "center", border: "1px solid #ddd", borderRadius: "12px", overflow: "hidden", background: "#fff" }}>
                      <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} style={{ width: "36px", height: "34px", border: 0, background: "#fff", cursor: "pointer" }}><Minus size={14} /></button>
                      <span style={{ minWidth: "38px", textAlign: "center", fontWeight: 800, fontSize: "13px" }}>{quantity}</span>
                      <button type="button" onClick={() => setQuantity((value) => Math.min(maxQty, value + 1))} style={{ width: "36px", height: "34px", border: 0, background: "#fff", cursor: "pointer" }}><Plus size={14} /></button>
                    </div>
                  </div>

                  {options.colors.length > 0 && (
                    <div>
                      <span style={{ display: "block", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".12em", color: "#777", marginBottom: "7px" }}>Color</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                        {options.colors.map((option: any) => {
                          const selected = color === option.name;
                          return <button key={option.name} type="button" onClick={() => { setColor(option.name); if (options.colorSizes?.[option.name]?.length && !options.colorSizes[option.name].map(String).includes(size)) setSize(""); }} style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "7px 10px", borderRadius: "999px", border: selected ? "1px solid #121212" : "1px solid #ddd", background: selected ? "#121212" : "#fff", color: selected ? "#fff" : "#222", cursor: "pointer", fontSize: "11px", fontWeight: 700 }}><span style={{ width: "13px", height: "13px", borderRadius: "50%", background: option.hex, border: "1px solid rgba(0,0,0,.15)" }} />{option.name}</button>;
                        })}
                      </div>
                    </div>
                  )}

                  {activeSizes.length > 0 && (
                    <div>
                      <span style={{ display: "block", fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".12em", color: "#777", marginBottom: "7px" }}>Talla</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                        {activeSizes.map((entry: any) => {
                          const disabled = Number(entry.stock || 0) <= 0;
                          const selected = size === entry.size;
                          return <button key={entry.size} type="button" disabled={disabled} onClick={() => setSize(entry.size)} style={{ minWidth: "42px", padding: "7px 9px", borderRadius: "9px", border: selected ? "1px solid #e30613" : "1px solid #ddd", background: selected ? "#fff0f0" : "#fff", color: disabled ? "#bbb" : selected ? "#e30613" : "#222", cursor: disabled ? "not-allowed" : "pointer", fontSize: "11px", fontWeight: 800, textDecoration: disabled ? "line-through" : "none" }}>{entry.size}</button>;
                        })}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "8px", marginTop: "2px" }}>
                    <button type="button" onClick={() => { setEditingIndex(null); setEditProduct(null); setError(null); }} style={{ flex: 1, padding: "10px", borderRadius: "10px", border: "1px solid #ddd", background: "#fff", fontSize: "11px", fontWeight: 800, cursor: "pointer" }}>Cancelar</button>
                    <button type="button" onClick={saveChanges} style={{ flex: 1.4, padding: "10px", borderRadius: "10px", border: 0, background: "#e30613", color: "#fff", fontSize: "11px", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}><Check size={14} /> Guardar cambios</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", paddingTop: "16px", borderTop: "2px solid #eee", fontWeight: 800 }}>
        <span style={{ fontSize: "18px" }}>Total</span>
        <span style={{ color: "#e30613", fontSize: "24px" }}>{money.format(cartTotal)}</span>
      </div>
    </aside>
  );
}
