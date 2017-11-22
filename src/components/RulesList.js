import React, { Component } from 'react';

export default (props) => {
  console.log("Props are " + props)
  console.log("Rules are " + props.rules)
  console.log("Headers are " + props.header)

  var rules = props.rules;
  const header = props.header;

	return (
    <div className="rulesTable">
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
            rules.map((r) => {
              console.log(r)
              return (
                <tr key={r.id}>
                  <td><strong>{r.id}</strong></td>
                  <td><strong>{r.blob.name}</strong></td>
                  <td>{r.language}</td>
                  <td>{JSON.stringify(r.blob)}</td>
                  <td>{r.active.toString()}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>      
	)
}
