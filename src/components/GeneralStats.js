import React, { Component } from 'react';

export default (props) => {
  return (
    <section>
      <header className="major">
        <h2>Llevame! Otro desarrollo de AppMaker</h2>
      </header>
      <div className="features">
        <article>
          <span className="icon fa-diamond"></span>
          <div className="content">
            <h3>Valor</h3>
            <p>En Llevame! entendemos que el valor está en la comunidad y cuidamos a nuestros usuarios.</p>
          </div>
        </article>
        <article>
          <span className="icon fa-paper-plane"></span>
          <div className="content">
            <h3>Ligereza</h3>
            <p>Mantener ágil y simple el servicio para los usuarios.</p>
          </div>
        </article>
        <article>
          <span className="icon fa-rocket"></span>
          <div className="content">
            <h3>Rapidez</h3>
            <p>Viajar con Llevame! es rápido y eficaz.</p>
          </div>
        </article>
        <article>
          <span className="icon fa-signal"></span>
          <div className="content">
            <h3>Sustentabilidad</h3>
            <p>Llevme! se mantiene con sus propios ingresos y genera beneficios a sus inversores.</p>
          </div>
        </article>
      </div>
    </section>
  )
}