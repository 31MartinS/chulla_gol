import { useState } from 'react';
import { motion } from 'framer-motion';

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
      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', marginTop: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.2rem' }}>CHULLA GOL</h1>
        <p style={{ color: 'var(--color-accent-teal)' }}>¡Juega y Gana!</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, fontSize: '0.9rem' }}>Nombre Completo</label>
          <input 
            type="text" 
            name="nombre" 
            value={formData.nombre} 
            onChange={handleChange}
            style={inputStyle}
            placeholder="Ej. Juan Pérez"
          />
          {errors.nombre && <span style={errorStyle}>{errors.nombre}</span>}
        </div>

        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, fontSize: '0.9rem' }}>Celular</label>
          <input 
            type="tel" 
            name="celular" 
            value={formData.celular} 
            onChange={handleChange}
            style={inputStyle}
            placeholder="0991234567"
            maxLength={10}
          />
          {errors.celular && <span style={errorStyle}>{errors.celular}</span>}
        </div>

        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, fontSize: '0.9rem' }}>Cédula</label>
          <input 
            type="text" 
            name="cedula" 
            value={formData.cedula} 
            onChange={handleChange}
            style={inputStyle}
            placeholder="1701234567"
            maxLength={10}
          />
          {errors.cedula && <span style={errorStyle}>{errors.cedula}</span>}
        </div>

        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.2rem', fontWeight: 600, fontSize: '0.9rem' }}>Correo Electrónico</label>
          <input 
            type="email" 
            name="correo" 
            value={formData.correo} 
            onChange={handleChange}
            style={inputStyle}
            placeholder="juan@correo.com"
          />
          {errors.correo && <span style={errorStyle}>{errors.correo}</span>}
        </div>

        {/* Checkboxes Legales */}
        <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.75rem', lineHeight: 1.4, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="aceptaPoliticas"
              checked={formData.aceptaPoliticas}
              onChange={handleChange}
              style={{ marginTop: '2px', flexShrink: 0 }}
            />
            <div>
              He leído y acepto la Política de Privacidad y autorizo de forma expresa a la empresa organizadora a tratar mis datos personales (nombre, cédula, teléfono y correo electrónico) con la finalidad de gestionar mi participación en la promoción, contactarme en caso de resultar ganador y enviarme información comercial, promocional y publicitaria. Declaro que los datos proporcionados son verídicos y que soy mayor de edad. Asimismo, entiendo que puedo ejercer mis derechos de acceso, rectificación, eliminación y oposición al tratamiento de mis datos personales conforme a la normativa vigente en Ecuador.
              {errors.aceptaPoliticas && <span style={errorStyle}>{errors.aceptaPoliticas}</span>}
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.75rem', lineHeight: 1.4, cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              name="aceptaPromociones"
              checked={formData.aceptaPromociones}
              onChange={handleChange}
              style={{ marginTop: '2px', flexShrink: 0 }}
            />
            Deseo recibir información sobre promociones, ofertas y novedades.
          </label>

        </div>

        <div style={{ marginTop: '1rem', marginBottom: '2rem' }}>
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Siguiente
          </button>
          
          <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.6)', textAlign: 'justify', marginTop: '1.5rem', lineHeight: 1.4 }}>
            Al registrarte, aceptas los Términos y Condiciones de la promoción. La asignación de premios se realiza mediante un sistema de probabilidades. Promoción válida hasta agotar stock. Aplican restricciones.
          </p>
        </div>
      </form>
    </motion.div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid var(--color-accent-teal)',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  color: 'var(--color-white)',
  fontSize: '0.95rem',
  outline: 'none',
  fontFamily: 'inherit'
};

const errorStyle = {
  color: 'var(--color-red)',
  fontSize: '0.8rem',
  marginTop: '0.2rem',
  display: 'block'
};

export default FormScreen;
