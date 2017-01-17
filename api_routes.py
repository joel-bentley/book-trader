from flask_restful import Resource


class Profile(Resource):
    """ REST route /api/profile """

    def get(self):
        """GET /api/profile - Request current user profile."""
        # twitter_id = session.get('twitter_id')
        # twitter_name = session.get('twitter_name')
        twitter_id = '948889321'
        twitter_name = 'JoelBentley7'

        # full_name and location found in Database using user_id
        full_name = 'Joel Bentley'
        location = {'city': 'Ann Arbor', 'state': 'MI'}

        if twitter_id:
            return {'userId': twitter_id,
                    'username': twitter_name,
                    'fullName': full_name,
                    'location': location,
                    'avatar':
                    'https://twitter.com/{}/profile_image?size=normal'.format(twitter_name)}

        return {'userId': '', 'username': '', 'fullName': '', 'location': '', 'avatar': ''}


class Books(Resource):
    """ REST route /api/books """

    def get(self):
        """GET /api/books - Request book listing."""
        # owner info found in database from owner['id']
        user_id1 = '000'
        username1 = 'Tester'
        user_id2 = '948889321'
        username2 = 'JoelBentley7'
        location = {'city': 'Ann Arbor', 'state': 'MI'}

        return [{'id': 'QGhkQ',
                 'olid': 'OL22549594M',
                 'title': 'The Hunger Games',
                 'subtitle': '',
                 'author': 'Suzanne Collins',
                 'owner': {'id': user_id1, 'username': username1, 'location': location},
                 'requestedBy': [],
                 'lentTo': None},
                {'id': 'bbd2j',
                 'olid': 'OL7318410M',
                 'title': 'KAFKA ON THE SHORE',
                 'subtitle': '',
                 'author': 'Murakami Haruki',
                 'owner': {'id': user_id1, 'username': username1, 'location': location},
                 'requestedBy': [],
                 'lentTo': None},
                {'id': 'QGhkr',
                 'olid': 'OL22549594M',
                 'title': 'The Hunger Games',
                 'subtitle': '',
                 'author': 'Suzanne Collins',
                 'owner': {'id': user_id2, 'username': username2, 'location': location},
                 'requestedBy': [{'id': '000'}, {'id': '111'}, {'id': '222'}],
                 'lentTo': None},
                {'id': 'bbd2K',
                 'olid': 'OL7318410M',
                 'title': 'KAFKA ON THE SHORE',
                 'subtitle': '',
                 'author': 'Murakami Haruki',
                 'owner': {'id': user_id2, 'username': username2, 'location': location},
                 'requestedBy': [{'id': '000'}],
                 'lentTo': None},
                {'id': '4n7Vz',
                 'olid': 'OL16159793M',
                 'title': 'The Name of the Wind',
                 'subtitle': '',
                 'author': 'Patrick Rothfuss',
                 'owner': {'id': user_id2, 'username': username2, 'location': location},
                 'requestedBy': [],
                 'lentTo': None}]

from app import db
