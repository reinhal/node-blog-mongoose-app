const express = require('express');
const router = express.Router();

const morgan = require('morgan');
const bodyParser = require('body-parser');

const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();

app.use(morgan('common'));

app.get('/blog-posts', (req, res) => {
    res.json(BlogPosts.get());
});

let server;

function runServer() {
    const port = process.env.PORT || 8080;
    return new Promise((resolve, reject) => {
        server = app.listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve(server);
        }).on('error', err => {
            reject(err)
        });
    });
}

function closeServer() {
    return new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

if (require.main === module) {
    runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};

BlogPosts.create('Mauris Dictum Facilisis Augue', `'Donec iaculis gravida nulla. Etiam ligula pede, sagittis 
	quis, interdum ultricies, scelerisque eu. Aenean vel massa quis mauris vehicula lacinia. Mauris 
	tincidunt sem sed arcu. Mauris dictum facilisis augue. Donec iaculis gravida nulla. Cum sociis natoque 
	penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam dapibus fermentum ipsum. 
    Etiam dui sem, fermentum vitae, sagittis id, malesuada in, quam. Pellentesque arcu.'`, 'Author Three', 'April 2, 2018');

app.post('/blog-posts', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author', 'publishDate'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

const item = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.publishDate);
    res.status(201).json(item);
});

app.put('/blog-posts/:id', jsonParser, (req, res) => {
    const requiredFields = ['title', 'content', 'author', 'publishDate'];
    for (let i=0; i<requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`
            console.error(message);
            return res.status(400).send(message);
        }
    }

    if (req.params.id !== req.body.id) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match`;
        console.error(message);
        return res.status(400).send(message);
    }
    console.log(`Updating blog post \`${req.params.id}\``);
    BlogPosts.update({
        id: req.params.id,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author, 
        publishDate: req.body.publishDate
      });
      res.status(204).end();
});

app.delete('/blog-posts/:id', (req, res) => {
    BlogPosts.delete(req.params.id);
    console.log(`Deleted blog post \`${req.params.ID}\``);
    res.status(204).end();
});
