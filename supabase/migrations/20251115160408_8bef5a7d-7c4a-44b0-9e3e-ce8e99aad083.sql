-- Create notifications table
CREATE TABLE public.notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false NOT NULL,
  order_id bigint REFERENCES public.orders(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_notifications_user_id_read ON public.notifications(user_id, read);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Function to create notification for order status change
CREATE OR REPLACE FUNCTION public.notify_order_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  status_label text;
BEGIN
  -- Only notify on status updates
  IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Map status to label
    status_label := CASE NEW.status
      WHEN 'PENDING' THEN 'Pendente'
      WHEN 'CONFIRMED' THEN 'Confirmado'
      WHEN 'DELIVERED' THEN 'Entregue'
      WHEN 'CANCELED' THEN 'Cancelado'
      ELSE NEW.status::text
    END;
    
    -- Insert notification for client
    INSERT INTO public.notifications (user_id, title, message, order_id)
    VALUES (
      NEW.client_id,
      'Status do Pedido Atualizado',
      'Seu pedido #' || NEW.id || ' está agora: ' || status_label,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function to notify admins of new orders
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Insert notification for all admins
  FOR admin_record IN 
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  LOOP
    INSERT INTO public.notifications (user_id, title, message, order_id)
    VALUES (
      admin_record.user_id,
      'Novo Pedido Recebido!',
      'Pedido #' || NEW.id || ' - Total: R$ ' || NEW.total::text,
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for order status changes
CREATE TRIGGER on_order_status_change
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_order_status_change();

-- Create trigger for new orders
CREATE TRIGGER on_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_order();