import React from 'react'
import { Link, Match, Redirect } from 'react-router'
// import { Button } from 'react-bootstrap'
// import MatchWhenAuthorized from './components/MatchWhenAuthorized'
import axios from 'axios'

import NavigationBar from './components/NavigationBar'
import Intro from './components/Intro'
import Login from './components/Login'

const API = '/api'
const getProfile = () => axios.get(`${API}/profile`)
const getBooks = () => axios.get(`${API}/books`)

class App extends React.Component {

  state = {
    userId: '',
    username: '',
    displayName: '',
    avatar: '',
    fullName: '',
    location: { city: '', state: ''},
    books: []
}

getData = () => {
  return axios.all([ getProfile(), getBooks() ])
    .then(res => {
      const { userId, username, avatar, fullName, location } = res[0].data
      const displayName = fullName || username
      const books = res[1].data
      // console.dir({books})

      this.setState({ userId, username, displayName, avatar, location, books })
    })
    .catch(err => console.log('error:', err))
  }

  componentDidMount() {
    this.getData()
  }

  render() {
    const { router } = this.props
    const { books, displayName, avatar } = this.state
    const isAuthenticated = displayName !== ''

    return (
      <div className="App">
        <NavigationBar {...{ router, isAuthenticated, displayName, avatar }} />

        <div className="container">

          <Match exactly pattern="/" render={() => (
            <Intro {...{ books }} />
          )}/>

          <Match pattern="/login" render={() => (
            <Login {...{ isAuthenticated }} />
          )}/>

        </div>
      </div>
    )
  }
}

export default App
