export const defaultChildrenMenu = [
  { talla: "Bebé (8-13)", items: ["Botas", "Casual", "Sandalias", "Tenis"] },
  { talla: "Preescolar (14-17)", items: ["Balerinas", "Botas", "Botines", "Casual", "Tenis", "Sandalias"] },
  { talla: "Niña (18-21)", items: ["Alpargatas", "Balerinas y flats", "Botas", "Casual", "Graduación", "Lluvia", "Pantufla", "Sandalia", "Tenis deportivos", "Tenis urbanos"] },
  { talla: "Niño (18-21)", items: ["Botas", "Casual", "Sandalias", "Tacos de fútbol", "Tenis deportivos", "Tenis urbanos"] },
];

export function readChildrenMenu(value: unknown): typeof defaultChildrenMenu {
  if (typeof value !== 'string') return defaultChildrenMenu;
  try {
    const lists: unknown = JSON.parse(value);
    if (!Array.isArray(lists) || lists.length !== defaultChildrenMenu.length) return defaultChildrenMenu;
    return defaultChildrenMenu.map((group, index) => ({
      ...group,
      items: Array.isArray(lists[index])
        ? lists[index].filter((item: unknown): item is string => typeof item === 'string' && item.trim() !== '')
        : group.items,
    }));
  } catch {
    return defaultChildrenMenu;
  }
}
