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
  routine_id: string | null;
  created_at: string;
};

export type Routine = {
  id: string;
  category_id: string | null;
  title: string;
  weekdays: number[]; // 0 = Sunday ... 6 = Saturday
  created_at: string;
};

export type NewCategory = Pick<Category, "name" | "color"> & {
  sort_order?: number;
};

export type NewTodo = Pick<Todo, "title" | "date"> & {
  category_id: string | null;
  routine_id?: string | null;
};

export type NewRoutine = Pick<Routine, "title" | "category_id" | "weekdays">;

export type Profile = {
  id: string;
  nickname: string;
  friend_code: string;
  created_at: string;
};

export type FriendshipStatus = "pending" | "accepted";

export type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
  created_at: string;
  responded_at: string | null;
};
