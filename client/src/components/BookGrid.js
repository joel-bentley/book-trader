import React from 'react';
import Button from 'react-bootstrap/lib/Button';
import Col from 'react-bootstrap/lib/Col';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import Modal from 'react-bootstrap/lib/Modal';
import Masonry from 'react-masonry-component';

import UserInfo from './UserInfo';

import './BookGrid.css';

class BookGrid extends React.Component {
  state = { showModal: false, bookIndex: 0 };

  defaultProps = {
    isAuthenticated: false,
    userId: '',
    addBook: null,
    removeBook: null,
    requestBook: null,
    confirmRequest: null,
    cancelRequest: null,
    confirmReturn: null,
  };

  componentWillMount() {
    this.numBooks = this.props.books.length;
  }

  closeModal = callback => {
    this.setState({ showModal: false });
    if (typeof callback === 'function') {
      callback();
    }
  };

  openModal = index => {
    this.setState({ showModal: true, bookIndex: index });
  };

  nextBook = () => {
    this.setState(prevState => {
      const currentIndex = prevState.bookIndex;
      const nextIndex = currentIndex < this.numBooks - 1 ? currentIndex + 1 : 0;
      return { bookIndex: nextIndex };
    });
  };

  prevBook = () => {
    this.setState(prevState => {
      const currentIndex = prevState.bookIndex;
      const nextIndex = currentIndex > 0 ? currentIndex - 1 : this.numBooks - 1;
      return { bookIndex: nextIndex };
    });
  };

  render() {
    const { books, isAuthenticated, userId } = this.props;
    const {
      addBook,
      removeBook,
      requestBook,
      confirmRequest,
      cancelRequest,
      confirmReturn,
    } = this.props;
    const { showModal, bookIndex } = this.state;

    const numBooks = books.length;
    const modalBook = books[bookIndex];

    const userIsRequester =
      modalBook.hasOwnProperty('requestedBy') &&
      modalBook.requestedBy.filter(r => r.userId === userId).length;

    return (
      <div>
        <Col xsOffset={1} smOffset={0}>
          <Masonry options={{ transitionDuration: 0 }}>
            {books.map((book, index) => (
              <div
                className="grid-item"
                onClick={() => this.openModal(index)}
                key={`book-${index}`}
              >
                <img src={book.image} role="presentation" />
              </div>
            ))}
          </Masonry>
        </Col>
        <Modal show={showModal} onHide={this.closeModal}>
          <Modal.Body bsStyle="modal-body">
            <div style={{ float: 'right' }}>
              <img src={modalBook.image} role="presentation" />
            </div>
            <h4>{modalBook.title}</h4>
            <h5>{modalBook.subtitle}</h5>
            <p>{modalBook.author}</p>
            <br />
            {addBook && (
              <div>
                <Button onClick={() => addBook(modalBook)} bsStyle="primary">
                  Add Book
                </Button>
              </div>
            )}
            {removeBook && (
              <div>
                <Button onClick={() => removeBook(modalBook)} bsStyle="primary">
                  Remove Book
                </Button>
              </div>
            )}
            {confirmRequest && (
              <div>
                <UserInfo
                  message={'Requested by'}
                  user={modalBook.requestedBy[0]}
                />
                <Button
                  onClick={() =>
                    this.closeModal(() => confirmRequest(modalBook))}
                  bsStyle="primary"
                >
                  Confirm Request
                </Button>
              </div>
            )}
            {confirmReturn && (
              <div>
                <UserInfo message={'Returned by'} user={modalBook.lentTo} />
                <Button
                  onClick={() =>
                    this.closeModal(() => confirmReturn(modalBook))}
                  bsStyle="primary"
                >
                  Confirm Book Return
                </Button>
              </div>
            )}
            {requestBook &&
              (isAuthenticated ? (
                <div>
                  <UserInfo message={'Owned by'} user={modalBook.owner} />
                  {userIsRequester ? (
                    <Button disabled bsStyle="primary">
                      You have requested this book
                    </Button>
                  ) : (
                    <Button
                      onClick={() =>
                        this.closeModal(() => requestBook(modalBook))}
                      bsStyle="primary"
                    >
                      Request Book
                    </Button>
                  )}
                </div>
              ) : (
                <Button disabled bsStyle="primary">
                  Log in to Request Book
                </Button>
              ))}
            {cancelRequest && (
              <div>
                {!requestBook && userIsRequester ? (
                  <UserInfo message={'Owned by'} user={modalBook.owner} />
                ) : (
                  <div style={{ height: '7px' }} />
                )}
                {!requestBook || userIsRequester ? (
                  <Button
                    onClick={() =>
                      this.closeModal(() => cancelRequest(modalBook))}
                    bsStyle="primary"
                  >
                    Cancel Request
                  </Button>
                ) : (
                  <div />
                )}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={this.prevBook}
              bsStyle="success"
              disabled={numBooks === 1}
            >
              <Glyphicon glyph="backward" aria-hidden="true" />Prev
            </Button>
            <Button
              onClick={this.nextBook}
              bsStyle="success"
              disabled={numBooks === 1}
            >
              Next <Glyphicon glyph="forward" aria-hidden="true" />
            </Button>
            <Button onClick={this.closeModal}>
              <Glyphicon glyph="remove" aria-hidden="true" />Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

export default BookGrid;
