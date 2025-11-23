-- SQL queries to debug triggers and rules on 'pedidos', 'conversaciones', and 'storage.objects' tables.
-- Run these queries in your Supabase SQL Editor.

-- 1. List triggers on the 'pedidos' table:
SELECT event_object_table AS table_name, trigger_name, event_manipulation AS event, action_statement AS definition
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'pedidos';

-- 2. List rules on the 'pedidos' table:
SELECT * FROM pg_rules WHERE tablename = 'pedidos';

-- 3. List triggers on the 'conversaciones' table:
SELECT event_object_table AS table_name, trigger_name, event_manipulation AS event, action_statement AS definition
FROM information_schema.triggers
WHERE event_object_schema = 'public' AND event_object_table = 'conversaciones';

-- 4. List rules on the 'conversaciones' table:
SELECT * FROM pg_rules WHERE tablename = 'conversaciones';

-- 5. List triggers on the 'storage.objects' table:
SELECT event_object_table AS table_name, trigger_name, event_manipulation AS event, action_statement AS definition
FROM information_schema.triggers
WHERE event_object_schema = 'storage' AND event_object_table = 'objects';
