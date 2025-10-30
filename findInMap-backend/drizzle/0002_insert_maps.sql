INSERT INTO maps (id, group_id, name)
SELECT gen_random_uuid(), id, 'First Map' FROM groups;