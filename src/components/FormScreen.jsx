import { useState } from 'react';
import { motion } from 'framer-motion';
import { checkExistingUser } from '../services/validationService';
import './FormScreen.css';

const FormScreen = ({ onSubmit }) => {
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    cedula: '',
    correo: '',
    aceptaPoliticas: false,
    aceptaPromociones: false
  });

  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const privacyUrl = 'https://www.electrolux.com.ec/politica-de-privacidad';

  // Validación en tiempo real de cédula (cuando pierde el foco)
  const handleCedulaBlur = async () => {
    const cedula = formData.cedula;
    
    // Primero validar formato
    const idRegex = /^[0-9]{10}$/;
    if (!idRegex.test(cedula)) {
      setErrors(prev => ({ ...prev, cedula: "La cédula debe tener 10 dígitos numéricos" }));
      return;
    }
    
    // Limpiar error de formato si existe
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.cedula;
      return newErrors;
    });
    
    // Verificar si ya está registrada
    setIsValidating(true);
    try {
      const { cedulaExiste } = await checkExistingUser({ cedula, correo: '' });
      if (cedulaExiste) {
        setErrors(prev => ({ ...prev, cedula: "Esta cédula ya está registrada en la promoción" }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.cedula;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error validando cédula:', error);
    } finally {
      setIsValidating(false);
    }
  };

  // Validación en tiempo real de email (cuando pierde el foco)
  const handleEmailBlur = async () => {
    const email = formData.correo;
    
    // Primero validar formato
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, correo: "Correo electrónico inválido" }));
      return;
    }
    
    // Limpiar error de formato si existe
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.correo;
      return newErrors;
    });
    
    // Verificar si ya está registrado
    setIsValidating(true);
    try {
      const { emailExiste } = await checkExistingUser({ cedula: '', correo: email });
      if (emailExiste) {
        setErrors(prev => ({ ...prev, correo: "Este correo ya está registrado en la promoción" }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.correo;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error validando email:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const validate = async () => {
    let tempErrors = {};
    
    // Validaciones básicas
    if (!formData.nombre.trim()) tempErrors.nombre = "El nombre es requerido";

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.celular)) tempErrors.celular = "Debe tener 10 dígitos numéricos";

    const idRegex = /^[0-9]{10}$/;
    if (!idRegex.test(formData.cedula)) {
      tempErrors.cedula = "La cédula debe tener 10 dígitos numéricos";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) {
      tempErrors.correo = "Correo electrónico inválido";
    }

    if (!formData.aceptaPoliticas) {
      tempErrors.aceptaPoliticas = "Debe aceptar la política de privacidad";
    }

    // Si hay errores de formato, mostrar inmediatamente
    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return false;
    }

    // Validar duplicados en Firestore
    setIsValidating(true);
    try {
      const { cedulaExiste, emailExiste } = await checkExistingUser({
        cedula: formData.cedula,
        correo: formData.correo
      });
      
      if (cedulaExiste) {
        tempErrors.cedula = "Esta cédula ya está registrada en la promoción";
      }
      
      if (emailExiste) {
        tempErrors.correo = "Este correo ya está registrado en la promoción";
      }
      
      if (Object.keys(tempErrors).length > 0) {
        setErrors(tempErrors);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validando duplicados:', error);
      // En caso de error de conexión, permitimos el registro pero mostramos advertencia
      setErrors({});
      return true;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = await validate();
    if (isValid) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const rawValue = type === 'checkbox' ? checked : value;
    const val =
      name === 'celular' || name === 'cedula'
        ? String(rawValue).replace(/\D/g, '').slice(0, 10)
        : rawValue;

    setFormData(prev => ({ ...prev, [name]: val }));

    // Clear error for this specific field if it's being corrected
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <motion.div
      className="form-screen"
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
      <div className="form-header">
        <img src="/assets/Electrolux.png" alt="Electrolux" className="form-logo" />
        <p className="form-subtitle">
          Conviértete en las manos del Ecuador
          <img src="https://flagcdn.com/w40/ec.png" alt="Bandera Ecuador" className="form-flag" />
        </p>
      </div>

      <form onSubmit={handleSubmit} className="form-body">
        <div className="form-card">
          <div className="input-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="form-input"
              placeholder="Ej. Juan Pérez"
              autoComplete="name"
              maxLength={80}
            />
            {errors.nombre && <span className="error-text">{errors.nombre}</span>}
          </div>

          <div className="input-group">
            <label>Celular</label>
            <input
              type="tel"
              name="celular"
              value={formData.celular}
              onChange={handleChange}
              className="form-input"
              placeholder="0991234567"
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
            />
            {errors.celular && <span className="error-text">{errors.celular}</span>}
          </div>

          <div className="input-group">
            <label>Cédula</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              onBlur={handleCedulaBlur}
              className="form-input"
              placeholder="1701234567"
              maxLength={10}
              inputMode="numeric"
              autoComplete="off"
            />
            {errors.cedula && <span className="error-text">{errors.cedula}</span>}
            {isValidating && <span className="validating-text">Verificando cédula...</span>}
          </div>

          <div className="input-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              className="form-input"
              placeholder="juan@correo.com"
              autoComplete="email"
              maxLength={120}
            />
            {errors.correo && <span className="error-text">{errors.correo}</span>}
            {isValidating && <span className="validating-text">Verificando correo...</span>}
          </div>

          <div className="checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="aceptaPoliticas"
                checked={formData.aceptaPoliticas}
                onChange={handleChange}
              />
              <div className="legal-text">
                He leído y acepto las <a href={privacyUrl} target="_blank" rel="noreferrer noopener" className="legal-link">políticas de privacidad</a>. Autorizo el tratamiento de mis datos personales para gestionar mi participación, validar mi identidad, contactarme si resulto ganador y, si marco la casilla siguiente, enviarme información promocional. Declaro que mis datos son veraces y que soy mayor de edad.
                {errors.aceptaPoliticas && <span className="error-text">{errors.aceptaPoliticas}</span>}
              </div>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                name="aceptaPromociones"
                checked={formData.aceptaPromociones}
                onChange={handleChange}
              />
              <div className="legal-text">Deseo recibir información sobre promociones, ofertas y novedades.</div>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary full-width" disabled={isValidating}>
              {isValidating ? 'Verificando...' : 'Siguiente'}
            </button>

            <p className="small-note">
              Al registrarte, aceptas los{' '}
              <button
                type="button"
                className="inline-terms-link"
                onClick={() => setShowTermsModal(true)}
              >
                Términos y Condiciones
              </button>{' '}
              de la promoción. La asignación de premios se realiza mediante un sistema de probabilidades. Promoción válida hasta agotar stock. Aplican restricciones.
            </p>

            <div className="form-footer">
              <p>&copy; {new Date().getFullYear()} Electrolux. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </form>

      {showTermsModal && (
        <div className="modal-backdrop" role="presentation" onClick={() => setShowTermsModal(false)}>
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="terms-title">Términos y condiciones</h3>
              <button type="button" className="modal-close" onClick={() => setShowTermsModal(false)} aria-label="Cerrar">
                ×
              </button>
            </div>

            <div className="modal-body">
              <p>
                Promoción válida para personas mayores de edad, residentes en Ecuador, durante la vigencia definida por la organizadora y hasta agotar stock de premios.
              </p>
              <p>
                La participación requiere datos veraces y completos. La organizadora podrá verificar la información registrada y descalificar participaciones con datos falsos, duplicados, incompletos o con indicios de fraude.
              </p>
              <p>
                El premio entregado dependerá del resultado obtenido en la dinámica. Los premios no son canjeables por dinero ni transferibles, salvo que la organizadora disponga lo contrario por escrito.
              </p>
              <p>
                La organizadora podrá modificar, suspender o cancelar la promoción por causa justificada, fuerza mayor o por razones operativas, informando por los medios que considere adecuados.
              </p>
              <p>
                Al participar, aceptas estos términos, la política de privacidad y el tratamiento de tus datos personales conforme a la normativa aplicable.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FormScreen;