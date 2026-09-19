export const onlyLettersAndSpaces = (value: string) => value.replace(/[^\p{L}\s'-]/gu, "");
export const onlyDigits = (value: string) => value.replace(/\D/g, "");

export const validateProfileFields = (data: {
  name: string;
  phone: string;
  state?: string;
  municipality?: string;
  city?: string;
  states?: string[];
  municipalities?: string[];
  cities?: string[];
}) => {
  const name = data.name.trim();
  const phone = data.phone.trim();

  if (!name || !/^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u.test(name)) {
    return "Ingresa un nombre válido usando solo letras, espacios, apóstrofes o guiones.";
  }
  if (phone && !/^\+[0-9]{8,20}$/.test(phone)) {
    return "Ingresa un teléfono internacional válido.";
  }

  if (data.states && (!data.state || !data.states.includes(data.state))) {
    return "Selecciona un estado válido.";
  }
  if (data.municipalities && (!data.municipality || !data.municipalities.includes(data.municipality))) {
    return "Selecciona un municipio válido para el estado elegido.";
  }
  if (data.cities && (!data.city || !data.cities.includes(data.city))) {
    return "Selecciona una ciudad válida para el municipio elegido.";
  }

  return null;
};