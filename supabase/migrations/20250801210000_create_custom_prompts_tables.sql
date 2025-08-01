-- Create custom_prompts table
create table public.custom_prompts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  project_id uuid references public.projects on delete cascade,
  title text not null,
  content text not null,
  platform text,
  notes text,
  is_public boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint title_length check (char_length(title) >= 3)
);

-- Enable RLS for custom_prompts
alter table public.custom_prompts enable row level security;

-- Create policies for custom_prompts
create policy "Users can view their own prompts"
  on public.custom_prompts for select
  using (auth.uid() = user_id or is_public = true);

create policy "Users can insert their own prompts"
  on public.custom_prompts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own prompts"
  on public.custom_prompts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own prompts"
  on public.custom_prompts for delete
  using (auth.uid() = user_id);

-- Create prompt_variables table
create table public.prompt_variables (
  id uuid default gen_random_uuid() primary key,
  prompt_id uuid references public.custom_prompts on delete cascade not null,
  name text not null,
  description text,
  default_value text,
  is_required boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint name_length check (char_length(name) >= 1)
);

-- Create indexes
create index idx_custom_prompts_user_id on public.custom_prompts(user_id);
create index idx_prompt_variables_prompt_id on public.prompt_variables(prompt_id);

-- Create function to update updated_at column
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_custom_prompts_updated_at
  before update on public.custom_prompts
  for each row execute function public.handle_updated_at();

create trigger handle_prompt_variables_updated_at
  before update on public.prompt_variables
  for each row execute function public.handle_updated_at();
