import React from 'react'
import { Button, Glyphicon, Modal } from 'react-bootstrap'

import Masonry from 'react-masonry-component'

import './BookGrid.css'


class BookGrid extends React.Component {
  state = {
    showModal: false,
    bookIndex: 0
  }

  defaultProps = {
    requestBook: null,
    confirmRequest: null,
    returnBook: null
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
    const { requestBook, confirmRequest, returnBook } = this.props
    const { showModal, bookIndex } = this.state
    const modalBook = books && books[bookIndex]

    return (
      <div>
        <Masonry options={{ transitionDuration: 0 }}>
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
            <br />
            <div>
              { requestBook && (
                <Button onClick={requestBook} bsStyle="primary">Request Book</Button>
              )}
              { confirmRequest && (
                <Button onClick={confirmRequest} bsStyle="primary">Confirm Request</Button>
              )}
              { returnBook && (
                <Button onClick={returnBook} bsStyle="primary">Return Book</Button>
              )}
            </div>
            <div style={{textAlign: 'right'}}>
              <img src={modalBook.image} role="presentation" />
            </div>
          </Modal.Body>
          
          <Modal.Footer>
            <Button onClick={this.prevBook} bsStyle="success"><Glyphicon glyph="backward" aria-hidden="true" />Prev</Button>
            <Button onClick={this.nextBook} bsStyle="success">Next&nbsp;<Glyphicon glyph="forward" aria-hidden="true" /></Button>
            &nbsp;
            <Button onClick={this.closeModal}><Glyphicon glyph="remove" aria-hidden="true" />Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default BookGrid
