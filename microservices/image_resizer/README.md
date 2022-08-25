# Instructions

Note that it only accepts jpegs and pngs.

Send a POST request to http://IP-ADDRESS-HERE:7099/upload.
Send the file using an application/x-www-form-urlencoded.

This will add your resized image to an uploads folder.
The response will just be a JSON that looks like
{
    "message": "Image has been resized"
}

You can access the image by sending a GET request to http://IP-ADDRESS-HERE:7099/thumbnail.
