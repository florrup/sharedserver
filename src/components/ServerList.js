import React, { Component } from 'react';

export default (props) => {
  //console.log("People are " + props.businesspeople)
  const servers = props.servers;
  const header = props.header;

  //console.log(businesspeople.length)
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
            servers.map((s) => {
              console.log(s);
              return (
                <tr key={s.username}>
                  <td><strong>{s.id}</strong></td>
                  <td><strong>{s.username}</strong></td>
                  <td>{s.password}</td>
                  <td>{s.created_by}</td>
                  <td>{s.created_time}</td>
                  <td>{s.name}</td>
                  <td>{s.last_connection}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>      
	)
}
