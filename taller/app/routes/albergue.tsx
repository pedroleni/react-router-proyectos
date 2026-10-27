export default function Albergue() {
  return (
    <main className="pagina">
      <title>El albergue | El Cea</title>
      <header className="cabecera-pagina">
        <p className="sobrelinea">Hospitalidad sencilla</p>
        <h1>El albergue</h1>
        <p>Un lugar ficticio inspirado en la tradición hospitalera del Camino de Santiago.</p>
      </header>
      <div className="rejilla-albergue">
        <section>
          <h2>Horarios</h2>
          <p>Recepción de 13:00 a 20:30. Silencio desde las 22:00. Salida antes de las 8:00.</p>
        </section>
        <section>
          <h2>Precio</h2>
          <p>12 € por persona y noche. Con desayuno sencillo, 15 €.</p>
        </section>
        <section>
          <h2>Normas</h2>
          <p>Hace falta credencial de peregrino. No se fuma y no se admiten animales en los dormitorios.</p>
        </section>
        <section>
          <h2>Temporada</h2>
          <p>Abrimos del 1 de marzo al 31 de octubre. Cerramos el resto del año.</p>
        </section>
      </div>
    </main>
  )
}
