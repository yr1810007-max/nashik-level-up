
CREATE TABLE public.direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
ON public.direct_messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
ON public.direct_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own sent messages"
ON public.direct_messages
FOR DELETE
USING (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read"
ON public.direct_messages
FOR UPDATE
USING (auth.uid() = receiver_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

CREATE INDEX idx_dm_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_dm_receiver ON public.direct_messages(receiver_id);
CREATE INDEX idx_dm_created ON public.direct_messages(created_at);
