import Formulario from '../components/Formulario'

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
          background: #052A59;
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
