export type Category = {
  id: string;
  name: string;
  color: string;
  sort_order: number;
  created_at: string;
};

export type Todo = {
  id: string;
  category_id: string | null;
  title: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  created_at: string;
};

export type NewCategory = Pick<Category, "name" | "color"> & {
  sort_order?: number;
};

export type NewTodo = Pick<Todo, "title" | "date"> & {
  category_id: string | null;
};
