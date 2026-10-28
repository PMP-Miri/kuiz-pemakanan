-- NutriArena v1. Jalankan sekali dalam projek Supabase baharu.
-- Skema ini tidak memadam jadual aplikasi lain. Simpan sandaran sebelum perubahan.
begin;
create extension if not exists pgcrypto with schema extensions;
create table public.na_hosts (user_id uuid primary key references auth.users(id) on delete cascade);
create table public.na_quizzes (
 id uuid primary key default gen_random_uuid(), owner uuid not null references auth.users(id),
 title text not null, description text not null default '', theme text not null default 'aurora',
 status text not null default 'draft' check(status in ('draft','ready')), questions jsonb not null default '[]',
 updated_at timestamptz not null default now()
);
create table public.na_rooms (
 id uuid primary key default gen_random_uuid(), code text not null unique, owner uuid not null references auth.users(id),
 quiz_id uuid references public.na_quizzes(id) on delete set null, title text not null, theme text not null,
 phase text not null check(phase in ('normal','pre','post')), pre_id uuid references public.na_rooms(id),
 status text not null default 'lobby' check(status in ('lobby','question','reveal','finished')),
 current_index integer not null default -1, total integer not null, opened_at timestamptz,
 settings jsonb not null, revision integer not null default 0, created_at timestamptz not null default now()
);
create table public.na_snapshots (room_id uuid primary key references public.na_rooms(id) on delete cascade, questions jsonb not null);
create table public.na_players (
 id uuid primary key default gen_random_uuid(), room_id uuid not null references public.na_rooms(id) on delete cascade,
 user_id uuid not null references auth.users(id), name text not null check(char_length(name) between 1 and 30),
 participant_code text not null, joined_at timestamptz not null default now(),
 unique(room_id,user_id), unique(room_id,participant_code)
);
create table public.na_answers (
 room_id uuid not null references public.na_rooms(id) on delete cascade,
 player_id uuid not null references public.na_players(id) on delete cascade,
 question_id text not null, selected integer not null, correct boolean not null,
 points integer not null, elapsed_ms integer not null, created_at timestamptz not null default now(),
 primary key(player_id,question_id)
);
create index on public.na_players(room_id);
create index on public.na_answers(room_id);

create function public.na_is_host() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.na_hosts where user_id=auth.uid()) and coalesce((auth.jwt()->>'is_anonymous')::boolean,false)=false;
$$;
create function public.na_can_read_room(rid uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.na_rooms where id=rid and owner=auth.uid()) or exists(select 1 from public.na_players where room_id=rid and user_id=auth.uid());
$$;
alter table public.na_hosts enable row level security;
alter table public.na_quizzes enable row level security;
alter table public.na_rooms enable row level security;
alter table public.na_snapshots enable row level security;
alter table public.na_players enable row level security;
alter table public.na_answers enable row level security;
create policy host_self on public.na_hosts for select to authenticated using(user_id=auth.uid());
create policy own_quiz on public.na_quizzes for select to authenticated using(owner=auth.uid() and public.na_is_host());
create policy room_members on public.na_rooms for select to authenticated using(public.na_can_read_room(id));
-- Tiada polisi SELECT untuk snapshots/answers/players. Akses terhad melalui RPC sahaja.
revoke all on public.na_hosts,public.na_quizzes,public.na_rooms,public.na_snapshots,public.na_players,public.na_answers from anon,authenticated;
grant select on public.na_hosts,public.na_quizzes,public.na_rooms to authenticated;

create function public.na_validate(q jsonb, ready boolean) returns void language plpgsql set search_path='' as $$
declare x jsonb; n integer; seen text[] := '{}'; opt jsonb; fld text; lim integer;
begin
 if jsonb_typeof(q) is distinct from 'object' or jsonb_typeof(q->'title') is distinct from 'string' then raise exception 'Format kuiz / tajuk tidak sah.'; end if;
 if coalesce(q->>'theme','aurora') not in ('aurora','ocean','sunset') or coalesce(q->>'status','draft') not in ('draft','ready') then raise exception 'Tema / status tidak sah.'; end if;
 if q ? 'description' and (jsonb_typeof(q->'description') is distinct from 'string' or char_length(q->>'description')>1000) then raise exception 'Penerangan mesti teks maksimum 1000 aksara.'; end if;
 if char_length(trim(coalesce(q->>'title','')))=0 or char_length(q->>'title')>120 then raise exception 'Tajuk diperlukan (maksimum 120 aksara).'; end if;
 if jsonb_typeof(q->'questions') is distinct from 'array' then raise exception 'Senarai soalan tidak sah.'; end if;
 n:=jsonb_array_length(q->'questions');
 if n>50 or (ready and n<1) then raise exception 'Kuiz mesti mempunyai 1 hingga 50 soalan.'; end if;
 for x in select value from jsonb_array_elements(q->'questions') loop
  if jsonb_typeof(x) is distinct from 'object' or coalesce(x->>'id','') !~ '^[a-zA-Z0-9_-]{1,80}$' or (x->>'id')=any(seen) then raise exception 'ID soalan tidak sah atau berulang.'; end if;
  seen:=array_append(seen,x->>'id');
  for fld,lim in select * from (values ('text',1000),('topic',100),('explanation',2000),('sourceLabel',200),('image',2000),('source',2000)) as limits(k,n) loop
   if x ? fld and (jsonb_typeof(x->fld) is distinct from 'string' or char_length(x->>fld)>lim) then raise exception 'Medan % tidak sah atau terlalu panjang.',fld; end if;
  end loop;
  if coalesce(x->>'type','') not in ('mcq','tf') then raise exception 'Jenis soalan tidak sah.'; end if;
  if jsonb_typeof(x->'options') is distinct from 'array' then raise exception 'Pilihan tidak sah.'; end if;
  if jsonb_array_length(x->'options') not between 2 and 4 then raise exception 'Perlu 2 hingga 4 pilihan.'; end if;
  for opt in select value from jsonb_array_elements(x->'options') loop
   if jsonb_typeof(opt) is distinct from 'string' or char_length(opt#>>'{}')>300 then raise exception 'Pilihan mesti teks maksimum 300 aksara.'; end if;
  end loop;
  if jsonb_typeof(x->'seconds') is distinct from 'number' or jsonb_typeof(x->'correct') is distinct from 'number' or coalesce(x->>'correct','') !~ '^-?\d+$' then raise exception 'Masa / indeks jawapan mesti nombor.'; end if;
  if coalesce(x->>'image','')<>'' and (x->>'image') !~ '^https://' then raise exception 'Gambar mesti HTTPS.'; end if;
  if coalesce(x->>'source','')<>'' and (x->>'source') !~ '^https://' then raise exception 'Sumber mesti HTTPS.'; end if;
  if not ready then continue; end if;
  if char_length(trim(coalesce(x->>'text','')))=0 or char_length(x->>'text')>1000 then raise exception 'Teks soalan diperlukan (maksimum 1000 aksara).'; end if;
  if coalesce(x->>'type','') not in ('mcq','tf') then raise exception 'Jenis soalan tidak sah.'; end if;
  if jsonb_typeof(x->'options') is distinct from 'array' then raise exception 'Pilihan tidak sah.'; end if;
  n:=jsonb_array_length(x->'options');
  if n<2 or n>4 then raise exception 'Perlu 2 hingga 4 pilihan.'; end if;
  if x->>'type'='tf' and n<>2 then raise exception 'Betul/Salah perlu tepat 2 pilihan.'; end if;
  for opt in select value from jsonb_array_elements(x->'options') loop
   if jsonb_typeof(opt) is distinct from 'string' or char_length(trim(opt#>>'{}'))=0 or char_length(opt#>>'{}')>300 then raise exception 'Pilihan kosong atau melebihi 300 aksara.'; end if;
  end loop;
  if coalesce(x->>'correct','') !~ '^\d+$' then raise exception 'Jawapan betul tidak sah.'; end if;
  if (x->>'correct')::integer<0 or (x->>'correct')::integer>=n then raise exception 'Jawapan betul tidak sah.'; end if;
  if coalesce(x->>'seconds','') !~ '^\d+$' then raise exception 'Masa tidak sah.'; end if;
  if (x->>'seconds')::integer not between 5 and 120 then raise exception 'Masa perlu 5 hingga 120 saat.'; end if;
  if coalesce(x->>'image','')<>'' and (x->>'image') !~ '^https://' then raise exception 'Gambar mesti HTTPS.'; end if;
  if coalesce(x->>'source','')<>'' and (x->>'source') !~ '^https://' then raise exception 'Sumber mesti HTTPS.'; end if;
 end loop;
end $$;

create function public.na_mix(qs jsonb, mix_questions boolean, mix_options boolean) returns jsonb language plpgsql set search_path='' as $$
declare outqs jsonb:='[]'; q jsonb; opts jsonb; c integer;
begin
 for q in select value from jsonb_array_elements(qs) order by case when mix_questions then random() else 0 end loop
  if mix_options then
   select jsonb_agg(v order by rn), (max(pos) filter(where oldidx=(q->>'correct')::integer))::integer into opts,c from (
    select value v,(ordinality-1)::integer oldidx,rn,(row_number() over(order by rn)-1)::integer pos from (
     select value,ordinality,random() rn from jsonb_array_elements(q->'options') with ordinality
    ) t
   ) u;
   q:=q||jsonb_build_object('options',opts,'correct',c);
  end if;
  outqs:=outqs||jsonb_build_array(q);
 end loop;
 return outqs;
end $$;

create function public.na_manage(p_action text,p_data jsonb default '{}') returns jsonb language plpgsql security definer set search_path='' as $$
declare q jsonb; rid uuid; cid text; saved public.na_quizzes; r public.na_rooms; pre public.na_rooms; qs jsonb; st jsonb; ph text;
begin
 if not public.na_is_host() then raise exception 'Akaun ini belum didaftarkan sebagai pegawai.'; end if;
 if p_action='dashboard' then
  return jsonb_build_object('quizzes',coalesce((select jsonb_agg(to_jsonb(t) order by t.updated_at desc) from public.na_quizzes t where owner=auth.uid()),'[]'::jsonb),'rooms',coalesce((select jsonb_agg(to_jsonb(t) order by t.created_at desc) from public.na_rooms t where owner=auth.uid()),'[]'::jsonb));
 elsif p_action='save' then
  q:=p_data->'quiz'; perform public.na_validate(q,coalesce(q->>'status','draft')='ready');
  if exists(select 1 from public.na_quizzes where id=(q->>'id')::uuid and owner<>auth.uid()) then raise exception 'Tiada akses kuiz.'; end if;
  insert into public.na_quizzes(id,owner,title,description,theme,status,questions)
   values((q->>'id')::uuid,auth.uid(),trim(q->>'title'),left(coalesce(q->>'description',''),1000),coalesce(q->>'theme','aurora'),coalesce(q->>'status','draft'),q->'questions')
   on conflict(id) do update set title=excluded.title,description=excluded.description,theme=excluded.theme,status=excluded.status,questions=excluded.questions,updated_at=now() where public.na_quizzes.owner=auth.uid() returning * into saved;
  return to_jsonb(saved);
 elsif p_action='delete_quiz' then
  delete from public.na_quizzes where id=(p_data->>'id')::uuid and owner=auth.uid(); return '{}'::jsonb;
 elsif p_action='create' then
  ph:=coalesce(p_data->>'phase','normal');
  if ph not in ('normal','pre','post') then raise exception 'Fasa tidak sah.'; end if;
  select * into saved from public.na_quizzes where id=(p_data->>'quiz_id')::uuid and owner=auth.uid();
  if not found then raise exception 'Kuiz tidak ditemui.'; end if;
  perform public.na_validate(to_jsonb(saved),true);
  if saved.status<>'ready' then raise exception 'Terbitkan kuiz dahulu.'; end if;
  st:=jsonb_build_object('leaderboard',coalesce((p_data->>'leaderboard')::boolean,true),'speedBonus',coalesce((p_data->>'speedBonus')::boolean,true),'shuffleQuestions',coalesce((p_data->>'shuffleQuestions')::boolean,true),'shuffleOptions',coalesce((p_data->>'shuffleOptions')::boolean,true),'winners',greatest(1,least(10,coalesce((p_data->>'winners')::integer,3))));
  if ph='pre' then st:=st||'{"leaderboard":false,"speedBonus":false}'::jsonb; end if;
  if ph='post' then
   select * into pre from public.na_rooms where id=(p_data->>'pre_id')::uuid and owner=auth.uid() and phase='pre' and status='finished' and quiz_id=saved.id;
   if not found then raise exception 'Pilih sesi pra yang sudah tamat bagi kuiz ini.'; end if;
   select questions into qs from public.na_snapshots where room_id=pre.id;
  else qs:=saved.questions; end if;
  qs:=public.na_mix(qs,(st->>'shuffleQuestions')::boolean,(st->>'shuffleOptions')::boolean);
  loop cid:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)); exit when not exists(select 1 from public.na_rooms where code=cid); end loop;
  insert into public.na_rooms(code,owner,quiz_id,title,theme,phase,pre_id,total,settings)
   values(cid,auth.uid(),saved.id,saved.title,saved.theme,ph,case when ph='post' then pre.id else null end,jsonb_array_length(qs),st) returning id into rid;
  insert into public.na_snapshots(room_id,questions) values(rid,qs);
  return jsonb_build_object('code',cid,'id',rid);
 elsif p_action='delete_room' then
  if exists(select 1 from public.na_rooms where pre_id=(p_data->>'id')::uuid) then raise exception 'Padam sesi pasca yang dipautkan dahulu.'; end if;
  delete from public.na_rooms where id=(p_data->>'id')::uuid and owner=auth.uid(); return '{}'::jsonb;
 elsif p_action='report' then
  select * into r from public.na_rooms where code=upper(p_data->>'code') and owner=auth.uid();
  if not found then raise exception 'Sesi tidak ditemui.'; end if;
  return jsonb_build_object('room',to_jsonb(r),'questions',(select questions from public.na_snapshots where room_id=r.id),'players',coalesce((select jsonb_agg(to_jsonb(p)) from public.na_players p where room_id=r.id),'[]'::jsonb),'answers',coalesce((select jsonb_agg(to_jsonb(a)) from public.na_answers a where room_id=r.id),'[]'::jsonb),'pre',case when r.pre_id is not null then (select jsonb_build_object('room',to_jsonb(pr),'players',coalesce((select jsonb_agg(to_jsonb(p)) from public.na_players p where room_id=pr.id),'[]'::jsonb),'answers',coalesce((select jsonb_agg(to_jsonb(a)) from public.na_answers a where room_id=pr.id),'[]'::jsonb)) from public.na_rooms pr where id=r.pre_id) else null end);
 end if;
 raise exception 'Tindakan tidak dikenali.';
end $$;

create function public.na_join(p_code text,p_name text,p_participant_code text default '') returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.na_rooms; p public.na_players; oldp public.na_players; pc text; nm text;
begin
 if auth.uid() is null then raise exception 'Log masuk peserta diperlukan.'; end if;
 select * into r from public.na_rooms where code=upper(trim(p_code)) for update;
 if not found then raise exception 'Kod bilik tidak ditemui.'; end if;
 select * into p from public.na_players where room_id=r.id and user_id=auth.uid();
 if found then return to_jsonb(p); end if;
 if r.status<>'lobby' then raise exception 'Sesi telah bermula. Tunggu sesi seterusnya.'; end if;
 if (select count(*) from public.na_players where room_id=r.id)>=200 then raise exception 'Sesi penuh (200 peserta).'; end if;
 nm:=trim(p_name);
 if char_length(nm) not between 1 and 30 then raise exception 'Nama perlu 1 hingga 30 aksara.'; end if;
 if r.phase='post' then
  select * into oldp from public.na_players where room_id=r.pre_id and participant_code=upper(trim(p_participant_code));
  if not found then raise exception 'Kod peserta pra tidak sah untuk sesi ini.'; end if;
  pc:=oldp.participant_code; nm:=oldp.name;
  if exists(select 1 from public.na_players where room_id=r.id and participant_code=pc) then raise exception 'Kod peserta ini sudah digunakan dalam sesi pasca.'; end if;
 else
  loop pc:=upper(substr(replace(gen_random_uuid()::text,'-',''),1,12)); exit when not exists(select 1 from public.na_players where room_id=r.id and participant_code=pc); end loop;
 end if;
 insert into public.na_players(room_id,user_id,name,participant_code) values(r.id,auth.uid(),nm,pc) returning * into p;
 update public.na_rooms set revision=revision+1 where id=r.id;
 return to_jsonb(p);
end $$;

create function public.na_control(p_code text,p_action text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.na_rooms;
begin
 select * into r from public.na_rooms where code=upper(p_code) and owner=auth.uid() for update;
 if not found or not public.na_is_host() then raise exception 'Tiada akses sesi.'; end if;
 if p_action='start' and r.status='lobby' then
  if not exists(select 1 from public.na_players where room_id=r.id) then raise exception 'Perlu sekurang-kurangnya seorang peserta.'; end if;
  update public.na_rooms set status='question',current_index=0,opened_at=clock_timestamp(),revision=revision+1 where id=r.id;
 elsif p_action='lock' and r.status='question' then
  update public.na_rooms set status='reveal',revision=revision+1 where id=r.id;
 elsif p_action='next' and r.status='reveal' then
  update public.na_rooms set status=case when current_index+1>=total then 'finished' else 'question' end,current_index=case when current_index+1>=total then current_index else current_index+1 end,opened_at=clock_timestamp(),revision=revision+1 where id=r.id;
 elsif p_action='end' and r.status<>'finished' then
  update public.na_rooms set status='finished',revision=revision+1 where id=r.id;
 else raise exception 'Tindakan tidak sesuai dengan status semasa.'; end if;
 return '{}'::jsonb;
end $$;

create function public.na_answer(p_code text,p_question_id text,p_selected integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.na_rooms; p public.na_players; q jsonb; ms integer; ok boolean; pts integer;
begin
 select * into r from public.na_rooms where code=upper(p_code) for update;
 if not found then raise exception 'Sesi tidak ditemui.'; end if;
 select * into p from public.na_players where room_id=r.id and user_id=auth.uid();
 if not found then raise exception 'Anda belum menyertai sesi ini.'; end if;
 if r.status<>'question' then raise exception 'Jawapan telah dikunci.'; end if;
 select questions->r.current_index into q from public.na_snapshots where room_id=r.id;
 if p_question_id is distinct from q->>'id' then raise exception 'Soalan telah berubah.'; end if;
 if p_selected<0 or p_selected>=jsonb_array_length(q->'options') or p_selected is null then raise exception 'Pilihan tidak sah.'; end if;
 ms:=greatest(0,floor(extract(epoch from(clock_timestamp()-r.opened_at))*1000)::integer);
 if ms>=(q->>'seconds')::integer*1000 then raise exception 'Masa menjawab tamat.'; end if;
 ok:=p_selected=(q->>'correct')::integer;
 pts:=case when ok then 1000+case when (r.settings->>'speedBonus')::boolean then floor((1-ms::numeric/((q->>'seconds')::integer*1000))*500)::integer else 0 end else 0 end;
 insert into public.na_answers(room_id,player_id,question_id,selected,correct,points,elapsed_ms) values(r.id,p.id,p_question_id,p_selected,ok,pts,ms) on conflict(player_id,question_id) do nothing;
 update public.na_rooms set revision=revision+1 where id=r.id;
 -- Jawapan betul/mata TIDAK dipulangkan sebelum pendedahan.
 return '{"accepted":true}'::jsonb;
end $$;

create function public.na_state(p_code text) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.na_rooms; p public.na_players; q jsonb; exposed jsonb; mine jsonb; board jsonb; host boolean; answered integer; dist jsonb;
begin
 select * into r from public.na_rooms where code=upper(p_code) for update;
 if not found then raise exception 'Sesi tidak ditemui.'; end if;
 host:=r.owner=auth.uid() and public.na_is_host();
 select * into p from public.na_players where room_id=r.id and user_id=auth.uid();
 if not host and p.id is null then raise exception 'Anda belum menyertai sesi ini.'; end if;
 select questions->r.current_index into q from public.na_snapshots where room_id=r.id;
 if r.status='question' and clock_timestamp()>=r.opened_at+make_interval(secs=>(q->>'seconds')::integer) then
  update public.na_rooms set status='reveal',revision=revision+1 where id=r.id returning * into r;
 end if;
 if r.status in ('question','reveal') then
  exposed:=q-'correct'-'explanation'-'source'-'sourceLabel';
  if r.status='reveal' and r.phase<>'pre' then exposed:=q; end if;
 end if;
 if p.id is not null and q is not null then
  select jsonb_build_object('selected',selected) into mine from public.na_answers where player_id=p.id and question_id=q->>'id';
 end if;
 select count(*) into answered from public.na_answers where room_id=r.id and question_id=q->>'id';
 if host or (r.phase<>'pre' and (r.settings->>'leaderboard')::boolean and r.status in ('reveal','finished')) then
  select coalesce(jsonb_agg(to_jsonb(t)),'[]'::jsonb) into board from (
   select pl.id,pl.name,case when host then pl.participant_code else null end participant_code,
    count(a.question_id)::integer answered,count(a.question_id) filter(where a.correct)::integer correct,
    coalesce(sum(a.points),0)::integer points,coalesce(sum(a.elapsed_ms),0)::integer ms,
    bool_or(a.question_id=q->>'id') is true answered_current
   from public.na_players pl left join public.na_answers a on a.player_id=pl.id where pl.room_id=r.id group by pl.id
  ) t;
 else
  select coalesce(jsonb_agg(jsonb_build_object('id',id,'name',name)),'[]'::jsonb) into board from public.na_players where room_id=r.id;
 end if;
 if r.status='reveal' and r.phase<>'pre' then
  select coalesce(jsonb_object_agg(selected,n),'{}'::jsonb) into dist from (select selected,count(*) n from public.na_answers where room_id=r.id and question_id=q->>'id' group by selected) t;
 end if;
 return jsonb_build_object('room',to_jsonb(r),'server_now',clock_timestamp(),'question',exposed,'mine',mine,'player',case when p.id is not null then jsonb_build_object('id',p.id,'name',p.name,'participant_code',p.participant_code) else null end,'players',board,'answered',answered,'distribution',dist,'my_stats',case when p.id is not null and r.status='finished' and r.phase<>'pre' then (select jsonb_build_object('correct',count(*) filter(where a.correct),'answered',count(*),'points',coalesce(sum(a.points),0)) from public.na_answers a where a.player_id=p.id) else null end,'is_host',host);
end $$;

-- Tutup pelaksanaan fungsi dalaman dan akses pengguna tanpa autentikasi.
revoke execute on function public.na_is_host(),public.na_can_read_room(uuid),public.na_validate(jsonb,boolean),public.na_mix(jsonb,boolean,boolean),public.na_manage(text,jsonb),public.na_join(text,text,text),public.na_control(text,text),public.na_answer(text,text,integer),public.na_state(text) from public,anon,authenticated;
grant execute on function public.na_is_host(),public.na_can_read_room(uuid),public.na_manage(text,jsonb),public.na_join(text,text,text),public.na_control(text,text),public.na_answer(text,text,integer),public.na_state(text) to authenticated;

-- Realtime hanya mengirim metadata bilik, bukan soalan sulit atau jawapan individu.
do $$ begin
 if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename='na_rooms') then
  alter publication supabase_realtime add table public.na_rooms;
 end if;
end $$;

-- Gambar kuiz bersifat awam. Jangan muat naik gambar peserta / data peribadi.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('nutriarena-media','nutriarena-media',true,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do nothing;
create policy na_media_insert on storage.objects for insert to authenticated with check(bucket_id='nutriarena-media' and (storage.foldername(name))[1]=auth.uid()::text and public.na_is_host());
create policy na_media_delete on storage.objects for delete to authenticated using(bucket_id='nutriarena-media' and (storage.foldername(name))[1]=auth.uid()::text and public.na_is_host());
create policy na_media_select on storage.objects for select to authenticated using(bucket_id='nutriarena-media' and (storage.foldername(name))[1]=auth.uid()::text and public.na_is_host());
commit;

-- SELEPAS mencipta akaun pegawai dalam Authentication > Users, jalankan berasingan:
-- insert into public.na_hosts(user_id) values ('UUID-AKAUN-PEGAWAI');
