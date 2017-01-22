import os
from flask import Flask
from flask import jsonify, redirect, request, send_from_directory, session, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_oauthlib.client import OAuth
from functools import wraps

app = Flask(__name__, static_folder='client/build', static_url_path='')
app.config.from_object(os.environ['APP_SETTINGS'])


### OAUTH ###

oauth = OAuth(app)
twitter = oauth.remote_app(name='twitter',
                           base_url='https://api.twitter.com/1/',
                           request_token_url='https://api.twitter.com/oauth/request_token',
                           access_token_url='https://api.twitter.com/oauth/access_token',
                           authorize_url='https://api.twitter.com/oauth/authenticate',
                           consumer_key=os.environ['TWITTER_KEY'],
                           consumer_secret=os.environ['TWITTER_SECRET']
                           )


@twitter.tokengetter
def get_twitter_token(token=None):
    user = User.query.filter_by(twitter_id=twitter_id).first()
    twitter_token = Token.query.filter_by(user=user, name='Twitter').first()
    return (twitter_token.oauth_token, twitter_token.oauth_token_secret)


### DATABASE ###

db = SQLAlchemy(app)

requested_by = db.Table('requested_by',
                        db.Column('user_id', db.Integer,
                                  db.ForeignKey('users.id')),
                        db.Column('book_id', db.Integer,
                                  db.ForeignKey('books.id'))
                        )


class Book(db.Model):
    __tablename__ = 'books'
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.String(10), unique=True)
    title = db.Column(db.String(80))
    subtitle = db.Column(db.String(80))
    author = db.Column(db.String(80))
    olid = db.Column(db.String(80))
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    lent_to = db.Column(db.Integer, db.ForeignKey('users.id'))
    requested_by = db.relationship('User', secondary=requested_by,
                                   backref=db.backref('books', lazy='select'))


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    twitter_id = db.Column(db.String(80), unique=True)
    twitter_name = db.Column(db.String(80))
    full_name = db.Column(db.String(80))
    location_id = db.Column(db.Integer, db.ForeignKey('locations.id'))
    location = db.relationship(
        'Location', backref=db.backref('users', uselist=False))
    tokens = db.relationship('Token', backref='user', lazy='dynamic')


class Location(db.Model):
    __tablename__ = 'locations'
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(80))
    state = db.Column(db.String(80))


class Token(db.Model):
    __tablename__ = 'tokens'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    name = db.Column(db.String(40))
    oauth_token = db.Column(db.String(120))
    oauth_token_secret = db.Column(db.String(120))


@app.before_first_request
# @app.route('/reset')
def create_tables():
    # db.drop_all()
    db.create_all()
    # If empty database
    users = User.query.all()
    books = Book.query.all()
    if not users and not books:
        from sample_data import sample_users, sample_books
        for user in sample_users:
            new_user = User(twitter_id=user['twitter_id'],
                            twitter_name=user['twitter_name'],
                            full_name=user['full_name'])
            user_location = Location(city=user['location']['city'],
                                     state=user['location']['state'])
            new_user.location = user_location
            db.session.add(new_user)
            db.session.add(user_location)
            db.session.commit()

        for book in sample_books:
            new_book = Book(book_id=book['book_id'],
                            olid=book['olid'],
                            title=book['title'],
                            subtitle=book['subtitle'],
                            author=book['author'],
                            owner_id=book['owner_id'])
            for req in book['requested_by']:
                req_user = User.query.get(req)
                new_book.requested_by.append(req_user)
            db.session.add(new_book)
            db.session.commit()

    # return jsonify({'message': 'Reset successful'})


### LOGIN DECORATOR ###

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' in session:
            return jsonify({'error': 'You must be logged in first.'})
        return f(*args, **kwargs)
    return decorated_function


### API ROUTES ###

@app.route('/api/profile', methods=['GET'])
def getProfile():
    user_id = session.get('user_id')

    if user_id:
        user = User.query.filter_by(id=user_id).first()
        return jsonify({'userId': user_id,
                        'twitterName': user.twitter_name,
                        'fullName': user.full_name,
                        'location': {'city': user.location.city,
                                     'state': user.location.state}})

    return jsonify({'userId': '', 'twitterName': '', 'fullName': '', 'location': ''})


@app.route('/api/books', methods=['GET'])
def getBooks():
    user_id = session.get('user_id')
    books = []
    for book in Book.query.all():
        if user_id:
            book_requests = [{'userId': user.id,
                              'twitterName': user.twitter_name,
                              'fullName': user.full_name,
                              'location': {'city': user.location.city,
                                           'state': user.location.state}}
                             for user in book.requested_by]
            owner = User.query.get(book.owner_id)
            owner_info = {'userId': owner.id,
                          'twitterName': owner.twitter_name,
                          'fullName': owner.full_name,
                          'location': {'city': owner.location.city,
                                       'state': owner.location.state}}
            borrower_id = book.lent_to
            if borrower_id:
                borrower = User.query.get(borrower_id)
                lent_to = {'userId': borrower.id,
                           'twitterName': borrower.twitter_name,
                           'fullName': borrower.full_name,
                           'location': {'city': borrower.location.city,
                                        'state': borrower.location.state}}
            else:
                lent_to = None
        else:
            book_requests = []
            owner_info = {'userId': 0}
            lent_to = None

        books.append({'bookId': book.book_id,
                      'title': book.title,
                      'subtitle': book.subtitle,
                      'author': book.author,
                      'olid': book.olid,
                      'owner': owner_info,
                      'lentTo': lent_to,
                      'requestedBy': book_requests})
    return jsonify(books)


@app.route('/api/profile', methods=['PUT'])
@login_required
def editProfile():
    data = request.json
    user_id = session.get('user_id')

    user = User.query.get(user_id)
    full_name = data.get('fullName')
    location = data.get('location')
    if full_name:
        user.full_name = full_name
    if location:
        user.location.city = location['city']
        user.location.state = location['state']
    db.session.commit()
    return jsonify(data)


@app.route('/api/book', methods=['POST'])
@login_required
def postBook():
    data = request.json
    user_id = session.get('user_id')

    new_book = Book(book_id=data['bookId'],
                    olid=data['olid'],
                    title=data['title'],
                    subtitle=data['subtitle'],
                    author=data['author'],
                    owner_id=user_id)
    db.session.add(new_book)
    db.session.commit()
    return jsonify(data)


@app.route('/api/book/remove', methods=['PUT'])
@login_required
def deleteBook():
    data = request.json
    user_id = session.get('user_id')
    book_id = data['bookId']

    book = Book.query.filter_by(book_id=book_id).first()
    db.session.delete(book)
    db.session.commit()
    return jsonify(data)


@app.route('/api/request', methods=['POST'])
@login_required
def postRequest():
    data = request.json
    user_id = session.get('user_id')
    book_id = data['bookId']

    user = User.query.get(user_id)
    book = Book.query.filter_by(book_id=book_id).first()

    book.requested_by.append(user)

    db.session.commit()
    return jsonify(data)


@app.route('/api/request/confirm', methods=['POST'])
@login_required
def postConfirmRequest():
    data = request.json
    user_id = session.get('user_id')

    book_id = data['bookId']
    requester_id = data['requesterId']

    book = Book.query.filter_by(book_id=book_id).first()

    if book.owner_id == user_id:
        book.requested_by = []
        book.lent_to = requester_id

    db.session.commit()
    return jsonify(data)


@app.route('/api/request/cancel', methods=['POST'])
@login_required
def postCancelRequest():
    data = request.json
    user_id = session.get('user_id')

    book_id = data['bookId']
    requester_id = data['requesterId']
    book = Book.query.filter_by(book_id=book_id).first()

    new_requested_by = [
        user for user in book.requested_by if user.id != requester_id]

    book.requested_by = new_requested_by
    db.session.commit()
    return jsonify(data)


@app.route('/api/return', methods=['POST'])
@login_required
def postReturn():
    data = request.json
    user_id = session.get('user_id')

    book_id = data['bookId']
    book = Book.query.filter_by(book_id=book_id).first()

    if book.owner_id == user_id:
        book.lent_to = None

    db.session.commit()
    return jsonify(data)


### INDEX ROUTE ###


@app.route('/')
@app.route('/mybooks')
@app.route('/addbooks')
@app.route('/requests')
@app.route('/profile')
@app.route('/login')
def home():
    """Route for html file with single page React app."""
    return send_from_directory(app.static_folder, 'index.html')


### AUTH ###

@app.route('/auth/twitter')
def twitter_auth():
    return twitter.authorize(callback=url_for('twitter_auth_callback'), next=None)

@app.route('/auth/test1')
def test1_auth():
    session['user_id'] = 1
    return redirect(url_for('home'))

@app.route('/auth/test2')
def test2_auth():
    session['user_id'] = 2
    return redirect(url_for('home'))

@app.route('/auth/twitter/callback')
def twitter_auth_callback():
    next_url = url_for('home')
    resp = twitter.authorized_response()

    if resp is None:
        print('Error: reason=%s error=%s' % (
            request.args['error_reason'],
            request.args['error_description']
        ))
        return redirect(next_url)

    twitter_name = resp['screen_name']
    twitter_id = resp['user_id']
    oauth_token = resp['oauth_token']
    oauth_token_secret = resp['oauth_token_secret']

    user = User.query.filter_by(twitter_id=twitter_id).first()

    # Twitter Name associated with Twitter Id can be changed
    if user:
        if user.twitter_name != twitter_name:
            user.twitter_name = twitter_name
            db.session.commit()
        twitter_token = Token.query.filter_by(
            user=user, name='Twitter').first()

    else:
        new_user = User(twitter_id=twitter_id, twitter_name=twitter_name)
        db.session.add(new_user)
        db.session.commit()

    user = User.query.filter_by(twitter_id=twitter_id).first()
    twitter_token = Token.query.filter_by(user=user, name='Twitter').first()
    if twitter_token:
        twitter_token.oauth_token = oauth_token
        twitter_token.oauth_token_secret = oauth_token_secret
        db.session.commit()
    else:
        twitter_token = Token(name='Twitter', oauth_token=oauth_token,
                              oauth_token_secret=oauth_token_secret, user=user)
        db.session.add(twitter_token)
        db.session.commit()

    session['user_id'] = user.id
    return redirect(next_url)


@app.route('/logout')
def logout():
    """Logout by removing session keys and all tokens from database"""
    user_id = session.get('user_id')
    user = User.query.get(user_id)
    tokens = Token.query.filter_by(user=user).all()
    for token in tokens:
        db.session.delete(token)
    db.session.commit()
    session.pop('user_id', None)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run()
