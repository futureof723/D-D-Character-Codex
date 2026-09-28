drop policy if exists "Anyone can create characters for class demo" on public.characters;
drop policy if exists "Anyone can update characters for class demo" on public.characters;
drop policy if exists "Anyone can delete characters for class demo" on public.characters;

create policy "Anyone can create characters for class demo"
on public.characters
for insert
to anon
with check (true);

create policy "Anyone can update characters for class demo"
on public.characters
for update
to anon
using (true)
with check (true);

create policy "Anyone can delete characters for class demo"
on public.characters
for delete
to anon
using (true);