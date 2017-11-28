import React, { Component } from 'react';

export default (props) => {
  var isLoggedIn = (localStorage.getItem('isLoggedIn') == 'true');
  var link;
  var linkName;
  var welcome;
  if (isLoggedIn) {
    link = "/logout";
    linkName = "Logout";
    welcome = "Bienvenido, " + localStorage.getItem('username');
  } else {
    link = "/login";
    linkName = "Login";
    welcome = ""
  }
	return (
    <nav id="menu">
      <header className="major">
        <h2>Menú</h2>
      </header>
      <h3>{welcome}</h3>
      <ul>
        <li><a href="/">Homepage</a></li>
        <li>
          <span className="opener">Gestión de Usuarios</span>
          <ul>
            <li><a href="/businessusers">Usuarios de Negocio</a></li>
            <li><a href="/users">Usuarios de Aplicación</a></li>
          </ul>
        </li>
        <li><a href="/appservers">Application Servers</a></li>
        <li><a href="#">Reportes y Estadísticas</a></li>
        <li><a href="/rules">Reglas de Negocio</a></li>
        <li><a href="/trips">Viajes</a></li>
        <br/><br/>
        <li><a href={link}>{linkName}</a></li>
      </ul>
    </nav>
	)
}