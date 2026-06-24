/** Shared Note type matching the API response shape. */
export interface Note {
  id: string;
  title: string;
  content: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}
