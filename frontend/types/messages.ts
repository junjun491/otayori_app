// frontend/types/messages.ts
export type InboxItem = {
  message_id: number;
  classroom_id: number;
  title: string;
  published_at: string;
  deadline: string | null;
  confirmed_at: string | null;
};
export type InboxResponse = { items: InboxItem[] };

export type MessageShow = {
  id: number;
  classroom_id: number;
  title: string;
  content_html?: string;
  content_text?: string;
  published_at: string;
  deadline: string | null;
  delivery: {
    confirmed_at: string | null;
    responded_at: string | null;
    status: "none" | "saved" | "submitted";
    form_data?: { text?: string } | null;
  };
  form?: {
    type: "textarea";
    label: string;
    required?: boolean;
    maxLength?: number;
  };
};
