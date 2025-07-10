/**
 * Servicio de Validación de Identificadores
 * Implementa validación de RUT chileno y IDs internacionales
 * Parte del plan de implementación "De Una Transferencias"
 */

// Configuración de países y sus formatos de ID
const COUNTRY_ID_CONFIG = {
  'CL': {
    name: 'Chile',
    idName: 'RUT',
    format: 'XX.XXX.XXX-X',
    placeholder: '12.345.678-9',
    validator: 'validateChileanRut'
  },
  'AR': {
    name: 'Argentina',
    idName: 'DNI',
    format: 'XX.XXX.XXX',
    placeholder: '12.345.678',
    validator: 'validateArgentinianDni'
  },
  'PE': {
    name: 'Perú',
    idName: 'DNI',
    format: 'XXXXXXXX',
    placeholder: '12345678',
    validator: 'validatePeruvianDni'
  },
  'CO': {
    name: 'Colombia',
    idName: 'Cédula',
    format: 'X.XXX.XXX.XXX',
    placeholder: '1.234.567.890',
    validator: 'validateColombianCedula'
  },
  'VE': {
    name: 'Venezuela',
    idName: 'Cédula',
    format: 'V-XXXXXXXX',
    placeholder: 'V-12345678',
    validator: 'validateVenezuelanCedula'
  },
  'EC': {
    name: 'Ecuador',
    idName: 'Cédula',
    format: 'XXXXXXXXXX',
    placeholder: '1234567890',
    validator: 'validateEcuadorianCedula'
  },
  'BO': {
    name: 'Bolivia',
    idName: 'Carnet de Identidad',
    format: 'XXXXXXX',
    placeholder: '1234567',
    validator: 'validateBolivianCI'
  },
  'UY': {
    name: 'Uruguay',
    idName: 'Cédula',
    format: 'X.XXX.XXX-X',
    placeholder: '1.234.567-8',
    validator: 'validateUruguayanCedula'
  },
  'PY': {
    name: 'Paraguay',
    idName: 'Cédula',
    format: 'X.XXX.XXX',
    placeholder: '1.234.567',
    validator: 'validateParaguayanCedula'
  },
  'OTHER': {
    name: 'Otro País',
    idName: 'Documento de Identidad',
    format: 'Formato libre',
    placeholder: 'Ingresa tu documento',
    validator: 'validateGenericId'
  }
};

/**
 * Formatea un ID para mostrar según el país
 * @param {string} id - ID sin formato
 * @param {string} countryCode - Código del país (CL, AR, etc.)
 * @returns {string} ID formateado
 */
export function formatIdForDisplay(id, countryCode = 'CL') {
  if (!id) return '';
  
  const config = COUNTRY_ID_CONFIG[countryCode] || COUNTRY_ID_CONFIG['OTHER'];
  const cleanId = id.replace(/[^0-9kK]/g, '');
  
  switch (countryCode) {
    case 'CL':
      return formatChileanRut(cleanId);
    case 'AR':
      return formatArgentinianDni(cleanId);
    case 'CO':
      return formatColombianCedula(cleanId);
    case 'UY':
      return formatUruguayanCedula(cleanId);
    default:
      return cleanId;
  }
}

/**
 * Valida un RUT chileno
 * @param {string} rut - RUT a validar
 * @returns {boolean} true si es válido
 */
export function validateChileanRut(rut) {
  if (!rut) return false;
  
  // Limpiar el RUT
  const cleanRut = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (cleanRut.length < 2) return false;
  
  const body = cleanRut.slice(0, -1);
  const dv = cleanRut.slice(-1);
  
  // Validar que el cuerpo sean solo números
  if (!/^\d+$/.test(body)) return false;
  
  // Calcular dígito verificador
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const remainder = sum % 11;
  const calculatedDv = remainder === 0 ? '0' : remainder === 1 ? 'K' : (11 - remainder).toString();
  
  return dv === calculatedDv;
}

/**
 * Valida un DNI argentino (básico)
 * @param {string} dni - DNI a validar
 * @returns {boolean} true si es válido
 */
export function validateArgentinianDni(dni) {
  if (!dni) return false;
  const cleanDni = dni.replace(/[^0-9]/g, '');
  return cleanDni.length >= 7 && cleanDni.length <= 8 && /^\d+$/.test(cleanDni);
}

/**
 * Valida un DNI peruano (básico)
 * @param {string} dni - DNI a validar
 * @returns {boolean} true si es válido
 */
export function validatePeruvianDni(dni) {
  if (!dni) return false;
  const cleanDni = dni.replace(/[^0-9]/g, '');
  return cleanDni.length === 8 && /^\d+$/.test(cleanDni);
}

/**
 * Valida una cédula colombiana (básico)
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} true si es válido
 */
export function validateColombianCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9]/g, '');
  return cleanCedula.length >= 6 && cleanCedula.length <= 10 && /^\d+$/.test(cleanCedula);
}

/**
 * Valida una cédula venezolana (básico)
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} true si es válido
 */
export function validateVenezuelanCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9VvEe]/g, '').toUpperCase();
  return /^[VE]\d{6,8}$/.test(cleanCedula) || /^\d{6,8}$/.test(cleanCedula);
}

/**
 * Valida una cédula ecuatoriana (básico)
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} true si es válido
 */
export function validateEcuadorianCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9]/g, '');
  return cleanCedula.length === 10 && /^\d+$/.test(cleanCedula);
}

/**
 * Valida un carnet de identidad boliviano (básico)
 * @param {string} ci - CI a validar
 * @returns {boolean} true si es válido
 */
export function validateBolivianCI(ci) {
  if (!ci) return false;
  const cleanCI = ci.replace(/[^0-9]/g, '');
  return cleanCI.length >= 6 && cleanCI.length <= 8 && /^\d+$/.test(cleanCI);
}

/**
 * Valida una cédula uruguaya (básico)
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} true si es válido
 */
export function validateUruguayanCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9]/g, '');
  return cleanCedula.length >= 6 && cleanCedula.length <= 8 && /^\d+$/.test(cleanCedula);
}

/**
 * Valida una cédula paraguaya (básico)
 * @param {string} cedula - Cédula a validar
 * @returns {boolean} true si es válido
 */
export function validateParaguayanCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9]/g, '');
  return cleanCedula.length >= 6 && cleanCedula.length <= 8 && /^\d+$/.test(cleanCedula);
}

/**
 * Validación genérica para otros países
 * @param {string} id - ID a validar
 * @returns {boolean} true si no está vacío
 */
export function validateGenericId(id) {
  return !!(id && id.trim().length >= 3);
}

/**
 * Formatea un RUT chileno
 * @param {string} rut - RUT limpio
 * @returns {string} RUT formateado
 */
function formatChileanRut(rut) {
  if (rut.length <= 1) return rut;
  
  const body = rut.slice(0, -1);
  const dv = rut.slice(-1);
  
  // Formatear con puntos
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
}

/**
 * Formatea un DNI argentino
 * @param {string} dni - DNI limpio
 * @returns {string} DNI formateado
 */
function formatArgentinianDni(dni) {
  if (dni.length <= 3) return dni;
  return dni.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formatea una cédula colombiana
 * @param {string} cedula - Cédula limpia
 * @returns {string} Cédula formateada
 */
function formatColombianCedula(cedula) {
  if (cedula.length <= 3) return cedula;
  return cedula.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Formatea una cédula uruguaya
 * @param {string} cedula - Cédula limpia
 * @returns {string} Cédula formateada
 */
function formatUruguayanCedula(cedula) {
  if (cedula.length <= 1) return cedula;
  
  const body = cedula.slice(0, -1);
  const dv = cedula.slice(-1);
  
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return `${formattedBody}-${dv}`;
}

/**
 * Valida un ID según el país
 * @param {string} id - ID a validar
 * @param {string} countryCode - Código del país
 * @returns {boolean} true si es válido
 */
export function validateId(id, countryCode = 'CL') {
  if (!id) return false;
  
  const config = COUNTRY_ID_CONFIG[countryCode] || COUNTRY_ID_CONFIG['OTHER'];
  const validatorName = config.validator;
  
  switch (validatorName) {
    case 'validateChileanRut':
      return validateChileanRut(id);
    case 'validateArgentinianDni':
      return validateArgentinianDni(id);
    case 'validatePeruvianDni':
      return validatePeruvianDni(id);
    case 'validateColombianCedula':
      return validateColombianCedula(id);
    case 'validateVenezuelanCedula':
      return validateVenezuelanCedula(id);
    case 'validateEcuadorianCedula':
      return validateEcuadorianCedula(id);
    case 'validateBolivianCI':
      return validateBolivianCI(id);
    case 'validateUruguayanCedula':
      return validateUruguayanCedula(id);
    case 'validateParaguayanCedula':
      return validateParaguayanCedula(id);
    default:
      return validateGenericId(id);
  }
}

/**
 * Obtiene la configuración de ID para un país
 * @param {string} countryCode - Código del país
 * @returns {object} Configuración del ID
 */
export function getIdConfig(countryCode = 'CL') {
  return COUNTRY_ID_CONFIG[countryCode] || COUNTRY_ID_CONFIG['OTHER'];
}

/**
 * Obtiene la lista de países soportados
 * @returns {array} Lista de países con sus configuraciones
 */
export function getSupportedCountries() {
  return Object.entries(COUNTRY_ID_CONFIG)
    .filter(([code]) => code !== 'OTHER')
    .map(([code, config]) => ({
      code,
      name: config.name,
      idName: config.idName,
      format: config.format
    }));
}

// Exportar configuración para uso externo
export { COUNTRY_ID_CONFIG };

// Exportar como servicio principal
export default {
  formatIdForDisplay,
  validateId,
  validateChileanRut,
  getIdConfig,
  getSupportedCountries,
  COUNTRY_ID_CONFIG
};
