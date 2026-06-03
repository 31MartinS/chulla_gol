import { useState } from 'react';
import { motion } from 'framer-motion';
import './FormScreen.css';

const FormScreen = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    cedula: '',
    correo: '',
    aceptaPoliticas: false,
    aceptaPromociones: false
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let tempErrors = {};
    if (!formData.nombre.trim()) tempErrors.nombre = "El nombre es requerido";

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.celular)) tempErrors.celular = "Debe tener 10 dígitos numéricos";

    const idRegex = /^[0-9]{10}$/;
    if (!idRegex.test(formData.cedula)) tempErrors.cedula = "La cédula debe tener 10 dígitos numéricos";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.correo)) tempErrors.correo = "Correo electrónico inválido";

    if (!formData.aceptaPoliticas) tempErrors.aceptaPoliticas = "Debe aceptar la política de privacidad";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

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
              className="form-input"
              placeholder="1701234567"
              maxLength={10}
            />
            {errors.cedula && <span className="error-text">{errors.cedula}</span>}
          </div>

          <div className="input-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              className="form-input"
              placeholder="juan@correo.com"
            />
            {errors.correo && <span className="error-text">{errors.correo}</span>}
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
                He leído y acepto la Política de Privacidad y autorizo de forma expresa a la empresa organizadora a tratar mis datos personales (nombre, cédula, teléfono y correo electrónico) con la finalidad de gestionar mi participación en la promoción, contactarme en caso de resultar ganador y enviarme información comercial, promocional y publicitaria. Declaro que los datos proporcionados son verídicos y que soy mayor de edad. Asimismo, entiendo que puedo ejercer mis derechos de acceso, rectificación, eliminación y oposición al tratamiento de mis datos personales conforme a la normativa vigente en Ecuador.
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
            <button type="submit" className="btn-primary full-width">
              Siguiente
            </button>

            <p className="small-note">
              Al registrarte, aceptas los Términos y Condiciones de la promoción. La asignación de premios se realiza mediante un sistema de probabilidades. Promoción válida hasta agotar stock. Aplican restricciones.
            </p>

            <div className="form-footer">
              <p>&copy; {new Date().getFullYear()} Electrolux. Todos los derechos reservados.</p>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
};



export default FormScreen;
