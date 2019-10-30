# Running the API with Docker Compose
For this multi-container application I built it with the use of the Docker-Compose Tool. Makes it super simple in terms of building and running.

All that's required is that you get the latest version of this repository and from the base run `docker-compose build` followed by `docker-compose up`.

If you have issues on Linux, please try running those commands as root user through `sudo`. I personally had to do that when working on it on my laptop, but not on my Windows 10 PC.

# Calling the API
Based on the latest version of the docker-compose file, the node image will run on port 3000. Simply make a call either in the browser or through a tool like Postman to the url `http://localhost:3000/` with the command and parameters you'd like. Ex. `http://localhost:3000/AddShoeRating?name='Adidas Yeezy 350 v2 Beluga'&rating=2`

## Commands
### TrueToSizeCalculation
URL: `http://localhost:3000/TrueToSizeCalculation`

Parameters:
- name => a string up to 128 characters

### AddShoeRating
URL: `http://localhost:3000/AddShoeRating`

Parameters: 
- name => a string up to 128 characters
- rating => a integer from 1 to 5

# Issues and Potential Additions
All around the usage of Docker is on a very novice level being that I've never used Docker before. It was a fun chance to throw myself at something new although it left me with some downfalls I want to address.

Mostly due to myself not having a ton of time and wanting to put forward something to turn in for the challenge. I've left out a couple things I would've liked to have completed:
- Missing Secret Credentials and Encryption: If this were truly going into production, everything being logged would be encrypted by client credentials. Also, there would actually be client credentials. Having that would help track who is making calls and only allow certain clients portions of the API (if that were necessary). Can also help isolate if credentials are compromised that we can remove their access. More than likely I'd store these credentials in another table alongside the others in the PostgreSQL DB.
- Use of live StockX data: I originally had intended on making use of the StockX API and what data that could potentially provide. Even structure of the responses and database so I could make my API closer to the real thing.
