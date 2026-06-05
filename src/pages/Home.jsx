import Formulario from '../components/Formulario'
import environmentBg from "../assets/images/enviroment.png";

export default function Home() {
  return (
    <div className="home-page">
      <main className="home-main">
        <Formulario />
      </main>

      <style>{`
        html, body { overflow: hidden; }

        .home-page {
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(180deg, rgba(5, 42, 89, 0.72), rgba(5, 42, 89, 0.9)),
            url(${environmentBg});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .home-main {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: clamp(16px, 3vw, 32px);
          overflow-y: auto;
        }
      `}</style>
    </div>
  )
}
