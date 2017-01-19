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
    # change this to read twitter_token from db
    #   or use Flask-Session
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
    city = db.Column(db.String(80))
    state = db.Column(db.String(80))


# @app.before_first_request
# def create_tables():
#     db.create_all()

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
    # twitter_id = session.get('twitter_id')
    # twitter_name = session.get('twitter_name')
    twitter_id = '948889321'
    twitter_name = 'JoelBentley7'

    # full_name and location found in Database using user_id
    full_name = 'Joel Bentley'
    location = {'city': 'Ann Arbor', 'state': 'MI'}

    if twitter_id:
        return jsonify({'userId': twitter_id,
                        'username': twitter_name,
                        'fullName': full_name,
                        'location': location,
                        'avatar':
                        'https://twitter.com/{}/profile_image?size=normal'.format(twitter_name)})

    return jsonify({'userId': '', 'username': '', 'fullName': '', 'location': '', 'avatar': ''})


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

    # change this to write twitter_token to db
    #   or use Flask-Session
    session['twitter_token'] = (
        resp['oauth_token'],
        resp['oauth_token_secret']
    )
    twitter_name = resp['screen_name']
    twitter_id = resp['user_id']

    session['twitter_name'] = twitter_name
    session['twitter_id'] = twitter_id

    # Twitter id does not change for an account,
    #   but a user can change name through Twitter.
    # user = User.query.filter_by(twitter_id=twitter_id).first()
    #
    # if user:
    #    if user.twitter_name != twitter_name:
    #        user.twitter_name = twitter_name
    #        db.session.commit()
    # else:
    #     new_user = User(twitter_id, twitter_name)
    #     db.session.add(new_user)
    #     db.session.commit()

    return redirect(next_url)


@app.route('/logout')
def logout():
    """Logout by removing session keys."""
    # Should only store user_id on session
    # Remove tokens from database here
    session.pop('twitter_name', None)
    session.pop('twitter_id', None)
    session.pop('twitter_token', None)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run()
