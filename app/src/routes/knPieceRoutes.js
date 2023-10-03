const express = require('express');
const router = express.Router();
const KnPiece = require('../models/knPiece');
const passport = require('passport');

router.get('/create', passport.authenticate('user-jwt-auth', { session:false }), async(req, res) => {
  let { content, tags } = req.query;

  if(!content || !tags) {
    return res.status(400).json('Please send content and tags to add a kn piece');
  }

  if(!req.knBase) {
    return res.status(400).json("Please connect to a kb first")
  }

  let kbCode = req.knBase.code

  tags = tags.split(';').map(el => el.trim());

  const knPiece = new KnPiece({content, tags, kbCode, isDeleted:false, createdBy: req.user._id });
  await knPiece.save({validateBeforeSave: false });

  return res.status(201).json({
    message: 'kn piece added',
    knPiece,
  });
});

router.get('/search', passport.authenticate('user-jwt-auth', { session:false }), async function(req, res) {
  let { q } = req.query;

  if(!q) {
    return res.status(400).json('Please send a query');
  }

  if(!req.knBase) {
    return res.status(400).json("Please connect to a kb first")
  }

  let kbCode = req.knBase.code

  q = q.replaceAll(';', '|')
  qAnd = q.split('^')

  let tagsCondition = qAnd.map(function(el) { return {tags: {"$regex": RegExp(el,"i") }} } )
  let result
  try {
    result = await KnPiece.find( {$and: tagsCondition, kbCode, isDeleted: false }).exec();
  } catch(e) {
    result = []
  }

  return res.status(200).json({
    result
  });
});

router.get('/update', passport.authenticate('user-jwt-auth', { session:false }), async(req, res) => {
  let { id, content, tags, isDeleted } = req.query;

  if(!id) {
    return res.status(400).json('Please send an id');
  }

  if(!req.knBase) {
    return res.status(400).json("Please connect to a kb first")
  }

  let kbCode = req.knBase.code

  let update = {}

  if(content) {
    update.content = content
  }

  if(tags) {
    update.tags = tags.split(';').map(el => el.trim());
  }

  if(isDeleted) {
    update.isDeleted = isDeleted == 0 ? false : true
  }

  update.updatedBy = req.user._id

  let existsInKb = await KnPiece.findOne({ _id: id, kbCode, isDeleted: false }).exec();
  if(!existsInKb) {
    return res.status(403).json('kn piece does not exist in kb');
  }

  let result = await KnPiece.findByIdAndUpdate(id, update).exec();

  return res.status(200).json({
    result
  });
});

router.get('/delete', passport.authenticate('user-jwt-auth', { session:false }), async(req, res) => {
  let { ids } = req.query;

  if(!ids) {
    return res.status(400).json('Please send one or more ids to delete');
  }

  if(!req.knBase) {
    return res.status(400).json("Please connect to a kb first")
  }

  let kbCode = req.knBase.code

  ids = ids.split(';');

  let result = []
  let deleted
  let existsInKb

  ids.forEach(async function(id) {
    existsInKb = await KnPiece.findOne({ _id: id, kbCode, isDeleted: false }).exec();
    if(existsInKb) {
      deleted = await KnPiece.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date(), deletedBy: req.user._id }).exec();
      result.push(deleted)
    }
  })

  return res.status(200).json({
    result
  });

});

module.exports = router;