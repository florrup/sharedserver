import React, { Component } from 'react';

export default (props) => {
  console.log("Props are " + props)
  console.log("Rules are " + props.trips)
  console.log("Headers are " + props.header)

  var trips = props.trips;
  const header = props.header;

	return (
    <div className="tripsTable">
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
            trips.map((t) => {
              console.log(t)
              return (
                <tr key={t.id}>
                  <td><strong>{t.id}</strong></td>
                  <td>{t.driver}</td>
                  <td>{t.passenger}</td>
                  <td>{t.totalTime}</td>
                  <td>{t.distance}</td>
                  <td>{t.costCurrency}</td>
                  <td>{t.costValue}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>      
	)
}
