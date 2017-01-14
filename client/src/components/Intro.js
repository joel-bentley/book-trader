import React from 'react'
import { Jumbotron } from 'react-bootstrap'

const Intro = () => (
  <div>
    <Jumbotron style={{ paddingTop: '5px', paddingBottom: '30px', backgroundColor: '#eee' }}>
      <h1>Book Trader</h1>
      <h3>An app for trading books with your friends</h3>
    </Jumbotron>

    <div className="text-center">
      <h4>The books listed below are available to trade.</h4>
      <h4>Log in above to add your own books!</h4>
    </div>
    <br />
    <hr />
  </div>
)

export default Intro
