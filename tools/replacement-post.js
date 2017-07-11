'use strict'

// load config
const config = require('../built/config').default
if (!config) {
    console.error("failed to load configration.")
    process.exit(1)
}

const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const connection = mongoose.createConnection(config.mongo.uri, {
    promiseLibrary: global.Promise
})

// load model
const postsSchemas = require('../built/db/schemas/post')
const postsModel = postsSchemas.status(connection)

// get postId
const postIdElem = process.argv[2]
if (!postIdElem) process.exit(1)
const postIdElemArr = postIdElem.split('/')
const postId = postIdElemArr[postIdElemArr.length - 1]

// get post & change to random hash
const text = require('crypto').randomBytes(16).toString('hex')
postsModel.findById(postId).then(post => {
    // if reply, remove inReplyToPost & set type to status
    if (post.type === 'reply') {
        console.log('reply post detected.')
        post.inReplyToPost = undefined
        post.type = 'status'
    }
    post.text = text
    // for future changing
    post.isDeleted = true
    post.save().then(uPost => {
        console.log(`replacement change happened at post identified by id ${uPost._id}.`)
        process.exit(0)
    }).catch(e => {
        console.log(e.stack)
        process.exit(1)
    })
}).catch(e => {
    console.log(e.stack)
    process.exit(1)
})
