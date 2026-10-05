import { Package, AlertTriangle, PackageX, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { inventoryService } from '../../services/crudService';

interface InventoryItem {
    product_id: number;
    variant_id: number | null;
    product_code: string | null;
    name: string;
    image: string | null;
    brand: string | null;
    category: string | null;
    color: string | null;
    size: string | null;
    stock: number;
    stock_minimum: number;
    status: 'disponible' | 'stock_bajo' | 'agotado';
    source: 'variant' | 'size' | 'product';
}

interface InventorySummary {
    total_stock: number;
    available: number;
    low_stock: number;
    out_of_stock: number;
}

const InventoryManager = () => {
    const [search, setSearch] = useState('');
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [summary, setSummary] = useState<InventorySummary>({
        total_stock: 0,
        available: 0,
        low_stock: 0,
        out_of_stock: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [movementType, setMovementType] = useState<'entrada' | 'salida' | 'ajuste'>('entrada');
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [saving, setSaving] = useState(false);
    const [movementError, setMovementError] = useState('');
    const [showConfirmation, setShowConfirmation] = useState(false);
    const loadInventory = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await inventoryService.getInventory();
            setItems(response.data.items ?? []);
            setSummary(
                response.data.summary ?? {
                    total_stock: 0,
                    available: 0,
                    low_stock: 0,
                    out_of_stock: 0,
                }
            );
        } catch (err: any) {
            console.error('Error al cargar inventario:', err);
            setError( err?.response?.data?.message || 'No se pudo cargar el inventario.' );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadInventory(); }, []);

    const filteredItems = useMemo(() => {
        const value = search.toLowerCase().trim();
        if (!value) {
            return items;
        }
        return items.filter((item) => {
            return (
                item.name.toLowerCase().includes(value) ||
                (item.product_code ?? '') .toLowerCase() .includes(value) ||
                (item.color ?? '') .toLowerCase() .includes(value) ||
                (item.size ?? '') .toLowerCase() .includes(value)
            );
        });
    }, [items, search]);

    const handleRequestConfirmation = () => {
        const numericQuantity = Number(quantity);

        if (
            quantity.trim() === '' || !Number.isInteger(numericQuantity) || numericQuantity < 0 || ( movementType !== 'ajuste' && numericQuantity === 0 )
        ) {
            setMovementError(
                movementType === 'ajuste' ? 'Ingresa un stock final válido.' : 'La cantidad debe ser mayor a cero.'
            );
            return;
        }
        setMovementError('');
        setShowConfirmation(true);
    };

    const handleAdjustStock = async () => {
        if (!selectedItem) {
            return;
        }
        const numericQuantity = Number(quantity);

        if (
            quantity.trim() === '' || !Number.isInteger(numericQuantity) || numericQuantity < 0 ||
            (
                movementType !== 'ajuste' && numericQuantity === 0
            )
        ) {
            setMovementError(
                movementType === 'ajuste' ? 'Ingresa un stock final válido.' : 'La cantidad debe ser mayor a cero.'
            );
            return;
        }

        try {
            setSaving(true);
            setMovementError('');

            await inventoryService.adjustStock({
                product_id: selectedItem.product_id,
                variant_id: selectedItem.variant_id,
                color: selectedItem.color,
                size: selectedItem.size,
                type: movementType,
                quantity: numericQuantity,
                reason: reason.trim() || undefined,
            });

            await loadInventory();
            setShowConfirmation(false);
            setSelectedItem(null);
            setQuantity('');
            setReason('');
            setMovementType('entrada');
            setMovementError('');

        } catch (err: any) {
            console.error( 'Error al ajustar inventario:', err );
            setMovementError( err?.response?.data?.message || 'No se pudo actualizar el inventario.' );

        } finally {
            setSaving(false);
        }
    };

    const closeAdjustmentModal = () => {
        if (saving) {
            return;
        }
        setSelectedItem(null);
        setShowConfirmation(false);
        setMovementType('entrada');
        setQuantity('');
        setReason('');
        setMovementError('');
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                    Gestión de Inventario
                </h2>
                <p className="text-sm text-gray-500 mt-1">Controla el stock disponible de los productos por talla y color.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400"> Stock total </p>
                            <p className="text-3xl font-black text-gray-900 mt-2"> {summary.total_stock}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Package size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400"> Stock bajo </p>
                            <p className="text-3xl font-black text-gray-900 mt-2"> {summary.low_stock} </p>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>

                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400"> Agotados </p>
                            <p className="text-3xl font-black text-gray-900 mt-2">
                                {summary.out_of_stock}
                            </p>
                        </div>

                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <PackageX size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="relative max-w-md">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                        placeholder="Buscar producto..."
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-store-red transition-colors"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-xs uppercase tracking-widest text-gray-500">
                                <th className="px-5 py-4"> Producto </th>
                                <th className="px-5 py-4"> Código </th>
                                <th className="px-5 py-4"> Color </th>
                                <th className="px-5 py-4"> Talla </th>
                                <th className="px-5 py-4"> Stock </th>
                                <th className="px-5 py-4"> Estado </th>
                                <th className="px-5 py-4 text-right"> Acciones </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center text-gray-400" >
                                        Cargando inventario...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center text-red-500 font-bold" >
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-16 text-center text-gray-400" >
                                        No se encontraron productos.
                                    </td>
                                </tr>
                            ) : (

                                filteredItems.map((item) => (
                                    <tr
                                        key={
                                            `${item.product_id}-` +
                                            `${item.variant_id ?? 'general'}-` +
                                            `${item.color ?? ''}-` +
                                            `${item.size ?? ''}`
                                        }
                                        className="border-t border-gray-100 hover:bg-gray-50/50 transition-colors"
                                    >

                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover border border-gray-100"/>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                                                        <Package size={18} />
                                                    </div>
                                                )}

                                                <div>
                                                    <p className="font-bold text-gray-900"> {item.name} </p>
                                                    <p className="text-xs text-gray-400">
                                                        {
                                                            item.brand ||
                                                            'Sin marca'
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {
                                                item.product_code ||
                                                'Sin código'
                                            }
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {item.color || '—'}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-gray-600">
                                            {item.size || '—'}
                                        </td>

                                        <td className="px-5 py-4">
                                            <span className="font-black text-gray-900">
                                                {item.stock}
                                            </span>

                                            <span className="text-xs text-gray-400 ml-1">
                                                unidades
                                            </span>

                                        </td>

                                        <td className="px-5 py-4">

                                            <span className={ `inline-flex px-3 py-1 rounded-full text-xs font-black uppercase ${ item.status === 'agotado' ? 'bg-red-100 text-red-600' : item.status === 'stock_bajo' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-600' }`} >
                                                {
                                                    item.status === 'agotado'
                                                        ? 'Agotado'
                                                        : item.status === 'stock_bajo'
                                                            ? 'Stock bajo'
                                                            : 'Disponible'
                                                }

                                            </span>

                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedItem( item ); setMovementType( 'entrada' ); setQuantity(''); setReason(''); setMovementError(''); setShowConfirmation(false); }}
                                                className="px-4 py-2 bg-store-red text-white rounded-xl text-xs font-black uppercase hover:opacity-90 transition-opacity"
                                            >
                                                Ajustar
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedItem && (
                <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-black text-gray-900">
                                    Ajustar inventario
                                </h3>

                                <p className="text-sm text-gray-400 mt-1">
                                    {selectedItem.name}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeAdjustmentModal}
                                disabled={saving}
                                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase text-gray-400">
                                        Color
                                    </p>

                                    <p className="font-bold mt-1">
                                        { selectedItem.color || '—' }
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase text-gray-400">
                                        Talla
                                    </p>

                                    <p className="font-bold mt-1">
                                        {
                                            selectedItem.size ||
                                            '—'
                                        }
                                    </p>

                                </div>

                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-[10px] font-black uppercase text-gray-400">
                                        Stock actual
                                    </p>

                                    <p className="font-black text-lg mt-1">
                                        {selectedItem.stock}
                                    </p>
                                </div>

                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">
                                    Tipo de movimiento
                                </label>
                                <select
                                    value={movementType}
                                    onChange={(e) => {
                                        setMovementType( e.target.value as | 'entrada' | 'salida' | 'ajuste' );
                                        setMovementError('');
                                    }}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-store-red"
                                >

                                    <option value="entrada"> Entrada </option>
                                    <option value="salida"> Salida </option>
                                    <option value="ajuste"> Ajuste manual </option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">
                                    { movementType === 'ajuste' ? 'Nuevo stock' : 'Cantidad' }
                                </label>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={quantity}
                                    onChange={(e) => {
                                        setQuantity( e.target.value );
                                        setMovementError('');
                                    }}
                                    placeholder={
                                        movementType === 'ajuste' ? 'Stock final' : 'Cantidad'
                                    }
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-store-red"
                                />
                                {movementType === 'ajuste' && (
                                    <p className="text-xs text-gray-400 mt-2">
                                        La cantidad ingresada representará el nuevo stock final.
                                    </p>

                                )}

                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase text-gray-500 mb-2">
                                    Motivo
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) =>
                                        setReason(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Ejemplo: Reposición de mercadería"
                                    rows={3}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-store-red resize-none"
                                />

                            </div>

                            {movementError && !showConfirmation && (
                                <div className="bg-red-50 text-red-600 text-sm font-bold rounded-xl px-4 py-3">
                                    {movementError}
                                </div>

                            )}

                        </div>

                        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={closeAdjustmentModal}
                                disabled={saving}
                                className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleRequestConfirmation}
                                disabled={saving}
                                className="px-5 py-3 rounded-xl bg-store-red text-white text-sm font-black disabled:opacity-50"
                            >
                                Actualizar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showConfirmation && selectedItem && (
                <div className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h3 className="text-xl font-black text-gray-900">
                                Confirmar actualización
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Esta acción modificará el inventario del producto.
                            </p>

                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="font-black text-gray-900"> {selectedItem.name} </p>
                                <div className="grid grid-cols-2 gap-4 mt-4 text-sm">

                                    <div>
                                        <span className="text-gray-400"> Color: </span>
                                        <p className="font-bold"> { selectedItem.color || '—' } </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-400"> Talla: </span>
                                        <p className="font-bold"> { selectedItem.size || '—' } </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-400"> Stock actual: </span>
                                        <p className="font-black"> {selectedItem.stock} </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-400"> Operación: </span>

                                        <p className="font-black capitalize"> {movementType} </p>
                                    </div>

                                    <div>
                                        <span className="text-gray-400">
                                            {
                                                movementType === 'ajuste' ? 'Nuevo stock:' : 'Cantidad:'
                                            }
                                        </span>

                                        <p className="font-black"> {quantity} </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-red-50 text-red-700 rounded-2xl p-4 text-sm font-bold">
                                ¿Estás seguro de que deseas actualizar este inventario?
                            </div>

                            {movementError && (
                                <div className="bg-red-50 text-red-600 text-sm font-bold rounded-xl px-4 py-3">
                                    {movementError}
                                </div>
                            )}

                        </div>

                        <div className="flex justify-end gap-3 px-6 py-5 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => {

                                    if (!saving) {
                                        setShowConfirmation( false );
                                        setMovementError('');
                                    }
                                }}
                                disabled={saving}
                                className="px-5 py-3 rounded-xl border border-gray-200 text-sm font-bold disabled:opacity-50"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={handleAdjustStock}
                                disabled={saving}
                                className="px-5 py-3 rounded-xl bg-store-red text-white text-sm font-black disabled:opacity-50"
                            >
                                { saving ? 'Actualizando...' : 'Sí, actualizar' }

                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;