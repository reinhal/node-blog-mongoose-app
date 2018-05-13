const express = require('express');
const router = express.Router();

const morgan = require('morgan');
const bodyParser = require('body-parser');

const {PORT, DATABASE_URL} = require('./config');
const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

app.use(morgan('common'));
app.use(express.json());

app.get('/blog-posts', (req, res) => {
    BlogPosts
    .find()
    .then(posts => {
        res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({error: 'Internal server error'});
    });
});

app.get('/blog-posts/:id', (req, res) => {
    BlogPosts
    .findById(req.params.id)
    .then(post => res.json(post.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal server error'});
    });
});

app.post('/blog-posts', (req, res) => {
    const requiredFields = ['title', 'content', 'author'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\`in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }
    BlogPosts
    .create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    })
    .then(blogPosts => res.status(201).json(blogPosts.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'There is an error'})
    });
});

app.delete('/blog-posts/:id', (req, res) => {
    BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(() => {
        res.status(204).json({message: 'Success!!'});
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'There is an error'});
    });
});

app.delete('/:id', (req, res) => {
    BlogPosts
    .findByIdAndRemove(req.params.id)
    .then(() => {
        console.log(`Deleted blog post with id \`${req.params.id}\``);
        res.status(204).end();
    });
});

app.use('*', function(req, res) {
    res.status(404).json({ message: 'Not Found'});
});

let server;

function runServer(databaseUrl, port=PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(databaseUrl, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(port, () => {
                console.log(`Your app is listening on port ${port}`);
                resolve();
            })
            .on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log('Closing server');
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};