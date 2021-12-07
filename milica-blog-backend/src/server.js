import express from 'express';
import bodyParser from 'body-parser';
import {MongoClient} from 'mongodb';

// const articlesInfo = {
//     'learn-react': {
//         upvotes: 0,
//         comments: [],
//     },
//     'learn-node': {
//         upvotes: 0,
//         comments: [],
//     },
//     'my-thoughts-on-resumes': {
//         upvotes: 0,
//         comments: [],
//     },
// }

const app = express();

app.use(bodyParser.json());


const withDB = async (operations) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
        const db = client.db('milica-blog');

        await operations(db);

        client.close();
    } catch(error) {
            res.status(500).json({ message: 'Erorr connecting to the db', error});
        }
}

// mongodb //
app.get('/api/articles/:name', async (req, res) => {
  withDB(async (db) => {
        const articleName = req.params.name;

        const articleInfo = await db.collection('articles').findOne({ name: articleName});
        res.status(200).json(articleInfo);
  }, res);
})


    app.post('/api/articles/:name/upvote', async (req, res) => {
        withDB(async (db) => {
            const articleName = req.params.name;
        
            const articleInfo = await db.collection('articles').findOne({ name: articleName});
            await db.collection('articles').updateOne({ name: articleName }, {
                '$set': {
                    upvotes: articleInfo.upvotes +1,
        
                }
            });
            const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName});
        
            res.status(200).json(updatedArticleInfo);
        }, res);
})

app.post('/api/articles/:name/add-comment', async (req, res) => {
        const {username, text} = req.body;
        const articleName = req.params.name;
        
    withDB(async (db) => {
        const articleInfo = await db.collection('articles').findOne({ name: articleName});
        await db.collection('articles').updateOne({ name: articleName }, {
            '$set': {
                comments: articleInfo.comments.concat({ username, text}),
            },
        });
        const updatedArticleInfo = await db.collection('articles').findOne({ name: articleName});
    
        res.status(200).json(updatedArticleInfo);
    }, res);
})



// express //
// app.post('/api/articles/:name/upvote', (req, res) => {
//     const articleName = req.params.name;

//     articlesInfo[articleName].upvotes += 1;
//     res.status(200).send(`${articleName} now has ${articlesInfo[articleName].upvotes} upvotes!`);
// })

// app.post('/api/articles/:name/add-comment', (req, res) => {
//     const {username, text} = req.body;
//     const articleName = req.params.name;

//     articlesInfo[articleName].comments.push({ username, text});

//     res.status(200).send(articlesInfo[articleName]);
// })



// app.get('/hello', (req, res) => res.send('Hello'));
// app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}`));

// app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}!`));

app.listen(8000, () => console.log('Listening on port 8000'));