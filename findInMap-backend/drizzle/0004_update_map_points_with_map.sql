UPDATE map_points 
SET map_id = (SELECT id FROM maps LIMIT 1)
WHERE map_id IS NULL;