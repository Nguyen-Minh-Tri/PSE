const express = require('express');
const router = express.Router();
const cors = require('cors');
const monk = require('monk');
const Filter = require('bad-words');
const rateLimit = require("express-rate-limit");
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

// Welcome Page
const app = express();

const db2 = monk('localhost/poststatus');
const posts = db2.get('posts');
const filter = new Filter();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'OK!'
    });
});

app.get('/posts', (req, res) => {
    console.log('good');
    posts
        .find()
        .then(posts => {
            res.json(posts);
        });
})

function isValidPost(post) {
    return post.title && post.title.toString().trim() !== '' &&
        post.content && post.content.toString().trim() !== '';
}

// app.use(rateLimit({
//     windowMs: 30*1000, 
//     max: 1
// }));

app.post('/posts', (req, res) => {
    if(isValidPost(req.body)) {
        //insert to db
        const post = {
            title: filter.clean(req.body.title.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
        };
        
        posts
            .insert(post)
            .then(createdPost => {
                res.json(createdPost);
            });
    } else {
        res.status(422);
        res.json({
            message: 'Hey! Title and Content are required!'
        });
    }   
})

app.put('/edit', (req, res) => {
    if(isValidPost(req.body)) {
        //insert to db
        const post = { $set: {
            title: filter.clean(req.body.title.toString()),
            content: filter.clean(req.body.content.toString()),
            created: new Date()
            }
        };
        
        posts   
            .find()

    } else {
        res.status(422);
        res.json({
            message: 'Hey! Title and Content are required!'
        });
    }
})

router.get('/profile', (req, res) => {
    res.render('profile');
  });

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/user/login');
  });
// router.get('/', forwardAuthenticated, (req, res) => location.replace("https://www.w3schools.com"));

// router.get('/user/register', forwardAuthenticated, (req, res) => res.render('register'));

module.exports = router;
