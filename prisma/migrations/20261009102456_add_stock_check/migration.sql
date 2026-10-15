-- This is an empty migration.

-- Le stock ne peut JAMAIS être négatif, même si le code a un bug
ALTER TABLE "products" ADD CONSTRAINT "products_stock_non_negative" CHECK ("stock" >= 0);

-- Une quantité commandée est toujours strictement positive
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_quantity_positive" CHECK ("quantity" > 0);