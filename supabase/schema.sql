-- ============================================
-- 学习平台 - Supabase 数据库表结构
-- ============================================

-- 1. 统一画板表：所有 Excalidraw 数据存这里
create table drawings (
  id          uuid primary key default gen_random_uuid(),
  title       text not null default '未命名画板',
  elements    jsonb not null default '[]'::jsonb,       -- Excalidraw elements JSON
  app_state   jsonb default '{}'::jsonb,                -- Excalidraw appState（视口/缩放等）
  files       jsonb default '{}'::jsonb,                -- Excalidraw 嵌入的文件（图片等）
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. 算法题表
create table algorithms (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,                            -- 题目名称
  difficulty  text check (difficulty in ('easy', 'medium', 'hard')),
  tags        text[] default '{}',                      -- 标签，如 ['dp', 'tree']
  link        text,                                     -- 原题链接（LeetCode 等）
  notes       text,                                     -- 文字笔记
  drawing_id  uuid references drawings(id) on delete set null, -- 可选关联画板
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 3. 课程表
create table courses (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,                            -- 课程名称
  semester    text,                                     -- 学期，如 '2026-Spring'
  total_weeks int not null default 14,
  created_at  timestamptz not null default now()
);

-- 4. 课程周表：每周一个画板笔记
create table course_weeks (
  id          uuid primary key default gen_random_uuid(),
  course_id   uuid not null references courses(id) on delete cascade,
  week_number int not null,
  topic       text,                                     -- 本周主题
  drawing_id  uuid not null references drawings(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (course_id, week_number)                       -- 同一课程周数不重复
);

-- 5. 博客文章表
create table blogs (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text not null default '',                 -- Markdown 正文
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 6. 博客-画板关联表（多对多：一篇文章可嵌入多个画板）
create table blog_drawings (
  id          uuid primary key default gen_random_uuid(),
  blog_id     uuid not null references blogs(id) on delete cascade,
  drawing_id  uuid not null references drawings(id) on delete cascade,
  sort_order  int not null default 0,                   -- 画板在文章中的排列顺序
  unique (blog_id, drawing_id)
);

-- ============================================
-- 索引
-- ============================================
create index idx_algorithms_drawing on algorithms(drawing_id);
create index idx_course_weeks_course on course_weeks(course_id);
create index idx_course_weeks_drawing on course_weeks(drawing_id);
create index idx_blog_drawings_blog on blog_drawings(blog_id);
create index idx_blog_drawings_drawing on blog_drawings(drawing_id);
create index idx_drawings_updated on drawings(updated_at desc);
create index idx_blogs_published on blogs(published, created_at desc);

-- ============================================
-- 自动更新 updated_at 触发器
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_drawings_updated
  before update on drawings
  for each row execute function update_updated_at();

create trigger trg_algorithms_updated
  before update on algorithms
  for each row execute function update_updated_at();

create trigger trg_blogs_updated
  before update on blogs
  for each row execute function update_updated_at();

-- ============================================
-- RLS 策略：登录可读写，未登录只读
-- ============================================

-- 开启 RLS
alter table drawings      enable row level security;
alter table algorithms    enable row level security;
alter table courses       enable row level security;
alter table course_weeks  enable row level security;
alter table blogs         enable row level security;
alter table blog_drawings enable row level security;

-- 所有人可读（anon + authenticated）
create policy "公开读取" on drawings      for select using (true);
create policy "公开读取" on algorithms    for select using (true);
create policy "公开读取" on courses       for select using (true);
create policy "公开读取" on course_weeks  for select using (true);
create policy "公开读取" on blogs         for select using (true);
create policy "公开读取" on blog_drawings for select using (true);

-- 登录用户可增删改
create policy "登录写入" on drawings      for insert with check (auth.role() = 'authenticated');
create policy "登录更新" on drawings      for update using (auth.role() = 'authenticated');
create policy "登录删除" on drawings      for delete using (auth.role() = 'authenticated');

create policy "登录写入" on algorithms    for insert with check (auth.role() = 'authenticated');
create policy "登录更新" on algorithms    for update using (auth.role() = 'authenticated');
create policy "登录删除" on algorithms    for delete using (auth.role() = 'authenticated');

create policy "登录写入" on courses       for insert with check (auth.role() = 'authenticated');
create policy "登录更新" on courses       for update using (auth.role() = 'authenticated');
create policy "登录删除" on courses       for delete using (auth.role() = 'authenticated');

create policy "登录写入" on course_weeks  for insert with check (auth.role() = 'authenticated');
create policy "登录更新" on course_weeks  for update using (auth.role() = 'authenticated');
create policy "登录删除" on course_weeks  for delete using (auth.role() = 'authenticated');

create policy "登录写入" on blogs         for insert with check (auth.role() = 'authenticated');
create policy "登录更新" on blogs         for update using (auth.role() = 'authenticated');
create policy "登录删除" on blogs         for delete using (auth.role() = 'authenticated');

create policy "登录写入" on blog_drawings for insert with check (auth.role() = 'authenticated');
create policy "登录更新" on blog_drawings for update using (auth.role() = 'authenticated');
create policy "登录删除" on blog_drawings for delete using (auth.role() = 'authenticated');
