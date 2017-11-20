import React, { Component } from 'react';

export default (props) => {
  console.log("People are " + props.people)
  const people = props.people;
  const header = props.header;

  console.log(people.length)
	return (
    <div className="">
    <table id="simple-board">
      <tbody key="userbody">
        <tr key={header}>
          {
            header.map((h) => {
              return (
                <td key={h}><strong>{h}</strong></td>
              )
            })
          }
        </tr>
        {
          people.map((p) => {
            console.log(p)
            return (
              <tr key={p.username}>
                <td><strong>{p.id}</strong></td>
                <td><strong>{p.username}</strong></td>
                <td>{p.type}</td>
                <td>{p.firstName}</td>
                <td>{p.lastName}</td>
                <td>{p.email}</td>
                <td>{p.country}</td>
                <td>{p.birthdate}</td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
    </div>      
	)
}
