import React from 'react'
import { Match } from 'react-router'
import MatchWhenAuthorized from './components/MatchWhenAuthorized'
import axios from 'axios'

import NavigationBar from './components/NavigationBar'
import Intro from './components/Intro'
import BookGrid from './components/BookGrid'
import Profile from './components/Profile'
import Login from './components/Login'


const API = '/api'
const getProfile = () => axios.get(`${API}/profile`)
const getBooks = () => axios.get(`${API}/books`)

const searchBooks = text => {
  text = text.replace(/[0-9a-zA-Z$-_.+!*'(),]+/g, '+')
  return axios.get(`https://openlibrary.org/search.json?title=${text}`)
    .then(res => res.docs
      .filter(book => 'title_suggest' in book
                      && 'author_name' in book
                      && 'cover_edition_key' in book)
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
    books: []
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

  profileUpdate = newState => {
    this.setState(newState)
    // Add server access to update profile in database
  }

  addBook = () => {

  }

  removeBook = () => {

  }

  requestBook = () => {

  }

  confirmRequest = () => {

  }

  cancelRequest = () => {

  }

  confirmReturn = () => {

  }

  render() {
    const { router } = this.props
    const { books, displayName, userId, username, avatar, fullName, location } = this.state

    const isAuthenticated = true // displayName !== ''
    const reqNumber = 0  // calculate number of requests on user's books

    return (
      <div className="App">
        <NavigationBar {...{ router, isAuthenticated, displayName, avatar, reqNumber }} />

        <div className="container">


          <Match exactly pattern="/" render={() => {
            const availableBooks = books.filter(b => !b.lentTo)
                                        .filter(b => b.owner.id !== userId)

            if (availableBooks.length === 0) {
              return (
                <div className="text-center">
                  <br /><br />
                  <p>Sorry, no books are currently available for you to borrow.</p>
                  <p>Ask your friends to join and add their books!</p>
                </div>
              )
            }
            return (
              <div>
                { !isAuthenticated && (
                  <Intro />
                )}
                <BookGrid books={availableBooks} 
                          requestBook={this.requestBook}
                          {...{isAuthenticated}} />
              </div>
            )
          }}/>


          <MatchWhenAuthorized pattern="/mybooks" {...{isAuthenticated}} render={() => {
            const myBooks = books.filter(b => b.owner.id === userId)
            const myUnlentBooks = myBooks.filter(b => !b.lentTo)
            const myLentBooks = myBooks.filter(b => b.lentTo)
            const booksBorrowed = books.filter(b => b.lentTo === userId)

            return (
              <div>
                <h3>My Books (On Shelf)</h3>
                <br />
                { myUnlentBooks.length === 0 ? (
                  <div className="text-center">
                    <p>No books here</p>
                  </div>
                ) : (
                  <BookGrid books={myUnlentBooks} removeBooks={this.removeBook} />
                )}
                <hr />
                <h3>My Books (Lent Out)</h3>
                <br />
                { myLentBooks.length === 0 ? (
                  <div className="text-center">
                    <p>No books here</p>
                  </div>
                ) : (
                  <BookGrid books={myLentBooks} confirmReturn={this.confirmReturn} />
                )}
                <hr />
                <h3>Borrowed Books</h3>
                <br />
                { booksBorrowed.length === 0 ? (
                  <div className="text-center">
                    <p>No books here</p>
                  </div>
                ) : (
                  <BookGrid books={booksBorrowed} />
                )}
              </div>
            )
          }}/>


          <MatchWhenAuthorized pattern="/addbooks" {...{isAuthenticated}} render={() => {
            return (
              <div></div>
            )
          }}/>


          <MatchWhenAuthorized pattern="/requests" {...{isAuthenticated}} render={() => {
            // const myBooksRequested  // button to confirm (or cancel) request
            return (
              <div></div>
            )
          }}/>


          <MatchWhenAuthorized pattern="/profile" {...{isAuthenticated}} render={() => (
            <Profile updateProfile={this.updateProfile}
              {...{ username, avatar, fullName, location }} profileUpdate={this.profileUpdate} />
          )} />


          <Match pattern="/login" render={() => (
            <Login {...{ isAuthenticated }} />
          )}/>

        </div>
      </div>
    )
  }
}

export default App
