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
                                  db.ForeignKey('user.id')),
                        db.Column('book_id', db.Integer,
                                  db.ForeignKey('book.id'))
                        )


class Book(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    book_id = db.Column(db.String(10))
    title = db.Column(db.String(80))
    subtitle = db.Column(db.String(80))
    author = db.Column(db.String(80))
    olid = db.Column(db.String(80))
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    lent_to = db.Column(db.Integer, db.ForeignKey('user.id'))
    requested_by = db.relationship('User', secondary=requested_by,
                                   backref=db.backref('books', lazy='select'))


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    twitter_id = db.Column(db.String(80), unique=True)
    twitter_name = db.Column(db.String(80))
    full_name = db.Column(db.String(80))
    location_id = db.Column(db.Integer, db.ForeignKey('location.id'))
    location = db.relationship(
        'Location', backref=db.backref('user', uselist=False))


class Location(db.Model):
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
            new_user = User(id=user['id'],
                            twitter_id=user['twitter_id'],
                            twitter_name=user['twitter_name'],
                            full_name=user['full_name'])
            new_location = Location(city=user['location']['city'],
                                    state=user['location']['state'])
            new_user.location = new_location
            db.session.add(new_user)
            db.session.commit()
            db.session.add(new_location)
            db.session.commit()

        # for book in sample_books:
        #     new_book = Book(book_id=book['book_id'],
        #                     olid=book['olid'],
        #                     title=book['title'],
        #                     subtitle=book['subtitle'],
        #                     author=book['author'],
        #                     owner_id=book['owner_id'])
        #     new_request = requested_by=book['requested_by']
        #     db.session.add(new_book)
        #     db.session.commit()

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
    twitter_id = session.get('twitter_id')
    # twitter_name = session.get('twitter_name')
    # twitter_id = '948889321'
    # twitter_name = 'JoelBentley7'

    # full_name and location found in Database using user_id
    full_name = 'Joel Bentley'
    location = {'city': 'Ann Arbor', 'state': 'MI'}

    if twitter_id:
        return jsonify({'userId': user_id,
                        'twitterName': twitter_name,
                        'fullName': full_name,
                        'location': location})

    return jsonify({'userId': '', 'twitterName': '', 'fullName': '', 'location': ''})


@app.route('/api/books', methods=['GET'])
#@login_required
def getBooks():
    from sample_data import sample_data
    # owner info found in database from owner['id']

    return jsonify(sample_data)


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

    return redirect(next_url)


@app.route('/logout')
def logout():
    """Logout by removing session keys."""
    session.pop('twitter_token', None)
    session.pop('twitter_name', None)
    session.pop('twitter_id', None)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run()
