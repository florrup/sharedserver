import React, { Component } from 'react';

export default (props) => {
	return (
        <section id="banner">
          <div className="content">
            <header>
              <h1>{props.title}</h1>
              <p>{props.subtitle}</p>
            </header>
            <p>{props.content}</p>
			{/* (this is a comment un JSX from React)
			Original button was here:
			---------------------------------------------------------
			*/}
          </div>
        </section>
	)
}

/*
This was the original button:
---------------------------------------------------------
<ul className="actions">
  <li><a href="#" className="button big">Inicio</a></li>
</ul>
---------------------------------------------------------
*/