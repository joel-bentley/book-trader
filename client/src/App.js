import React from 'react';
import { Match } from 'react-router';
import { Alert } from 'react-bootstrap';
import MatchWhenAuthorized from './components/MatchWhenAuthorized';
import axios from 'axios';

import NavigationBar from './components/NavigationBar';
import Intro from './components/Intro';
import BookGrid from './components/BookGrid';
import Profile from './components/Profile';
import Login from './components/Login';
import AddBooks from './components/AddBooks';

const API = '/api';
const getProfile = () => axios.get(`${API}/profile`);
const getBooks = () => axios.get(`${API}/books`);

class App extends React.Component {
  state = {
    userId: '',
    username: '',
    displayName: '',
    avatar: '',
    fullName: '',
    location: { city: '', state: '' },
    books: [],
    alertMessage: '',
  };

  componentDidMount() {
    this.getData();
  }

  componentWillUnmount() {
    clearTimeout(this.alertTimeoutId);
  }

  getData = () => {
    return axios
      .all([ getProfile(), getBooks() ])
      .then(res => {
        const { userId, username, avatar, fullName, location } = res[0].data;
        const displayName = fullName || username;
        const books = res[1].data.map(book => {
          const image = `http://covers.openlibrary.org/b/olid/${book.olid}-M.jpg`;
          return { ...book, image };
        });
        // console.dir({books})
        this.setState({
          userId,
          username,
          displayName,
          avatar,
          location,
          books,
        });
      })
      .catch(err => console.log('error:', err));
  };

  profileUpdate = newState => {
    this.setState(newState);
  };

  showAlert = message => {
    this.setState({ alertMessage: message }, () => {
      console.log({ message });
      this.alertTimeoutId = setTimeout(
        () => this.setState({ alertMessage: '' }),
        5000,
      );
    });
  };

  addBook = newBook => {
    const moreProps = {
      owner: { id: this.state.userId },
      requestedBy: '',
      lentTo: '',
    };
    newBook = { ...newBook, ...moreProps };
    this.setState(
      { books: [ ...this.state.books, newBook ] },
      this.showAlert(newBook.title + ' added.'),
    );
  };

  removeBook = book => {
    this.setState({
      books: this.state.books.filter(b => b.olid !== book.olid),
    });
  };

  requestBook = book => {};

  confirmRequest = () => {};

  cancelRequest = () => {};

  confirmReturn = () => {};

  render() {
    const { router } = this.props;
    const {
      alertMessage,
      books,
      displayName,
      userId,
      username,
      avatar,
      fullName,
      location,
    } = this.state;

    const isAuthenticated = true;
    // displayName !== ''
    const reqNumber = 0;
    // calculate number of requests on user's books
    return (
      <div className="App">
        <NavigationBar
          {...{ router, isAuthenticated, displayName, avatar, reqNumber }}
        />
        <div className="container">
          {alertMessage && (
                <Alert bsStyle="success">
                  <strong>{alertMessage}</strong>
                </Alert>
              )}
          <Match
            exactly
            pattern="/"
            render={() => {
                const availableBooks = books
                  .filter(b => !b.lentTo)
                  .filter(b => b.owner.id !== userId);

                if (availableBooks.length === 0) {
                  return (
                    <div className="text-center">
                      <br /><br />
                      <p>
                        Sorry, no books are currently available for you to borrow.
                      </p>
                      <p>Ask your friends to join and add their books!</p>
                    </div>
                  );
                }
                return (
                  <div>
                    {!isAuthenticated && <Intro />}
                    <BookGrid
                      books={availableBooks}
                      requestBook={this.requestBook}
                      {...{ isAuthenticated }}
                    />
                  </div>
                );
              }}
          />
          <MatchWhenAuthorized
            pattern="/mybooks"
            {...{ isAuthenticated }}
            render={() => {
                const myBooks = books.filter(b => b.owner.id === userId);
                const myUnlentBooks = myBooks.filter(b => !b.lentTo);
                const myLentBooks = myBooks.filter(b => b.lentTo);
                const requestedBooks = books.filter(
                  b => b.requestedBy === userId,
                );
                const booksBorrowed = books.filter(b => b.lentTo === userId);

                return (
                  <div>
                    <h3>My Books (On Shelf)</h3>
                    <br />
                    {myUnlentBooks.length === 0 ? (
                          <div className="text-center">
                            <p>No books here</p>
                          </div>
                        ) : <BookGrid books={myUnlentBooks} removeBooks={this.removeBook} />}
                    <hr />
                    <h3>My Books (Lent Out)</h3>
                    <br />
                    {myLentBooks.length === 0 ? (
                          <div className="text-center">
                            <p>No books here</p>
                          </div>
                        ) : <BookGrid books={myLentBooks} confirmReturn={this.confirmReturn} />}
                    <hr />
                    <h3>Requested Books</h3>
                    <br />
                    {requestedBooks.length === 0 ? (
                          <div className="text-center">
                            <p>No books here</p>
                          </div>
                        ) : <BookGrid books={requestedBooks} cancelRequest={this.cancelRequest} />}
                    <hr />
                    <h3>Borrowed Books</h3>
                    <br />
                    {booksBorrowed.length === 0 ? (
                          <div className="text-center">
                            <p>No books here</p>
                          </div>
                        ) : <BookGrid books={booksBorrowed} />}
                  </div>
                );
              }}
          />
          <MatchWhenAuthorized
            pattern="/addbooks"
            {...{ isAuthenticated }}
            render={() => {
                return <AddBooks addBook={this.addBook} />;
              }}
          />
          <MatchWhenAuthorized
            pattern="/requests"
            {...{ isAuthenticated }}
            render={() => {
                // const myBooksRequested  // button to confirm (or cancel) request
                return <div></div>;
              }}
          />
          <MatchWhenAuthorized
            pattern="/profile"
            {...{ isAuthenticated }}
            render={
              () => (
                <Profile
                  updateProfile={this.updateProfile}
                  {...{ username, avatar, fullName, location }}
                  profileUpdate={this.profileUpdate}
                />
              )
            }
          />
          <Match
            pattern="/login"
            render={() => <Login {...{ isAuthenticated }} />}
          />
        </div>
      </div>
    );
  }
}

export default App;
