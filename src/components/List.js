import React, { Component } from 'react';

export default (props) => {
  console.log("People are " + props.people)
  const people = props.people;
	return (
    <div className="">
    {
      people.map((p) => {
        console.log(p)
      })
    }
    </div>      
	)
}
