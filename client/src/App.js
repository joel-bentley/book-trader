import React from 'react'
import { Match } from 'react-router'
// import { Button } from 'react-bootstrap'
// import MatchWhenAuthorized from './components/MatchWhenAuthorized'
import axios from 'axios'

import NavigationBar from './components/NavigationBar'
import Intro from './components/Intro'
import Login from './components/Login'

const API = '/api'
const getProfile = () => axios.get(`${API}/profile`)
const getBooks = () => axios.get(`${API}/books`)

const searchBooks = text => {
  text = text.replace(/[0-9a-zA-Z$-_.+!*'(),]+/g, '+')
  return axios.get(`https://openlibrary.org/search.json?title=${text}`)
    .then(res => res.docs
      .filter(book => book.hasOwnProperty('title_suggest')
                      && book.hasOwnProperty('cover_edition_key')
                      && book.hasOwnProperty('author_name'))
      .map(book => (
      { title: book.title_suggest, author: book.author_name, olid: book.cover_edition_key}
    )))
}

class App extends React.Component {

  state = {
    userId: '',
    username: '',
    displayName: '',
    avatar: '',
    fullName: '',
    location: { city: '', state: ''},
    books: null
  }

  componentDidMount() {
    this.getData()
  }

  getData = () => {
    return axios.all([ getProfile(), getBooks() ])
      .then(res => {
        const { userId, username, avatar, fullName, location } = res[0].data
        const displayName = fullName || username
        const books = res[1].data.map(book => {
          book.image = `http://covers.openlibrary.org/b/olid/${book.olid}-M.jpg`
          return book
        })
        // console.dir({books})

        this.setState({ userId, username, displayName, avatar, location, books })
      })
      .catch(err => console.log('error:', err))
  }

  handleRequestBook = () => {

  }

  handleConfirmRequest = () => {

  }

  handleReturnBook = () => {

  }

  render() {
    const { router } = this.props
    const { books, displayName, avatar } = this.state

    const isAuthenticated = true // displayName !== ''
    const reqNumber = 0  // calculate number of requests on user's books

    return (
      <div className="App">
        <NavigationBar {...{ router, isAuthenticated, displayName, avatar, reqNumber }} />

        <div className="container">

          <Match exactly pattern="/" render={() => {
            const availableBooks = books // && books.filter(b => !b.lentTo)
            return (
              <Intro books={availableBooks}
                     handleRequestBook={this.handleRequestBook}
                     {...{isAuthenticated}} />
            )
          }}/>

          <Match pattern="/mybooks" render={() => {
            // const myBooksUnlent
            // const myBooksLent    // button to confirm book return
            // const booksBorrowed
            return (
              <Intro books={books} />
            )
          }}/>

          <Match pattern="/addbooks" render={() => {
            return (
              <Intro />
            )
          }}/>

          <Match pattern="/requests" render={() => {
            // const myBooksRequested  // button to confirm (or cancel) request
            return (
              <Intro books={books} />
            )
          }}/>


          {/* <Match pattern="/profile" render={() => (
            <Profile {...{ isAuthenticated }} />
          )}/> */}

          <Match pattern="/login" render={() => (
            <Login {...{ isAuthenticated }} />
          )}/>

        </div>
      </div>
    )
  }
}

export default App
