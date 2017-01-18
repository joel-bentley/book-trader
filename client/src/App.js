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

const BOOK_ID_LENGTH = 5;
const BOOK_ID_CHAR = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789';

const generateRandomId = (length, characters) => {
  return Array
    .from({ length })
    .map(() => characters[Math.floor(Math.random() * characters.length)])
    .join('');
};

const flatten = arr => {
  return arr.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
};

class App extends React.Component {
  state = {
    userId: '',
    twitterName: '',
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
        const {
          userId,
          twitterName,
          avatar,
          fullName,
          city,
          state,
        } = res[0].data;
        const displayName = fullName || twitterName;
        const books = res[1].data.map(book => {
          const image = `http://covers.openlibrary.org/b/olid/${book.olid}-M.jpg`;
          return { ...book, image };
        });
        // console.dir({books})
        this.setState({
          userId,
          twitterName,
          displayName,
          avatar,
          location: { city, state },
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
      id: generateRandomId(BOOK_ID_LENGTH, BOOK_ID_CHAR),
      owner: { id: this.state.userId },
      requestedBy: [],
      lentTo: null,
    };
    newBook = { ...newBook, ...moreProps };
    this.setState(
      { books: [ ...this.state.books, newBook ] },
      this.showAlert(
        `"${newBook.title}" by ${newBook.author} added to 'My Books'.`,
      ),
    );
  };

  removeBook = book => {
    this.setState(
      { books: this.state.books.filter(b => b.id !== book.id) },
      this.showAlert(`"${book.title}" by ${book.author} removed.`),
    );
  };

  requestBook = book => {
    // for this need to first have server database confirm book is available and update database
    const { books, userId } = this.state;
    const newBooks = books.map(b => {
      const userAlreadyRequested = b.requestedBy.filter(
        r => r.id === userId,
      ).length;

      if (b.id === book.id && !userAlreadyRequested) {
        b.requestedBy.push({ id: userId });
      }
      return b;
    });
    this.setState(
      { books: newBooks },
      this.showAlert(`"${book.title}" by ${book.author} requested.`),
    );
  };

  confirmRequest = book => {
    const { books } = this.state;
    const requester = book.requestedBy[0];

    const newBooks = books.map(b => {
      if (
        b.id === book.id &&
          b.requestedBy.filter(r => r.id === requester.id).length
      ) {
        b.lentTo = requester;
        b.requestedBy = [];
      }
      return b;
    });
    this.setState(
      { books: newBooks },
      this.showAlert(`"${book.title}" by ${book.author} request confirmed.`),
    );
  };

  cancelRequest = book => {
    const { books } = this.state;

    const requesterId = book.requestedBy.length === 1
      ? book.requestedBy[0].id
      : this.state.userId;

    const newBooks = books.map(b => {
      if (
        b.id === book.id &&
          b.requestedBy.filter(r => r.id === requesterId).length
      ) {
        b.requestedBy = b.requestedBy.filter(r => r.id !== requesterId);
      }
      return b;
    });

    this.setState(
      { books: newBooks },
      this.showAlert(`"${book.title}" by ${book.author} request canceled.`),
    );
  };

  confirmReturn = book => {
    const { books } = this.state;
    const newBooks = books.map(b => {
      if (b.id === book.id) {
        b.lentTo = null;
      }
      return b;
    });
    this.setState(
      { books: newBooks },
      this.showAlert(`"${book.title}" by ${book.author} return confirmed.`),
    );
  };

  render() {
    const { router } = this.props;
    const {
      alertMessage,
      books,
      displayName,
      userId,
      twitterName,
      avatar,
      fullName,
      location,
    } = this.state;

    const isAuthenticated = true;
    // displayName !== ''
    const myBooks = books.filter(b => b.owner.id === userId);
    const numRequests = myBooks.length ? myBooks
        .map(b => b.requestedBy.length)
        .reduce((a, b) => a + b) : 0;

    return (
      <div className="App">
        <NavigationBar
          {...{ router, isAuthenticated, displayName, avatar, numRequests }}
        />
        <div className="container">
          {isAuthenticated && (
                <div>
                  {alertMessage ? (
                        <Alert bsStyle="success">
                          <strong>{alertMessage}</strong>
                        </Alert>
                      ) : <div style={{ height: '69px' }}></div>}
                </div>
              )}
          <Match
            exactly
            pattern="/"
            render={() => {
                const availableBooks = books
                  .filter(b => !b.lentTo)
                  .filter(b => b.owner.id !== userId);

                return (
                  <div>
                    {!isAuthenticated && <Intro />}
                    {availableBooks.length === 0 ? (
                          <div className="text-center">
                            <br />
                            <p>
                              Sorry, no books are currently available for you to borrow.
                            </p>
                            <p>Ask your friends to join and add their books!</p>
                          </div>
                        ) : <BookGrid books={availableBooks} requestBook={this.requestBook} cancelRequest={this.cancelRequest} {...{ isAuthenticated, userId }} />}
                  </div>
                );
              }}
          />
          <MatchWhenAuthorized
            pattern="/mybooks"
            {...{ isAuthenticated }}
            render={() => {
                const myUnlentBooks = myBooks.filter(b => !b.lentTo);
                const myLentBooks = myBooks.filter(b => b.lentTo);
                const requestedBooks = books.filter(
                  b => b.requestedBy.filter(r => r.id === userId).length,
                );
                const booksBorrowed = books.filter(
                  b => b.lentTo && b.lentTo.id === userId,
                );

                return (
                  <div>
                    <h3>My Books (On Shelf)</h3>
                    <br />
                    {myUnlentBooks.length === 0 ? (
                          <div className="text-center">
                            <p>No books here</p>
                          </div>
                        ) : <BookGrid books={myUnlentBooks} removeBook={this.removeBook} />}
                    <hr />
                    <h3>Books I have Borrowed</h3>
                    <br />
                    {booksBorrowed.length === 0 ? (
                          <div className="text-center">
                            <p>No books here</p>
                          </div>
                        ) : <BookGrid books={booksBorrowed} />}
                    <hr />
                    <h3>My Books (Lent Out)</h3>
                    <br />
                    {myLentBooks.length === 0 ? (
                          <div className="text-center">
                            <p>No books here</p>
                          </div>
                        ) : <BookGrid books={myLentBooks} confirmReturn={this.confirmReturn} />}
                    <hr />
                    <h3>Books I have Requested</h3>
                    <br />
                    {requestedBooks.length === 0 ? (
                          <div className="text-center">
                            <p>No books here</p>
                          </div>
                        ) : <BookGrid books={requestedBooks} cancelRequest={this.cancelRequest} {...{ userId }} />}
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
                const myBooksRequested = flatten(
                  myBooks
                    .filter(b => b.requestedBy.length > 0)
                    .map(b => {
                      return b.requestedBy.map(r => {
                        return { ...b, requestedBy: [ r ] };
                      });
                    }),
                );

                return (
                  <div>
                    {myBooksRequested.length === 0 ? (
                          <div className="text-center">
                            <p>No books here</p>
                          </div>
                        ) : <BookGrid books={myBooksRequested} confirmRequest={this.confirmRequest} cancelRequest={this.cancelRequest} />}
                  </div>
                );
              }}
          />
          <MatchWhenAuthorized
            pattern="/profile"
            {...{ isAuthenticated }}
            render={
              () => (
                <Profile
                  updateProfile={this.updateProfile}
                  {...{ twitterName, avatar, fullName, location }}
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
