import { chosen_color } from "./color_utils.js";
/**
 * SOCKET IS INITIALIZED IN FOOTER
 */
document.addEventListener('DOMContentLoaded', () => {
    // Canvas dimensions
    const canvasWidth = 32;
    const canvasHeight = 32;
    let artwork_data = [];
    let artName = '';

    /**
     * Initialize the artwork data array with default values
     * Creates a flattened 2D array for efficient pixel access
     */
    for (let row = 0; row < canvasHeight; row++) 
    {
        for(let col = 0; col < canvasWidth; col++)
        {
            artwork_data.push({position: [row, col], color: 0});
        }
    }

    /**
     * Update a pixel's color in both the data array and DOM.
     * Additionally sends update to all sockets in room
     */
    const pixels = document.querySelectorAll('.pixel');
    for (const pixel of pixels) {
        pixel.addEventListener('click', function() {
            const row = Number.parseInt(this.getAttribute('data-row'));
            const col = Number.parseInt(this.getAttribute('data-col'));
            artwork_data[(canvasWidth * row) + col] = {position: [row, col], color: chosen_color};
            this.style.backgroundColor = chosen_color;
            this.style.borderColor = chosen_color;
            socket.emit('update', row, col, chosen_color, canvasHeight, canvasWidth);
        });
    }
    // Clear button functionality
    // Clear all pixels and reset artwork data
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn)
    {
        clearBtn.addEventListener('click', () => {
            for (const pixel of pixels)
            {
                pixel.removeAttribute('style');
            }
            artwork_data = [];
            for (let row = 0; row < canvasHeight; row++) 
            {
                for(let col = 0; col < canvasWidth; col++)
                {
                    artwork_data.push({position: [row, col], color: 0});
                }
            }
        });
    }
    /**
     * Pre-save function to update artwork data.
     * Used in load_canvas
     */
    function preSave(artArray)
    {
        artwork_data = artArray;
    }
    /**
     * Save artwork to server
     * @param {string || null} image - Base64 image data or null if saving image or not
     * @returns {Promise<boolean>} Success status
     */
    async function SaveArt(image)
    {
        if (artName == '')
        {
            try
            {
                artName = document.getElementById('theName').value
            }
            catch
            {
                artName = "";
            }
        }
        if(artName != '')
        {
        await axios.post('/save_canvas', {
        name: `${artName}`,
            properties: {
                width: canvasWidth,
                height: canvasHeight,
                artArray: artwork_data
            },
            image: image
        });
        return true;
        }
        
    }

    // Save button functionality
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn)
    {
        let inLoad = false;
        saveBtn.addEventListener('click', async() => {
            if (artName == '')
            {
                try
                {
                    artName = document.getElementById('theName').value
                    if(artName == '')
                    {
                        alert("Name Your Artwork Before Saving");
                    }
                }
                catch
                {
                    alert("Name Your Artwork Before Saving");
                }
            }
            if(artName != '')
            {
                if(inLoad)
                {
                    return;
                }
                inLoad = true;
                saveBtn.disabled = true;
                document.querySelector('.loader').style.display = 'block';
                //added small delay to ensure UI updates
                setTimeout(async() => {
                    const node = document.getElementById('canvas-container');
                    const dataURL = await htmlToImage.toPng(node, {canvasWidth: 200, canvasHeight: 200, quality: .9, pixelRatio: 1})
                    .catch((err) => {
                        saveBtn.disabled = false;
                        console.log(err);
                    });
                    saveBtn.disabled = false;
                    document.querySelector('.loader').style.display = 'none';
                    inLoad = false
                    await SaveArt(dataURL);
                }, 20);
            }
        });
    }
    /**
    * Visualization of how elements are stored in artwork_data(flatening a 2D array)
    *  (0,0) (0,1) (0,2)
    *  (1,0) (1,1) (1,2)
    *  (2,0) (2,1) (2,2)
    *  
    * (0,0) (0,1) (0,2) (1,0) (1,1) (1,2) (2,0) (2,1) (2,2)
    *  0      1     2     1     2      3    2     3     3
    *  0.     1.    2.    3.    4.     5.   6.    7.    8.
    * 
    *  (row * canvasWidth) + col
    */

    //updates socket that is in the shared canvas
    socket.on('update', function(row, col, chosen_color) {
        const pixels = document.querySelectorAll('.pixel');
        for (const pixel of pixels)
        {
            if (pixel.getAttribute('data-row') == row && pixel.getAttribute('data-col') == col)
            {
                pixel.style.backgroundColor = chosen_color;
                pixel.style.borderColor = chosen_color;
                artwork_data[(canvasWidth * row) + col] = {position: [row, col], color: chosen_color};
                
            }
        }
    });

    // gets newly joined socket up to speed on the latest updates
    socket.on('update all', function(historyArray) {
        const rowLen = historyArray.length;
        const colLen = historyArray[0].length;
        for (let row = 0; row < rowLen; row++)
        {
            for (let col = 0; col < colLen; col++)
            {
                const pixels = document.querySelectorAll('.pixel');
                for (const pixel of pixels)
                {
                    if (pixel.getAttribute('data-row') == row && pixel.getAttribute('data-col') == col)
                    {
                        const currentPixelColor = historyArray[row][col];
                        pixel.style.backgroundColor = currentPixelColor;
                        pixel.style.borderColor = currentPixelColor;
                        artwork_data[(canvasWidth * row) + col] = {position: [row, col], color: currentPixelColor};
                    }
                }
            }
        }
    });

    //This block ensures that artName is auto updated when the user changes it
    let inputs = document.getElementsByName("artworkName");
    for (let i = 0; i < inputs.length; i++)
    {
        inputs[i].onkeyup = function ()
        {
            if (this.value.match(/.+/))
            {
                artName = this.value;
            }
        };
    }

    //auto save so art work is not lost
    window.addEventListener("beforeunload", async() => {
        await SaveArt(null);
    });

    //loads canvas from artArray from server
    axios.get('/load_canvas')
    .then((res) => {
        if(res.status == 200)
        {
            const artArray = res.data.properties.artArray;
            preSave(artArray);
            const num_drawn_pixels = artArray.length;


            for (let i = 0; i < num_drawn_pixels; i++)
            {
                const x = artArray[i].position[0];
                const y = artArray[i].position[1];
                const pixel = document.querySelector(`[data-row="${x}"][data-col="${y}"][class = "pixel"]`);

                if (pixel)
                {
                    pixel.style.backgroundColor = artArray[i].color;
                    pixel.style.borderColor = artArray[i].color;
                }
            }
        }
    })
    .catch((err) => {
        console.log(err);
    });
});

    /**
     * this try/catch is used to identify if a user 
     * has entered a shared canvas after the DOM loads
     */
    try
    {
        let canvasNumber = null;
        canvasNumber = document.getElementById("roomid").value;
            if(canvasNumber != null)
            {
                socket.emit('joinRoom', canvasNumber);
            }
    }
    catch
    {
        console.log("No room Id");
    }
