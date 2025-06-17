
export const esOwner = (req, res, next) => {
    if (!req.usuario) {
      return res.status(500).json({
        success: false,
        msg: 'Primero debes validar el token antes de verificar el rol'
      });
    }
  
    if (req.usuario.role !== 'OWNER_ROLE') {
      return res.status(401).json({
        success: false,
        msg: `Acceso denegado: se requiere rol OWNER_ROLE (tu rol: ${req.usuario.role})`
      });
    }
  
    next(); 
  };
  
export const esClient = (req, res, next) => {
    if (!req.usuario) {
      return res.status(500).json({
        success: false,
        msg: 'Primero debes validar el token antes de verificar el rol'
      });
    }
  
    if (req.usuario.role !== 'CLIENT_ROLE') {
      return res.status(401).json({
        success: false,
        msg: `Solo los clientes pueden agendar una cita (tu rol: ${req.usuario.role})`
      });
    }
  
    next(); 
  };
  