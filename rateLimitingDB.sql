
CREATE TABLE requests(
  username varchar(25) NOT NULL,
  created_at timestamp DEFAULT current_timestamp,
  id serial UNIQUE primary key
);

CREATE FUNCTION get_user_requests(TEXT, integer, integer)
returns integer
language plpgsql
as
$$
DECLARE myvar integer;
BEGIN
  SELECT rateCount INTO myvar FROM (
    SELECT username, count(username) AS rateCount FROM requests
    WHERE created_at > current_timestamp - interval '1 minute' * $2
    GROUP BY username
  ) AS rateCount WHERE username = $1;
  IF (COALESCE( myvar, 0)) < $3 THEN
    INSERT INTO requests VALUES($1);
  END IF;
  RETURN COALESCE( myvar, 0);
END;
$$;
