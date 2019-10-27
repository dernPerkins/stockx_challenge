-- Create Table
create table ShoeRatings (
ID SERIAL PRIMARY KEY,
ShoeID int not null,
Rating int not null
);

-- Create Functions
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
         -- Return 0 as a false in the case where the Name doesn't exist
         RETURN FALSE;
      END IF;
   END;
$$ LANGUAGE plpgsql;