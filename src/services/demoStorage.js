const STORAGE_KEY = "demo_participantes";

const PREMIOS = ["Minibar", "Orden de compra", "Parlante"];

function loadParticipantes() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveParticipantes(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function generarPremioAleatorio() {
  const idx = Math.floor(Math.random() * PREMIOS.length);
  return PREMIOS[idx];
}

export async function guardarParticipante({ email, nombre, cedula, celular, aceptaTerminos, aceptaMarketing }) {
  if (!email) throw new Error("Email requerido");

  const participantes = loadParticipantes();
  const premio = generarPremioAleatorio();

  participantes[email] = {
    email,
    nombre: nombre ?? null,
    cedula: cedula ?? null,
    celular: celular ?? null,
    aceptaTerminos: !!aceptaTerminos,
    aceptaMarketing: !!aceptaMarketing,
    premio,
    estadoPremio: "pendiente",
    updatedAt: Date.now(),
    createdAt: Date.now(),
  };

  saveParticipantes(participantes);
  return { ok: true };
}

export async function obtenerPremio(email) {
  if (!email) return { premio: null, estadoPremio: null };
  const participantes = loadParticipantes();
  const p = participantes[email];
  if (!p) return { premio: null, estadoPremio: null };

  return {
    premio: p.premio ?? null,
    estadoPremio: p.estadoPremio ?? null,
  };
}

export async function revelarPremio(email) {
  if (!email) throw new Error("Email requerido para revelar premio");

  const participantes = loadParticipantes();
  if (!participantes[email]) return { ok: false };

  participantes[email].estadoPremio = "revelado";
  participantes[email].updatedAt = Date.now();
  saveParticipantes(participantes);

  return { ok: true };
}

export async function validarParticipanteExistente(email, cedula) {
  if (!email || !cedula) return { existe: false };

  const participantes = loadParticipantes();

  if (participantes[email]) return { existe: true, field: "correo" };

  const existeCedula = Object.values(participantes).some((p) => p?.cedula === cedula);
  if (existeCedula) return { existe: true, field: "cedula" };

  return { existe: false };
}
