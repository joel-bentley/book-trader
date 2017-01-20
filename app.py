import os
from flask import Flask
from flask import jsonify, redirect, request, send_from_directory, session, url_for
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_oauthlib.client import OAuth
from functools import wraps

app = Flask(__name__, static_folder='client/build', static_url_path='')
app.config.from_object(os.environ['APP_SETTINGS'])

SESSION_TYPE = 'redis'
Session(app)


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
    return session.get('twitter_token')


### DATABASE ###

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)

#from models import User, Book

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


class Location(db.Model):
    __tablename__ = 'locations'
    id = db.Column(db.Integer, primary_key=True)
    city = db.Column(db.String(80))
    state = db.Column(db.String(80))


# @app.before_first_request
@app.route('/reset')
def create_tables():
    db.drop_all()
    db.create_all()
    # If empty database
    if True:
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

    return jsonify({'message': 'Reset successful'})


### LOGIN DECORATOR ###

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if twitter_token in session:
            return jsonify({'error': 'You must be logged in first.'})
        return f(*args, **kwargs)
    return decorated_function


### API ROUTES ###

@app.route('/api/profile', methods=['GET'])
#@login_required
def getProfile():
    # user_id = session.get('user_id')
    # twitter_id = session.get('twitter_id')
    user_id = 3
    # twitter_id = '948889321'

    # full_name and location found in Database using user_id
    # full_name = 'Joel Bentley'
    # location = {'city': 'Ann Arbor', 'state': 'MI'}

    if user_id:
        user = User.query.filter_by(id=user_id).first()
        return jsonify({'userId': user_id,
                        'twitterName': user.twitter_name,
                        'fullName': user.full_name,
                        'location': {'city': user.location.city,
                                     'state': user.location.state}})

    return jsonify({'userId': '', 'twitterName': '', 'fullName': '', 'location': ''})


@app.route('/api/books', methods=['GET'])
#@login_required
def getBooks():
    books = []
    for book in Book.query.all():
        book_requests = [{'userId': user.id,
                          'twitterName': user.twitter_name,
                          'fullName': user.full_name,
                          'location': {'city': user.location.city,
                                       'state': user.location.state}}
                         for user in book.requested_by]
        owner = User.query.get(book.owner_id)
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

        books.append({'bookId': book.book_id,
                      'title': book.title,
                      'subtitle': book.subtitle,
                      'author': book.author,
                      'olid': book.olid,
                      'owner': {'userId': owner.id,
                                'twitterName': owner.twitter_name,
                                'fullName': owner.full_name,
                                'location': {'city': owner.location.city,
                                             'state': owner.location.state}},
                      'lentTo': lent_to,
                      'requestedBy': book_requests})
    return jsonify(books)

    # {'book_id': 'bad3K',
    #              'olid': 'OL893527W',
    #              'title': 'Dune',
    #              'subtitle': '',
    #              'author': 'Frank Herbert',
    #              'owner_id': 3,
    #              'requested_by': [1]


### ROUTE ###

@app.route('/')
def home():
    """Route for html file with single page React app."""
    return send_from_directory(app.static_folder, 'index.html')


### AUTH ###

@app.route('/auth/twitter')
def twitter_auth():
    return twitter.authorize(callback=url_for('twitter_auth_callback'), next=None)


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

    session['twitter_token'] = (
        resp['oauth_token'],
        resp['oauth_token_secret']
    )
    session['twitter_name'] = twitter_name
    session['twitter_id'] = twitter_id

    user = User.query.filter_by(twitter_id=twitter_id).first()

    # Twitter Name associated with Twitter Id can be changed
    if user:
        if user.twitter_name != twitter_name:
            user.twitter_name = twitter_name
            db.session.commit()
    else:
        new_user = User(twitter_id=twitter_id, twitter_name=twitter_name)
        db.session.add(new_user)
        db.session.commit()

    user_id = User.query.filter_by(twitter_id=twitter_id).first().id
    session['user_id'] = user_id

    return redirect(next_url)


@app.route('/logout')
def logout():
    """Logout by removing session keys."""
    session.pop('twitter_token', None)
    session.pop('twitter_name', None)
    session.pop('twitter_id', None)
    session.pop('user_id', None)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run()
