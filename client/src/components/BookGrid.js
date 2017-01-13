import React from 'react'
import { Button, Glyphicon, Modal } from 'react-bootstrap'

import Masonry from 'react-masonry-component'

import './BookGrid.css'

const masonryOptions = {
    transitionDuration: 0
}

class BookGrid extends React.Component {
  state = {
    showModal: false,
    bookIndex: 0
  }

  defaultProps = {
    handleRequestBook: null,
    handleConfirmRequest: null,
    handleReturnBook: null
  }

  componentWillMount() {
    this.numBooks = this.props.books.length
  }

  closeModal = () => {
    this.setState({ showModal: false })
  }

  openModal = index => {
    this.setState({ showModal: true, bookIndex: index })
  }

  nextBook = () => {
    this.setState(prevState => {
      const currentIndex = prevState.bookIndex
      // const { numBooks } = this.state
      const nextIndex =  currentIndex < (this.numBooks - 1) ? (
        currentIndex + 1
      ) : (
        0
      )
      return { bookIndex: nextIndex }
    })
  }

  prevBook = () => {
    this.setState(prevState => {
      const currentIndex = prevState.bookIndex
      // const { numBooks } = this.state
      const nextIndex =  currentIndex > 0 ? (
        currentIndex - 1
      ) : (
        this.numBooks - 1
      )
      return { bookIndex: nextIndex }
    })
  }

  render() {
    const { books, isAuthenticated } = this.props
    const { handleRequestBook, handleConfirmRequest, handleReturnBook } = this.props
    const { showModal, bookIndex } = this.state
    const modalBook = books && books[bookIndex]

    return (
      <div>
        <Masonry options={masonryOptions}>
          {
            books.map((book, index) => (
              <div className="grid-item" onClick={() => this.openModal(index)} key={`book-${index}`}>
                <img src={book.image} role="presentation" />
              </div>
            ))
          }
        </Masonry>

        <Modal show={showModal} onHide={this.closeModal}>
          <Modal.Body>
            <h4>{modalBook.title}</h4>
            <p>{modalBook.author}</p>
            <div style={{textAlign: 'right'}}>
              <img src={modalBook.image} role="presentation" />
            </div>
            { handleRequestBook && (
              <Button onClick={handleRequestBook} bsStyle="primary">Request Book</Button>
            )}
            { handleConfirmRequest && (
              <Button onClick={handleConfirmRequest} bsStyle="primary">Confirm Request</Button>
            )}
            { handleReturnBook && (
              <Button onClick={handleReturnBook} bsStyle="primary">Return Book</Button>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.prevBook}><Glyphicon glyph="backward" aria-hidden="true" />Prev</Button>
            <Button onClick={this.nextBook}>Next&nbsp;<Glyphicon glyph="forward" aria-hidden="true" /></Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default BookGrid
