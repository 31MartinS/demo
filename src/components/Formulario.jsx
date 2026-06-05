import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { guardarParticipante } from "../services/demoStorage";

const FIELDS = [
  { name: "nombre", label: "Nombre y apellido", type: "text", inputMode: undefined, autoComplete: "name", placeholder: "Ej: María José Pérez" },
  { name: "cedula", label: "Cedula", type: "text", inputMode: "numeric", autoComplete: "off", placeholder: "10 digitos" },
  { name: "celular", label: "Celular", type: "tel", inputMode: "numeric", autoComplete: "tel", placeholder: "09XXXXXXXX" },
  { name: "email", label: "Correo electronico", type: "email", inputMode: undefined, autoComplete: "email", placeholder: "nombre@correo.com" },
];

export default function Formulario() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: "", cedula: "", celular: "", email: "" });
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [aceptaMarketing, setAceptaMarketing] = useState(false);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Permite letras con tildes, eñe y nombres compuestos.
  const validarNombre = (v) => /^(?=.{4,}$)\p{L}+(?:[ '\-]\p{L}+)+$/u.test(v.trim());
  const validarCedula = (v) => /^\d{10}$/.test(v);
  const validarCelular = (v) => /^09\d{8}$/.test(v);
  const validarEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const getError = (name, value) => {
    if (!value) return "Requerido";
    const msgs = {
      nombre: "Ingresa nombre y apellido validos (acepta tildes)",
      cedula: "Cedula de 10 digitos",
      celular: "Formato: 09XXXXXXXX",
      email: "Correo invalido",
    };

    const validators = {
      nombre: validarNombre,
      cedula: validarCedula,
      celular: validarCelular,
      email: validarEmail,
    };

    return validators[name](value) ? "" : msgs[name];
  };

  const errors = Object.fromEntries(FIELDS.map((f) => [f.name, getError(f.name, form[f.name])]));
  const isFieldsValid = FIELDS.every((f) => !errors[f.name]);
  const isValid = isFieldsValid && aceptaTerminos;

  const onChange = (e) => {
    const { name, value } = e.target;
    const clean = name === "cedula" || name === "celular" ? value.replace(/[^\d]/g, "").slice(0, 10) : value;
    setForm((s) => ({ ...s, [name]: clean }));
  };

  const onBlur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nombre: true, cedula: true, celular: true, email: true });
    setErrorMsg("");
    if (!isValid) return;

    try {
      setLoading(true);

      const payload = {
        nombre: form.nombre.trim(),
        cedula: form.cedula.trim(),
        celular: form.celular.trim(),
        email: form.email.trim().toLowerCase(),
        aceptaTerminos,
        aceptaMarketing,
      };

      await guardarParticipante(payload);
      sessionStorage.setItem("emailParticipante", payload.email);

      setOk(true);
      setTimeout(() => navigate("/ruleta", { replace: true }), 500);
    } catch (err) {
      console.error(err);
      setErrorMsg("No se pudo registrar en modo demo.");
    } finally {
      setLoading(false);
    }
  };

  const progress = FIELDS.filter((f) => !getError(f.name, form[f.name])).length;
  const pct = Math.round((progress / FIELDS.length) * 100);

  return (
    <div className="frm-wrap">
      <div className="frm-card">
        <div className="frm-shape frm-shape-a" aria-hidden />
        <div className="frm-shape frm-shape-b" aria-hidden />

        <header className="frm-header">
          <span className="frm-badge">Demostracion</span>
          <h1 className="frm-title">Registro de Participantes</h1>
          <p className="frm-subtitle">Completa tus datos para abrir un Refrigerador sorpresa</p>
        </header>

        <div className="frm-progress-wrap" aria-label={`${pct}% completado`}>
          <div className="frm-progress-track">
            <div className="frm-progress-bar" style={{ width: `${pct}%` }} />
          </div>
          <span className="frm-progress-label">{pct}%</span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="frm-form">
          {FIELDS.map((field) => {
            const err = errors[field.name];
            const hasErr = touched[field.name] && err;

            return (
              <div key={field.name} className="frm-field">
                <label htmlFor={field.name} className="frm-label">
                  {field.label}
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  inputMode={field.inputMode}
                  autoComplete={field.autoComplete}
                  value={form[field.name]}
                  onChange={onChange}
                  onBlur={onBlur}
                  placeholder={field.placeholder}
                  className={`frm-input ${hasErr ? "frm-input--err" : ""}`}
                  aria-invalid={!!hasErr}
                />
                {hasErr && (
                  <p className="frm-error" role="alert">
                    {err}
                  </p>
                )}
              </div>
            );
          })}

          <div className="frm-terms">
            <label className="frm-terms-label">
              <input type="checkbox" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
              <span>Acepto participar en esta demostracion.</span>
            </label>

            <label className="frm-terms-label">
              <input type="checkbox" checked={aceptaMarketing} onChange={(e) => setAceptaMarketing(e.target.checked)} />
              <span>Deseo recibir novedades comerciales.</span>
            </label>
          </div>

          <button type="submit" disabled={!isValid || loading} className="frm-btn">
            {loading ? "Preparando..." : "Continuar"}
          </button>

          {errorMsg && <div className="frm-error-box">{errorMsg}</div>}
          {ok && <div className="frm-success">Registro completado. Redirigiendo...</div>}
        </form>
      </div>

      <style>{`
        .frm-wrap {
          width: 100%;
          max-width: 540px;
          padding: 0 8px;
          margin: auto;
          animation: frm-fade-in .45s ease;
        }

        .frm-card {
          position: relative;
          background: linear-gradient(170deg, #F2F2F2 0%, #E9EDF1 100%);
          border: 1px solid rgba(133, 150, 166, 0.8);
          border-radius: 20px;
          padding: clamp(20px, 4vh, 30px);
          box-shadow: 0 14px 34px rgba(5, 42, 89, 0.22);
          overflow: hidden;
        }

        .frm-shape {
          position: absolute;
          border-radius: 999px;
          filter: blur(14px);
          pointer-events: none;
        }

        .frm-shape-a {
          width: 180px;
          height: 180px;
          right: -70px;
          top: -70px;
          background: rgba(191, 132, 59, 0.25);
        }

        .frm-shape-b {
          width: 140px;
          height: 140px;
          left: -40px;
          bottom: -55px;
          background: rgba(63, 85, 115, 0.18);
        }

        .frm-header {
          text-align: center;
          margin-bottom: 18px;
          position: relative;
          z-index: 2;
        }

        .frm-badge {
          display: inline-block;
          background: linear-gradient(120deg, #BF843B, #D29D58);
          color: #F2F2F2;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .04em;
          padding: 6px 12px;
          border-radius: 999px;
          margin-bottom: 10px;
          box-shadow: 0 6px 14px rgba(191, 132, 59, 0.28);
        }

        .frm-title {
          margin: 0;
          color: #052A59;
          font-size: clamp(1.5rem, 4vw, 2rem);
        }

        .frm-subtitle {
          margin: 8px 0 0;
          color: #3F5573;
          font-size: 0.95rem;
        }

        .frm-progress-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          position: relative;
          z-index: 2;
        }

        .frm-progress-track {
          flex: 1;
          height: 7px;
          border-radius: 999px;
          background: #D8DDE3;
          overflow: hidden;
        }

        .frm-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #8596A6, #BF843B);
          transition: width .35s ease;
        }

        .frm-progress-label {
          color: #3F5573;
          font-size: 12px;
          font-weight: 700;
          min-width: 32px;
          text-align: right;
        }

        .frm-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        .frm-field {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .frm-label {
          color: #052A59;
          font-size: 0.83rem;
          font-weight: 700;
        }

        .frm-input {
          border: 1px solid #8596A6;
          border-radius: 11px;
          min-height: 42px;
          padding: 0 12px;
          color: #052A59;
          background: #FFFFFF;
          outline: none;
          transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
        }

        .frm-input::placeholder {
          color: rgba(63, 85, 115, 0.55);
        }

        .frm-input:focus {
          border-color: #BF843B;
          box-shadow: 0 0 0 3px rgba(191, 132, 59, 0.2);
          transform: translateY(-1px);
        }

        .frm-input--err {
          border-color: #BF843B;
          box-shadow: 0 0 0 3px rgba(191, 132, 59, 0.12);
        }

        .frm-error {
          color: #8F5D24;
          margin: 0;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .frm-terms {
          margin: 6px 0;
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #3F5573;
          font-size: 0.86rem;
        }

        .frm-terms-label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .frm-terms input {
          accent-color: #BF843B;
          margin-top: 2px;
        }

        .frm-btn {
          min-height: 46px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(120deg, #052A59, #3F5573);
          color: #F2F2F2;
          font-weight: 700;
          letter-spacing: .02em;
          transition: transform .2s ease, box-shadow .2s ease, filter .2s ease;
          box-shadow: 0 10px 20px rgba(5, 42, 89, 0.26);
        }

        .frm-btn:disabled {
          opacity: 0.55;
          box-shadow: none;
        }

        .frm-btn:not(:disabled):hover {
          transform: translateY(-2px);
          filter: brightness(1.05);
          box-shadow: 0 14px 24px rgba(5, 42, 89, 0.32);
        }

        .frm-error-box {
          background: rgba(191, 132, 59, 0.14);
          color: #8B5A20;
          border: 1px solid rgba(191, 132, 59, 0.4);
          border-radius: 10px;
          padding: 10px;
          font-size: 0.85rem;
          text-align: center;
        }

        .frm-success {
          background: rgba(63, 85, 115, 0.12);
          color: #052A59;
          border: 1px solid rgba(63, 85, 115, 0.35);
          border-radius: 10px;
          padding: 10px;
          font-size: 0.85rem;
          text-align: center;
          font-weight: 600;
        }

        @keyframes frm-fade-in {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
