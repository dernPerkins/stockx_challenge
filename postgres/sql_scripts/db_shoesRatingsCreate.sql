-- Create Table
create table ShoeRatings (
ID SERIAL PRIMARY KEY,
ShoeID int not null,
Rating int not null
);

-- Create Functions
-- This function will add a shoe rating for a existing or new shoe
CREATE FUNCTION addShoeRating(_name Shoes.Name%TYPE,
   _rating ShoeRatings.Rating%TYPE) RETURNS BOOLEAN AS $$
   DECLARE
      _shoeID Shoes.ID%TYPE;
   BEGIN
      IF EXISTS(SELECT s.ID FROM Shoes s WHERE s.Name = _name)
      THEN
         -- If we find the ID from matching the Name we can insert a new rating
         SELECT s.ID INTO _shoeID FROM Shoes s WHERE s.Name = _name;
         INSERT INTO ShoeRatings (ShoeID, Rating) VALUES (_shoeID, _rating);
         RETURN TRUE;
      ELSE
         -- Insert new shoe since we don't have a record for it
         INSERT INTO Shoes (Name) VALUES (_name);

         -- Perform the same IF EXISTS check after insertion just to make sure we successfully added it and get the ID
         IF EXISTS(SELECT s.ID FROM Shoes s WHERE s.Name = _name)
         THEN
            -- If we find the ID from matching the Name we can insert a new rating
            SELECT s.ID INTO _shoeID FROM Shoes s WHERE s.Name = _name;
            INSERT INTO ShoeRatings (ShoeID, Rating) VALUES (_shoeID, _rating);
            RETURN TRUE;
         ELSE
            -- Something went wrong inserting the new shoe so fail out
            RETURN FALSE;
         END IF;
      END IF;
   END;
$$ LANGUAGE plpgsql;

-- Returns the TrueToSizeCalculation based on the ratings of users for the requested shoe
CREATE FUNCTION getShoeRating(_name Shoes.Name%TYPE) RETURNS REAL AS $$
   DECLARE
      _shoeID Shoes.ID%TYPE;
      _ratingAVG REAL;
   BEGIN
      IF EXISTS(SELECT s.ID FROM Shoes s WHERE s.Name = _name)
      THEN
         -- If we find the ID from matching the Name we can insert a new rating
         SELECT s.ID INTO _shoeID FROM Shoes s WHERE s.Name = _name;
         SELECT AVG(sr.Rating) INTO _ratingAVG FROM ShoeRatings sr WHERE sr.ShoeID = _shoeID;
         RETURN _ratingAVG;
      ELSE
         -- We'll return a negative value for failure when the Shoe doesn't exist
         RETURN -1;
      END IF;
   END;
$$ LANGUAGE plpgsql;