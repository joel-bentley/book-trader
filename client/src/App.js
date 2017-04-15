import React from 'react';
import Match from 'react-router/Match';
import Alert from 'react-bootstrap/lib/Alert';
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

const editProfile = data => axios.put(`${API}/profile`, data);
const postBook = book => axios.post(`${API}/book`, book);
const deleteBook = bookId => axios.put(`${API}/book/remove`, { bookId });

const postRequest = bookId => axios.post(`${API}/request`, { bookId });
const postConfirmRequest = (bookId, requesterId) =>
  axios.post(`${API}/request/confirm`, { bookId, requesterId });
const postCancelRequest = (bookId, requesterId) =>
  axios.post(`${API}/request/cancel`, { bookId, requesterId });
const postReturn = bookId => axios.post(`${API}/return`, { bookId });

const BOOK_ID_LENGTH = 5;
const BOOK_ID_CHAR = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz123456789';

const generateRandomId = (length, characters) => {
  return Array.from({ length })
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
    getProfile()
      .then(res => {
        const { userId, twitterName, fullName, location } = res.data;
        const avatar = `https://twitter.com/${twitterName}/profile_image?size=normal`;
        if (twitterName !== '') {
          this.setState({ userId, twitterName, fullName, avatar, location });
        }
      })
      .catch(err => console.error('error:', err));

    getBooks()
      .then(res => {
        const books = res.data.map(book => {
          const image = `https://covers.openlibrary.org/b/olid/${book.olid}-M.jpg`;
          return { ...book, image };
        });
        // console.dir({books})
        this.setState({ books });
      })
      .catch(err => console.error('error:', err));
  };

  showAlert = message => {
    this.setState({ alertMessage: message }, () => {
      console.log({ message });
      this.alertTimeoutId = setTimeout(
        () => this.setState({ alertMessage: '' }),
        2000
      );
    });
  };

  profileUpdate = newState => {
    const { fullName, location } = this.state;
    const currentStateCopy = { ...{ fullName, location } };
    this.setState(newState);
    editProfile(newState).catch(err => {
      //set back to previous value on error
      this.setState(
        currentStateCopy,
        this.showAlert('Error while updating profile.')
      );
      console.error('error:', err);
    });
  };

  addBook = newBook => {
    const { books } = this.state;
    const currentStateCopy = { ...{ books } };
    const moreProps = {
      bookId: generateRandomId(BOOK_ID_LENGTH, BOOK_ID_CHAR),
      owner: { userId: this.state.userId },
      requestedBy: [],
      lentTo: null,
    };
    newBook = { ...newBook, ...moreProps };

    console.log({ newBook });

    this.setState(
      { books: [...books, newBook] },
      this.showAlert(
        `"${newBook.title}" by ${newBook.author} added to 'My Books'.`
      )
    );
    postBook(newBook).catch(err => {
      //set back to previous value on error
      this.setState(
        currentStateCopy,
        this.showAlert('Error while adding book')
      );
      console.error('error:', err);
    });
  };

  removeBook = book => {
    const { books } = this.state;
    const currentStateCopy = { ...{ books } };
    this.setState(
      { books: this.state.books.filter(b => b.bookId !== book.bookId) },
      this.showAlert(`"${book.title}" by ${book.author} removed.`)
    );
    deleteBook(book.bookId).catch(err => {
      //set back to previous value on error
      this.setState(
        currentStateCopy,
        this.showAlert('Error while removing book')
      );
      console.error('error:', err);
    });
  };

  requestBook = book => {
    const { books, userId } = this.state;
    const currentStateCopy = { ...{ books } };

    // first have database confirm book is available and update database
    postRequest(book.bookId)
      .then(() => {
        const newBooks = books.map(b => {
          const userAlreadyRequested = b.requestedBy.filter(
            r => r.userId === userId
          ).length;

          if (b.bookId === book.bookId && !userAlreadyRequested) {
            b.requestedBy.push({ userId });
          }
          return b;
        });
        this.setState(
          { books: newBooks },
          this.showAlert(`"${book.title}" by ${book.author} requested.`)
        );
      })
      .catch(err => {
        //set back to previous value on error
        this.setState(
          currentStateCopy,
          this.showAlert('Error while requesting book')
        );
        console.error('error:', err);
      });
  };

  confirmRequest = book => {
    const { books } = this.state;
    const currentStateCopy = { ...{ books } };
    const requester = book.requestedBy[0];

    const newBooks = books.map(b => {
      if (
        b.bookId === book.bookId &&
        b.requestedBy.filter(r => r.userId === requester.userId).length
      ) {
        b.lentTo = requester;
        b.requestedBy = [];
      }
      return b;
    });
    this.setState(
      { books: newBooks },
      this.showAlert(`"${book.title}" by ${book.author} request confirmed.`)
    );
    postConfirmRequest(book.bookId, requester.userId).catch(err => {
      //set back to previous value on error
      this.setState(
        currentStateCopy,
        this.showAlert('Error while confirming book request.')
      );
      console.error('error:', err);
    });
  };

  cancelRequest = book => {
    const { books } = this.state;
    const currentStateCopy = { ...{ books } };

    const requesterId = book.requestedBy.length === 1
      ? book.requestedBy[0].userId
      : this.state.userId;

    const newBooks = books.map(b => {
      if (
        b.bookId === book.bookId &&
        b.requestedBy.filter(r => r.userId === requesterId).length
      ) {
        b.requestedBy = b.requestedBy.filter(r => r.userId !== requesterId);
      }
      return b;
    });
    this.setState(
      { books: newBooks },
      this.showAlert(`"${book.title}" by ${book.author} request canceled.`)
    );
    postCancelRequest(book.bookId, requesterId).catch(err => {
      //set back to previous value on error
      this.setState(
        currentStateCopy,
        this.showAlert('Error while canceling book request.')
      );
      console.error('error:', err);
    });
  };

  confirmReturn = book => {
    const { books } = this.state;
    const currentStateCopy = { ...{ books } };
    const newBooks = books.map(b => {
      if (b.bookId === book.bookId) {
        b.lentTo = null;
      }
      return b;
    });
    this.setState(
      { books: newBooks },
      this.showAlert(`"${book.title}" by ${book.author} return confirmed.`)
    );
    postReturn(book.bookId).catch(err => {
      //set back to previous value on error
      this.setState(
        currentStateCopy,
        this.showAlert('Error while confirming book return.')
      );
      console.error('error:', err);
    });
  };

  render() {
    const { router } = this.props;
    const {
      alertMessage,
      books,
      userId,
      twitterName,
      avatar,
      fullName,
      location,
    } = this.state;

    const displayName = fullName || twitterName;
    const isAuthenticated = twitterName !== '';

    const myBooks = books.filter(b => b.owner.userId === userId);
    const numRequests = myBooks.length
      ? myBooks.map(b => b.requestedBy.length).reduce((a, b) => a + b)
      : 0;

    return (
      <div className="App">
        <NavigationBar
          {...{ router, isAuthenticated, displayName, avatar, numRequests }}
        />
        <div className="container">
          {isAuthenticated &&
            <div>
              {alertMessage
                ? <Alert bsStyle="success">
                    <strong>{alertMessage}</strong>
                  </Alert>
                : <div style={{ height: '48px' }} />}
            </div>}
          <Match
            exactly
            pattern="/"
            render={() => {
              const availableBooks = books
                .filter(b => !b.lentTo)
                .filter(b => b.owner.userId !== userId);

              return (
                <div>
                  {!isAuthenticated && <Intro />}
                  {availableBooks.length === 0
                    ? <div className="text-center">
                        <br />
                        <p>
                          Sorry, no books are currently available for you to borrow.
                        </p>
                        <p>Ask your friends to join and add their books!</p>
                      </div>
                    : <div>
                        <h3>Books currently available</h3>
                        <br />
                        <BookGrid
                          books={availableBooks}
                          requestBook={this.requestBook}
                          cancelRequest={this.cancelRequest}
                          {...{ isAuthenticated, userId }}
                        />
                      </div>}
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
                b => b.requestedBy.filter(r => r.userId === userId).length
              );
              const booksBorrowed = books.filter(
                b => b.lentTo && b.lentTo.userId === userId
              );

              return (
                <div>
                  <h3>My Books (On Shelf)</h3>
                  <br />
                  {myUnlentBooks.length === 0
                    ? <div className="text-center">
                        <p>No books here</p>
                      </div>
                    : <BookGrid
                        books={myUnlentBooks}
                        removeBook={this.removeBook}
                      />}
                  <hr />
                  <h3>Books I have Borrowed</h3>
                  <br />
                  {booksBorrowed.length === 0
                    ? <div className="text-center">
                        <p>No books here</p>
                      </div>
                    : <BookGrid books={booksBorrowed} />}
                  <hr />
                  <h3>My Books (Lent Out)</h3>
                  <br />
                  {myLentBooks.length === 0
                    ? <div className="text-center">
                        <p>No books here</p>
                      </div>
                    : <BookGrid
                        books={myLentBooks}
                        confirmReturn={this.confirmReturn}
                      />}
                  <hr />
                  <h3>Books I have Requested</h3>
                  <br />
                  {requestedBooks.length === 0
                    ? <div className="text-center">
                        <p>No books here</p>
                      </div>
                    : <BookGrid
                        books={requestedBooks}
                        cancelRequest={this.cancelRequest}
                        {...{ userId }}
                      />}
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
                myBooks.filter(b => b.requestedBy.length > 0).map(b => {
                  return b.requestedBy.map(r => {
                    return { ...b, requestedBy: [r] };
                  });
                })
              );

              return (
                <div>
                  <h3>Click on books to confirm requests</h3>
                  <br />
                  {myBooksRequested.length === 0
                    ? <div className="text-center">
                        <p>No books here</p>
                      </div>
                    : <BookGrid
                        books={myBooksRequested}
                        confirmRequest={this.confirmRequest}
                        cancelRequest={this.cancelRequest}
                        {...{ userId }}
                      />}
                </div>
              );
            }}
          />
          <MatchWhenAuthorized
            pattern="/profile"
            {...{ isAuthenticated }}
            render={() => (
              <Profile
                updateProfile={this.updateProfile}
                {...{ twitterName, avatar, fullName, location }}
                profileUpdate={this.profileUpdate}
              />
            )}
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
