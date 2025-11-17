-- Criar bucket para imagens dos itens do cardápio
INSERT INTO storage.buckets (id, name, public)
VALUES ('menu-items', 'menu-items', true);

-- Política para permitir que admins façam upload de imagens
CREATE POLICY "Admins can upload menu item images"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'menu-items' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Política para permitir que admins atualizem imagens
CREATE POLICY "Admins can update menu item images"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'menu-items' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Política para permitir que admins deletem imagens
CREATE POLICY "Admins can delete menu item images"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'menu-items' 
  AND auth.uid() IN (
    SELECT user_id FROM public.user_roles WHERE role = 'admin'
  )
);

-- Política para permitir que todos vejam as imagens (bucket é público)
CREATE POLICY "Anyone can view menu item images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'menu-items');