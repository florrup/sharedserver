import React, { Component } from 'react';

export default (props) => {
  console.log("Props are " + props);
  console.log("Rules are " + props.rulechanges);
  console.log("Headers are " + props.header);

  var ruleChanges = props.rulechanges;
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
            ruleChanges.map((r, counter) => {
              console.log(r)
              return (
                <tr key={r.rule.id + 1}>
                  <td><strong>{r.rule.id}</strong></td>
                  <td><strong>{r.rule.blob.name}</strong></td>
                  <td>{JSON.stringify(r.rule.blob)}</td>
                  <td>{r.rule.active.toString()}</td>
                  <td>{r.reason}</td>
                  <td>{r.rule.lastCommit}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>      
	)
}
