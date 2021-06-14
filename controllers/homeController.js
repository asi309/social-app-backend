const jwt = require('jsonwebtoken');

const Following = require('../models/Following');
const Post = require('../models/Post');

module.exports = {
  showAllPosts(req, res) {
    jwt.verify(req.token, process.env.SECRET, async (error, authData) => {
      if (!error && authData) {
        const { user } = authData;
        const currentPage = req.query.page || 1;
        const perPage = 3;
        try {
          const following_docs = await Following.find(
            {
              follower: user._id,
            },
            { following: 1 }
          );

          const following = following_docs.map((doc) => doc.following);
          following.push(user._id);

          const totalDocs = await Post.find({
            author: { $in: following },
          }).countDocuments();

          const feedPosts = await Post.find({ author: { $in: following } })
            .populate('author', '-password')
            .sort({ createdAt: -1 })
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

          if (feedPosts.length === 0) {
            return res.status(200).json({
              message: 'Nothing to show here',
              length: 0,
              totalPosts: totalDocs,
            });
          }

          return res.status(200).json({
            message: 'Found posts',
            feedPosts,
            length: perPage < totalDocs ? perPage : totalDocs,
            totalPosts: totalDocs,
          });
        } catch (error) {
          console.log(error);
          res.status(400).json({ message: 'Cannot load feed' });
        }
      } else {
        res.status(401).send();
      }
    });
  },
};
