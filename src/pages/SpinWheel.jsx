import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { Ticket, Speaker, Sparkles } from "lucide-react";
import { obtenerPremio, revelarPremio } from "../services/demoStorage";
import environmentBg from "../assets/images/enviroment.png";

function MetalFridgeIcon({ size = 96, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fridge-silver-body" x1="16" y1="8" x2="82" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5F7FA" />
          <stop offset="22%" stopColor="#D8DEE6" />
          <stop offset="50%" stopColor="#B8C0CA" />
          <stop offset="74%" stopColor="#E7EBF0" />
          <stop offset="100%" stopColor="#8F99A6" />
        </linearGradient>
        <linearGradient id="fridge-silver-highlight" x1="24" y1="10" x2="54" y2="84" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="fridge-silver-shadow" x1="48" y1="12" x2="48" y2="86" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6F7883" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#3B434C" stopOpacity="0.92" />
        </linearGradient>
      </defs>
      <rect x="20" y="8" width="56" height="80" rx="12" fill="url(#fridge-silver-body)" stroke="url(#fridge-silver-shadow)" strokeWidth="2" />
      <path d="M28 18H42" stroke="#FFFFFF" strokeOpacity="0.8" strokeWidth="5" strokeLinecap="round" />
      <path d="M28 54H42" stroke="#FFFFFF" strokeOpacity="0.74" strokeWidth="5" strokeLinecap="round" />
      <rect x="25" y="12" width="14" height="72" rx="7" fill="url(#fridge-silver-highlight)" opacity="0.55" />
      <rect x="57" y="16" width="6" height="28" rx="3" fill="#6C7680" />
      <rect x="57" y="56" width="6" height="22" rx="3" fill="#6C7680" />
      <path d="M57 28H76" stroke="#FFFFFF" strokeOpacity="0.32" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M57 68H76" stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const PRIZE_INFO = {
  Minibar: { icon: MetalFridgeIcon, color: "#D0D5DB" },
  "Orden de compra": { icon: Ticket, color: "#3F5573" },
  Parlante: { icon: Speaker, color: "#8596A6" },
};

function getPrizeInfo(premio) {
  const key = Object.keys(PRIZE_INFO).find((k) => k.toLowerCase() === (premio || "").toLowerCase());
  return PRIZE_INFO[key] || { icon: Sparkles, color: "#3F5573" };
}

function getRandomFakePrize(exclude) {
  const keys = Object.keys(PRIZE_INFO).filter((p) => p.toLowerCase() !== (exclude || "").toLowerCase());
  return keys[Math.floor(Math.random() * keys.length)];
}

function PremioModal({ premio, onHome }) {
  const [wSize, setWSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const { icon: PrizeIcon, color } = getPrizeInfo(premio);

  useEffect(() => {
    const handleResize = () => setWSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Premio ganado">
      <Confetti
        width={wSize.w}
        height={wSize.h}
        numberOfPieces={240}
        recycle={false}
        gravity={0.16}
        colors={["#052A59", "#3F5573", "#8596A6", "#BF843B", "#F2F2F2"]}
      />
      <div className="modal-card">
        <div className="modal-icon" style={{ color }}>
          <PrizeIcon size={66} strokeWidth={1.5} />
        </div>
        <p className="modal-eyebrow">Resultado final</p>
        <h2 className="modal-title">Ganaste:</h2>
        <p className="modal-prize">{premio}</p>
        <button className="modal-btn" onClick={onHome}>
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

export default function SpinWheel() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [premioReal, setPremioReal] = useState(null);
  const [estadoPremio, setEstadoPremio] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [opening, setOpening] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fakePrizes, setFakePrizes] = useState([]);

  const email = sessionStorage.getItem("emailParticipante");

  useEffect(() => {
    if (!email) {
      navigate("/", { replace: true });
      return;
    }

    obtenerPremio(email).then((data) => {
      if (!data || !data.premio) {
        navigate("/", { replace: true });
        return;
      }

      setPremioReal(data.premio);
      setEstadoPremio(data.estadoPremio);

      if (data.estadoPremio === "revelado") {
        setRevealed(true);
        setShowModal(true);
      }

      setLoading(false);
    });
  }, [email, navigate]);

  const handleBoxClick = async (idx) => {
    if (opening || revealed || estadoPremio === "revelado") return;

    setSelectedBox(idx);
    setOpening(true);
    await revelarPremio(email);

    const fakes = Array(4)
      .fill(null)
      .map(() => getRandomFakePrize(premioReal));
    setFakePrizes(fakes);

    setTimeout(() => {
      setRevealed(true);
      setOpening(false);
      setTimeout(() => setShowModal(true), 1500);
    }, 900);
  };

  const handleHome = () => {
    sessionStorage.removeItem("emailParticipante");
    navigate("/", { replace: true });
  };

  if (loading) {
    return (
      <div className="sp-page sp-loading">
        <div className="sp-loader" />
      </div>
    );
  }

  return (
    <div className="sp-page">
      <div className="sp-glow sp-glow-a" aria-hidden />
      <div className="sp-glow sp-glow-b" aria-hidden />

      <main className="sp-main">
        <header className="sp-header">
          <span className="sp-badge">Demostracion</span>
          <h1 className="sp-title">
            Elige tu <span className="sp-title-accent">Refrigerador</span>
          </h1>
          <p className="sp-subtitle">Selecciona uno para descubrir tu premio.</p>
        </header>

        <section className="boxes-container">
          {[0, 1, 2, 3].map((idx) => {
            const isSelected = selectedBox === idx;
            const isOther = selectedBox !== null && !isSelected;

            let IconComponent = MetalFridgeIcon;
            let iconColor = "#D0D5DB";
            let label = "";

            if (revealed) {
              if (isSelected) {
                const info = getPrizeInfo(premioReal);
                IconComponent = info.icon;
                iconColor = info.color;
                label = premioReal;
              } else {
                const fake = fakePrizes[idx];
                const info = getPrizeInfo(fake);
                IconComponent = info.icon;
                iconColor = info.color;
                label = fake;
              }
            }

            return (
              <button
                key={idx}
                className={`mystery-box ${isSelected && opening ? "box-wobble" : ""} ${revealed && isSelected ? "box-winner" : ""} ${revealed && isOther ? "box-other" : ""}`}
                onClick={() => handleBoxClick(idx)}
                disabled={opening || revealed || estadoPremio === "revelado"}
                aria-label={`Abrir refrigerador ${idx + 1}`}
              >
                <div className="box-shine" aria-hidden />
                <div className="box-inner">
                  <div className="box-icon" style={{ color: iconColor }}>
                    <IconComponent size={148} strokeWidth={1.65} />
                  </div>
                  {label ? <div className="box-label">{label}</div> : null}
                </div>
              </button>
            );
          })}
        </section>

        <p className="sp-hint" aria-live="polite">
          {opening ? "Abriendo Refrigerador..." : revealed ? "Premios revelados" : "Presiona solo un Refrigerador"}
        </p>
      </main>

      {showModal && premioReal && <PremioModal premio={premioReal} onHome={handleHome} />}

      <style>{`
        .sp-page {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(180deg, rgba(5, 42, 89, 0.72), rgba(5, 42, 89, 0.9)),
            url(${environmentBg});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          color: #F2F2F2;
          overflow: auto;
        }

        .sp-glow {
          position: fixed;
          border-radius: 999px;
          filter: blur(42px);
          pointer-events: none;
          opacity: .55;
          animation: floaty 8s ease-in-out infinite;
        }

        .sp-glow-a {
          width: 240px;
          height: 240px;
          top: -70px;
          right: -80px;
          background: rgba(191, 132, 59, 0.5);
        }

        .sp-glow-b {
          width: 200px;
          height: 200px;
          bottom: -80px;
          left: -70px;
          background: rgba(133, 150, 166, 0.42);
          animation-delay: -2s;
        }

        .sp-loading {
          display: grid;
          place-items: center;
        }

        .sp-loader {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          border: 4px solid rgba(242, 242, 242, 0.25);
          border-top-color: #F2F2F2;
          animation: spin .7s linear infinite;
        }

        .sp-main {
          min-height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 28px 16px;
          gap: 20px;
          position: relative;
          z-index: 2;
        }

        .sp-header {
          text-align: center;
          animation: rise-in .45s ease;
        }

        .sp-badge {
          background: linear-gradient(120deg, #BF843B, #D29D58);
          color: #F2F2F2;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: .04em;
          padding: 6px 12px;
          border-radius: 999px;
          box-shadow: 0 8px 18px rgba(191, 132, 59, 0.28);
        }

        .sp-title {
          margin: 10px 0 8px;
          font-size: clamp(1.6rem, 5vw, 2.2rem);
          color: #F2F2F2;
        }

        .sp-title-accent {
          color: #BF843B;
          text-shadow: 0 0 14px rgba(191, 132, 59, 0.28);
        }

        .sp-subtitle {
          margin: 0;
          color: #D8E0E8;
        }

        .boxes-container {
          width: min(980px, 100%);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 14px;
          animation: rise-in .55s ease;
        }

        .mystery-box {
          position: relative;
          background: linear-gradient(170deg, rgba(63, 85, 115, 0.94), rgba(23, 40, 60, 0.96));
          border: 1px solid rgba(242, 242, 242, 0.16);
          border-radius: 14px;
          min-height: 216px;
          color: #F2F2F2;
          transition: transform .2s ease, opacity .2s ease, box-shadow .2s ease;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(5, 42, 89, 0.28);
          backdrop-filter: blur(2px);
        }

        .box-shine {
          position: absolute;
          top: -40%;
          left: -35%;
          width: 70%;
          height: 180%;
          background: linear-gradient(120deg, transparent 0%, rgba(242, 242, 242, 0.16) 50%, transparent 100%);
          transform: rotate(16deg);
          transition: left .45s ease;
        }

        .mystery-box:hover:not(:disabled) {
          transform: translateY(-5px);
          box-shadow: 0 16px 28px rgba(5, 42, 89, 0.34);
          border-color: rgba(191, 132, 59, 0.65);
        }

        .mystery-box:hover:not(:disabled) .box-shine {
          left: 110%;
        }

        .mystery-box:disabled {
          cursor: not-allowed;
        }

        .box-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px;
          position: relative;
          z-index: 1;
        }

        .box-icon svg {
          width: 100%;
          height: auto;
          max-width: 150px;
        }

        .box-icon {
          filter: drop-shadow(0 6px 12px rgba(5, 42, 89, 0.3));
          transition: transform .2s ease;
        }

        .mystery-box:hover:not(:disabled) .box-icon {
          transform: scale(1.08);
        }

        .box-label {
          font-size: 0.86rem;
          font-weight: 700;
          text-align: center;
          color: #F2F2F2;
        }

        .box-wobble {
          animation: wobble .3s ease-in-out infinite alternate;
          border-color: rgba(191, 132, 59, 0.8);
          box-shadow: 0 0 0 1px rgba(191, 132, 59, 0.32), 0 16px 28px rgba(5, 42, 89, 0.35);
        }

        .box-winner {
          background: linear-gradient(170deg, #F2F2F2 0%, #E8EBEF 100%);
          border-color: #BF843B;
          box-shadow: 0 0 0 1px rgba(191, 132, 59, 0.5), 0 16px 30px rgba(5, 42, 89, 0.3);
        }

        .box-winner .box-label {
          color: #052A59;
        }

        .box-other {
          opacity: 0.72;
        }

        .sp-hint {
          margin: 0;
          color: #F2F2F2;
          font-weight: 600;
          font-size: 0.92rem;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 42, 89, 0.82);
          display: grid;
          place-items: center;
          padding: 16px;
          z-index: 1000;
        }

        .modal-card {
          width: min(430px, 100%);
          background: linear-gradient(170deg, rgba(242, 242, 242, 0.96) 0%, rgba(234, 239, 243, 0.98) 100%);
          border-radius: 16px;
          border: 1px solid #8596A6;
          text-align: center;
          padding: 24px;
          color: #052A59;
          box-shadow: 0 14px 40px rgba(5, 42, 89, 0.3);
          animation: rise-in .35s ease;
          backdrop-filter: blur(6px);
        }

        .modal-icon {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 0;
          margin-bottom: 8px;
        }

        .modal-icon svg {
          display: block;
        }

        .modal-eyebrow {
          color: #3F5573;
          text-transform: uppercase;
          font-size: 0.72rem;
          font-weight: 700;
          margin: 0;
          letter-spacing: .04em;
        }

        .modal-title {
          margin: 8px 0 6px;
          color: #052A59;
        }

        .modal-prize {
          margin: 0 0 18px;
          color: #BF843B;
          font-size: 1.38rem;
          font-weight: 800;
        }

        .modal-btn {
          border: none;
          border-radius: 10px;
          min-height: 42px;
          padding: 0 16px;
          background: linear-gradient(120deg, #052A59, #3F5573);
          color: #F2F2F2;
          font-weight: 700;
          transition: transform .2s ease, filter .2s ease;
        }

        .modal-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        @media (max-width: 640px) {
          .boxes-container {
            grid-template-columns: repeat(2, minmax(120px, 1fr));
            max-width: 360px;
            margin: 0 auto;
            justify-content: center;
          }

          .mystery-box {
            min-height: 192px;
          }

          .box-icon svg {
            max-width: 140px;
          }
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes wobble {
          from {
            transform: rotate(-2deg) scale(1.02);
          }
          to {
            transform: rotate(2deg) scale(1.02);
          }
        }

        @keyframes rise-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes floaty {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
