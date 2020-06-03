const fs = require('fs');
const path = require('path');

exports.deleteImg = (imagePath) => {
    fs.unlink(imagePath, (err) => {
        if(err){
            throw err;
        }
    })
}

