import React from 'react';
import { Button, Glyphicon, Modal } from 'react-bootstrap';

import Masonry from 'react-masonry-component';

import './BookGrid.css';

class BookGrid extends React.Component {
  state = { showModal: false, bookIndex: 0 };

  defaultProps = {
    isAuthenticated: false,
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

  componentWillReceiveProps() {
    this.closeModal();
  }

  closeModal = () => {
    this.setState({ showModal: false });
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
    const { books, isAuthenticated } = this.props;
    const {
      addBook,
      removeBook,
      requestBook,
      confirmRequest,
      cancelRequest,
      confirmReturn,
    } = this.props;
    const { showModal, bookIndex } = this.state;
    const modalBook = books && books[bookIndex];

    return (
      <div>
        <Masonry options={{ transitionDuration: 0 }}>
          {books.map(
              (book, index) => (
                <div
                  className="grid-item"
                  onClick={() => this.openModal(index)}
                  key={`book-${book.id}`}
                >
                  <img src={book.image} role="presentation" />
                </div>
              ),
            )}
        </Masonry>
        <Modal show={showModal} onHide={this.closeModal}>
          <Modal.Body>
            <h4>{modalBook.title}</h4>
            <h5>{modalBook.subtitle}</h5>
            <p>{modalBook.author}</p>
            <br />
            {addBook && (
                  <Button onClick={() => addBook(modalBook)} bsStyle="primary">
                    Add Book
                  </Button>
                )}
            {removeBook && (
                  <Button
                    onClick={() => removeBook(modalBook)}
                    bsStyle="primary"
                  >
                    Remove Book
                  </Button>
                )}
            {confirmRequest && (
                  <Button
                    onClick={() => confirmRequest(modalBook)}
                    bsStyle="primary"
                  >
                    Confirm Request
                  </Button>
                )}
            {cancelRequest && (
                  <Button
                    onClick={() => cancelRequest(modalBook)}
                    bsStyle="primary"
                  >
                    Cancel Request
                  </Button>
                )}
            {confirmReturn && (
                  <Button
                    onClick={() => confirmReturn(modalBook)}
                    bsStyle="primary"
                  >
                    Confirm Book Return
                  </Button>
                )}
            {requestBook && (isAuthenticated ? (
                    <Button
                      onClick={() => requestBook(modalBook)}
                      bsStyle="primary"
                    >
                      Request Book
                    </Button>
                  ) : (
                    <Button disabled bsStyle="primary">
                      Log in to Request Book
                    </Button>
                  ))}
            <div style={{ textAlign: 'right' }}>
              <img src={modalBook.image} role="presentation" />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.prevBook} bsStyle="success">
              <Glyphicon glyph="backward" aria-hidden="true" />Prev
            </Button>
            <Button onClick={this.nextBook} bsStyle="success">
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
