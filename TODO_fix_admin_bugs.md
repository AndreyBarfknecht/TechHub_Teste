# TODO: Fix Admin Bugs - Image Edit & Delete

## Plan Status: Approved ✅

**Step 1: Create this TODO.md** [COMPLETED]

**Step 2: Edit src/components/admin/ProductForm.tsx**
- Remove `required` from image input
- Add current image preview in edit mode with text "Imagem atual — selecione outra apenas se quiser substituir"
- Ensure image remains optional in both create/edit modes

**Step 3: Improve src/components/admin/ProductList.tsx** 
- Replace alert() with better error handling (match form's message pattern)
- Verify delete storage + DB logic

**Step 4: Test locally** [PENDING 🔄]
```
1. npm run dev
2. Go to /admin → login (admin@gmail.com / admin1)
3. Edit existing product → change name/price → Save WITHOUT new image → verify saves
4. Delete product → confirm removes from list
```
**RLS Check:** If delete fails, run in Supabase SQL:
```sql
CREATE POLICY "Admin can delete products" ON public.products FOR DELETE USING (true);
```



**Step 5: Commit & Push**
```
git add .
git commit -m "Fix admin bugs: optional image on edit + preview, polish delete"
git checkout -b feature/fix-admin-bugs
git push origin feature/fix-admin-bugs
```
Create PR for Andrey to merge → Vercel auto-deploy

**Step 6: Mark as [COMPLETED]**

