-- Fast Nights — move the dress codes into the database.
--
-- Run this once in the Fast Nights project's SQL editor, alongside
-- supabase/schema.sql. It merges a "dress" key into the existing row
-- without touching the schedule already stored under "nights".
--
-- These eleven strings used to live in index.html, which meant they sat in
-- public page source and had to be redeployed to change. After this they
-- are editable from the page's keeper screen, and the morning-of reminder
-- reads them from here rather than carrying its own copy.

update public.fast_nights
   set data = coalesce(data, '{}'::jsonb) || '{
  "dress": {
    "1": "Baggy pants and a tight tank top. Letty shades optional.",
    "2": "Miami Beach or Miami nightlife — you choose.",
    "3": "Gyaru. Pinterest it.",
    "4": "Bandeau or off-the-shoulder top, and leggings that show off that ass.",
    "5": "Something summery. Bring an appetite.",
    "6": "Leather jacket. Ready to ride.",
    "7": "The best thing in your closet. Full Abu Dhabi. I''m dressing up too.",
    "8": "All black. Every piece.",
    "9": "Sexy gym outfit. Baby oil optional.",
    "10": "Backyard cookout. Whatever you''d wear to a barbecue.",
    "11": "Fast and Furious, but make it pajamas."
  }
}'::jsonb,
       updated = (extract(epoch from now()) * 1000)::bigint
 where id = 'main';

-- If there is no row yet, create one carrying the dress codes.
insert into public.fast_nights (id, data, updated)
select 'main',
       '{
  "dress": {
    "1": "Baggy pants and a tight tank top. Letty shades optional.",
    "2": "Miami Beach or Miami nightlife — you choose.",
    "3": "Gyaru. Pinterest it.",
    "4": "Bandeau or off-the-shoulder top, and leggings that show off that ass.",
    "5": "Something summery. Bring an appetite.",
    "6": "Leather jacket. Ready to ride.",
    "7": "The best thing in your closet. Full Abu Dhabi. I''m dressing up too.",
    "8": "All black. Every piece.",
    "9": "Sexy gym outfit. Baby oil optional.",
    "10": "Backyard cookout. Whatever you''d wear to a barbecue.",
    "11": "Fast and Furious, but make it pajamas."
  }
}'::jsonb || '{"nights":{}}'::jsonb,
       (extract(epoch from now()) * 1000)::bigint
 where not exists (select 1 from public.fast_nights where id = 'main');

select id, jsonb_object_keys(data) as keys from public.fast_nights where id = 'main';
