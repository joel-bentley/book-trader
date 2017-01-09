import os
from flask import Flask
from flask import redirect, request, send_from_directory, session, url_for
from flask_oauthlib.client import OAuth
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api

app = Flask(__name__, static_folder='client/build', static_url_path='')
app.config.from_object(os.environ['APP_SETTINGS'])

api = Api(app)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True
db = SQLAlchemy(app)

# from models import User, Book


# @app.before_first_request
# def create_tables():
#     db.create_all()


oauth = OAuth()
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


class Profile(Resource):
    def get(self):

        twitter_id = session.get('twitter_id')
        twitter_name = session.get('twitter_name')
        # twitter_id = '12345'
        # twitter_name = 'JoelBentley7'
        full_name = 'Joel Bentley'
        location = { 'city': 'Ann Arbor', 'state': 'MI' }

        if twitter_id:
            return { 'userId': twitter_id,
                     'username': twitter_name,
                     'fullName': full_name,
                     'location': location,
                     'avatar':
                        'https://twitter.com/{}/profile_image?size=normal'.format(
                            twitter_name)
                   }

        return {'userId': '', 'username': '', 'fullName': '', 'location': '', 'avatar': ''}


class Books(Resource):
    def get(self):
        return [ {'title': 'A Book', 'image': 'https://placekitten.com/g/160/120'}
            for __ in range(4) ]


api.add_resource(Profile, '/api/profile')
api.add_resource(Books, '/api/books')


@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')


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
    session.pop('twitter_name', None)
    session.pop('twitter_id', None)
    session.pop('twitter_token', None)
    return redirect(url_for('home'))


if __name__ == '__main__':
    app.run()
