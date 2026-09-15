import { supabase } from "./supabaseClient";
import type { Category, NewCategory, NewTodo, Todo } from "./types";

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function fetchTodosInRange(
  startDate: string,
  endDate: string
): Promise<Todo[]> {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createCategory(category: NewCategory): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .insert(category)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: string,
  updates: Partial<Pick<Category, "name" | "color" | "sort_order">>
): Promise<Category> {
  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

export async function createTodo(todo: NewTodo): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .insert(todo)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleTodo(id: string, completed: boolean): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTodoTitle(id: string, title: string): Promise<Todo> {
  const { data, error } = await supabase
    .from("todos")
    .update({ title })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw error;
}
