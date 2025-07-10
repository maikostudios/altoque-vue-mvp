/**
 * Utilidades de validación de documentos de identidad para Cloud Functions
 * Basado en el servicio idValidationService.js del frontend
 */

// Configuración de países y sus formatos de ID
const COUNTRY_ID_CONFIG = {
  'CL': {
    name: 'Chile',
    idName: 'RUT',
    format: 'XX.XXX.XXX-X',
    validator: 'validateChileanRut',
    hasStrongValidation: true
  },
  'AR': {
    name: 'Argentina',
    idName: 'DNI',
    format: 'XX.XXX.XXX',
    validator: 'validateArgentinianDni',
    hasStrongValidation: false
  },
  'PE': {
    name: 'Perú',
    idName: 'DNI',
    format: 'XXXXXXXX',
    validator: 'validatePeruvianDni',
    hasStrongValidation: false
  },
  'CO': {
    name: 'Colombia',
    idName: 'Cédula',
    format: 'X.XXX.XXX.XXX',
    validator: 'validateColombianCedula',
    hasStrongValidation: false
  },
  'VE': {
    name: 'Venezuela',
    idName: 'Cédula',
    format: 'V-XXXXXXXX',
    validator: 'validateVenezuelanCedula',
    hasStrongValidation: false
  },
  'EC': {
    name: 'Ecuador',
    idName: 'Cédula',
    format: 'XXXXXXXXXX',
    validator: 'validateEcuadorianCedula',
    hasStrongValidation: false
  },
  'BO': {
    name: 'Bolivia',
    idName: 'Carnet de Identidad',
    format: 'XXXXXXX',
    validator: 'validateBolivianCI',
    hasStrongValidation: false
  },
  'UY': {
    name: 'Uruguay',
    idName: 'Cédula',
    format: 'X.XXX.XXX-X',
    validator: 'validateUruguayanCedula',
    hasStrongValidation: false
  },
  'PY': {
    name: 'Paraguay',
    idName: 'Cédula',
    format: 'X.XXX.XXX',
    validator: 'validateParaguayanCedula',
    hasStrongValidation: false
  },
  'OTHER': {
    name: 'Otro País',
    idName: 'Documento de Identidad',
    format: 'Formato libre',
    validator: 'validateGenericId',
    hasStrongValidation: false
  }
};

/**
 * Valida un RUT chileno con dígito verificador
 * @param {string} rut - RUT a validar
 * @returns {boolean} true si es válido
 */
function validateChileanRut(rut) {
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
 */
function validateArgentinianDni(dni) {
  if (!dni) return false;
  const cleanDni = dni.replace(/[^0-9]/g, '');
  return cleanDni.length >= 7 && cleanDni.length <= 8 && /^\d+$/.test(cleanDni);
}

/**
 * Valida un DNI peruano (básico)
 */
function validatePeruvianDni(dni) {
  if (!dni) return false;
  const cleanDni = dni.replace(/[^0-9]/g, '');
  return cleanDni.length === 8 && /^\d+$/.test(cleanDni);
}

/**
 * Valida una cédula colombiana (básico)
 */
function validateColombianCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9]/g, '');
  return cleanCedula.length >= 6 && cleanCedula.length <= 10 && /^\d+$/.test(cleanCedula);
}

/**
 * Valida una cédula venezolana (básico)
 */
function validateVenezuelanCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9VvEe]/g, '').toUpperCase();
  return /^[VE]\d{6,8}$/.test(cleanCedula) || /^\d{6,8}$/.test(cleanCedula);
}

/**
 * Valida una cédula ecuatoriana (básico)
 */
function validateEcuadorianCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9]/g, '');
  return cleanCedula.length === 10 && /^\d+$/.test(cleanCedula);
}

/**
 * Valida un carnet de identidad boliviano (básico)
 */
function validateBolivianCI(ci) {
  if (!ci) return false;
  const cleanCI = ci.replace(/[^0-9]/g, '');
  return cleanCI.length >= 6 && cleanCI.length <= 8 && /^\d+$/.test(cleanCI);
}

/**
 * Valida una cédula uruguaya (básico)
 */
function validateUruguayanCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9]/g, '');
  return cleanCedula.length >= 6 && cleanCedula.length <= 8 && /^\d+$/.test(cleanCedula);
}

/**
 * Valida una cédula paraguaya (básico)
 */
function validateParaguayanCedula(cedula) {
  if (!cedula) return false;
  const cleanCedula = cedula.replace(/[^0-9]/g, '');
  return cleanCedula.length >= 6 && cleanCedula.length <= 8 && /^\d+$/.test(cleanCedula);
}

/**
 * Validación genérica para otros países
 */
function validateGenericId(id) {
  return !!(id && id.trim().length >= 3);
}

/**
 * Valida un ID según el país
 * @param {string} id - ID a validar
 * @param {string} countryCode - Código del país
 * @returns {boolean} true si es válido
 */
function validateId(id, countryCode = 'CL') {
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
 * Determina el estado de verificación automática basado en país y validez del documento
 * @param {string} countryCode - Código del país
 * @param {string} documentId - Documento de identidad
 * @returns {string} Estado de verificación: 'auto_approved', 'pending', 'not_started'
 */
function determineVerificationStatus(countryCode, documentId) {
  // Si no hay país o documento, requiere verificación manual
  if (!countryCode || !documentId) {
    return 'pending';
  }

  // Validar el documento según el país
  const isValidDocument = validateId(documentId, countryCode);
  
  if (isValidDocument) {
    // Documento válido = auto-aprobado
    return 'auto_approved';
  } else {
    // Documento inválido = requiere verificación manual
    return 'pending';
  }
}

/**
 * Obtiene la configuración de ID para un país
 * @param {string} countryCode - Código del país
 * @returns {object} Configuración del ID
 */
function getIdConfig(countryCode = 'CL') {
  return COUNTRY_ID_CONFIG[countryCode] || COUNTRY_ID_CONFIG['OTHER'];
}

module.exports = {
  validateId,
  validateChileanRut,
  determineVerificationStatus,
  getIdConfig,
  COUNTRY_ID_CONFIG
};
