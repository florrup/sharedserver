import React, { Component } from 'react';

export default (props) => {
  //console.log("People are " + props.businesspeople)
  const businesspeople = props.businesspeople;
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
          businesspeople.map((p) => {
            console.log(p)
            return (
              <tr key={p.username}>
                <td><strong>{p.id}</strong></td>
                <td><strong>{p.username}</strong></td>
                <td>{p.password}</td>
                <td>{p.name}</td>
                <td>{p.surname}</td>
                <td>{
                  p.roles.map((r) => {
                    console.log(r)
                    return (
                      <div key={r}>
                        {r}
                      </div>
                    )
                  })
                }</td>
              </tr>
            )
          })
        }
      </tbody>
    </table>
    </div>      
	)
}
