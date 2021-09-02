// Image processing library
var Jimp = require('jimp');

// To download image
const fs = require('fs'),
    request = require('request');

// For API
const express = require('express');
const app = express();

// Simply downloads the image from a link. If the image exists locally, then you can alter it to use local image.
const download = (uri, filename, callback) => {
    request.head(uri, (err, res, body)=> {
        console.log('content-type: ', res.headers['content-type']);
        console.log('content-length: ', res.headers['content-length']);
        request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    });
};

// Main function of the program. Can be altered for customization.
const main = (imgLink)=> {

    download(imgLink, 'output.png', ()=> {

        // After the image has finished downloading
        var filename = 'output.png';
        var imageCaption_line1 = '*Art generated from modified algorithm by Matt DesLauries and is licensed under';
        var imageCaption_line2 = 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International';
        var loadedImage;
        

        Jimp.read(filename)
            .then((image)=> {

                loadedImage = image;

                
                // Get height and width of the image
                var imgWidth = loadedImage.bitmap.width;
                var imgHeight = loadedImage.bitmap.height;

                var r = [];
                var g = [];
                var b = [];

                // Getting values of all pixels in the lower 25% of the image
                for (let i = (imgHeight * 0.75); i < imgHeight; i++) {
                    for (let j = (imgWidth * 0.75); j < imgWidth; j++) {
                        r.push(Jimp.intToRGBA(loadedImage.getPixelColour(i, j)).r);
                        g.push(Jimp.intToRGBA(loadedImage.getPixelColour(i, j)).g);
                        b.push(Jimp.intToRGBA(loadedImage.getPixelColour(i, j)).b);
                    }
                }

                
                var r_sum = r.reduce( (a, b)=> {
                    return a + b;
                }, 0);

                var r_avg = r_sum / r.length;
                
                
                var g_sum = g.reduce( (a, b)=> {
                    return a + b;
                }, 0);

                var g_avg = g_sum / g.length;
                
                
                var b_sum = b.reduce( (a, b)=> {
                    return a + b;
                }, 0);

                var b_avg = b_sum / b.length;
                
                // After finding the average values of RGB values, assigning them weights.

                var img_threshold =  (0.21 * r_avg) + (0.72 * g_avg)+ (0.07 * b_avg) ;


                // 255 / 2 => 127.5
                // If image is dark, send white text
                // If image is light, send black text

                const brightness_threshold = 127.5;

                if (img_threshold < brightness_threshold) {
                    // console.log('sending white');
                    return Jimp.loadFont(Jimp.FONT_SANS_16_WHITE);
                }
                else {
                    // console.log('sending black');
                    return Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);
                }

            })
            .then((font)=> {


                // Get height and width of the image
                var imgWidth = loadedImage.bitmap.width;
                var imgHeight = loadedImage.bitmap.height;

                // Print the text on the image
                loadedImage.print(font, imgWidth - 600, imgHeight - 60, imageCaption_line1)
                            .print(font, imgWidth - 590, imgHeight - 40, imageCaption_line2)
                            .write(filename);

            })
            .catch((err)=> {
                console.log(err);
            });
        
    });

}

// This is the function that adds caption to the image
// main('https://cdn.pixabay.com/photo/2021/08/25/07/23/nature-6572635_960_720.jpg');



// To handle image conversion requests
app.get('/', (req, res)=> {
    // Get image link
    let imgLink = req.query.img;
    
    // Add caption to the image
    main(imgLink);
    
    // Send OK
    res.send(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Listening on ', PORT));