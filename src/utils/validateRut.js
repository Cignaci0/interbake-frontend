export const cleanRut = (rut) => {
  return typeof rut === 'string' ? rut.replace(/\./g, "").replace(/-/g, "").toUpperCase() : "";
};

export const validateRut = (rut) => {
  if (!rut) return false;
  const clean = cleanRut(rut);
  if (clean.length < 8) return false;

  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);

  return calculateDV(body) === dv;
};

export const calculateDV = (rutBody) => {
  let sum = 0;
  let multiplier = 2;

  for (let i = rutBody.length - 1; i >= 0; i--) {
    sum += parseInt(rutBody[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const result = 11 - (sum % 11);
  if (result === 11) return '0';
  if (result === 10) return 'K';
  return result.toString();
};

export const formatRut = (rut) => {
  const clean = cleanRut(rut);
  if (clean.length <= 1) return clean;

  const dv = clean.slice(-1);
  const body = clean.slice(0, -1);

  return body.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.") + "-" + dv;
};
