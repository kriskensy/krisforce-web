CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. REFERENCE TABLES (ENUMERATIONS)
-- =====================================================

CREATE TABLE address_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE product_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE order_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE ticket_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    level INTEGER,
    active BOOLEAN DEFAULT true
);

CREATE TABLE ticket_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE contact_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE invoice_statuses (
  id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code   TEXT UNIQUE NOT NULL,
  name   TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE nav_tabs (
    id SERIAL PRIMARY KEY,
    label TEXT NOT NULL,
    href TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true
);

-- =====================================================
-- 2. CLIENTS & CRM
-- =====================================================

CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    nip TEXT UNIQUE,
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE client_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    address_type_id UUID REFERENCES address_types(id),
    street TEXT,
    city TEXT,
    zip_code TEXT,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE client_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    contact_type_id UUID REFERENCES contact_types(id),
    value TEXT,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    number TEXT UNIQUE NOT NULL,
    start_date DATE,
    end_date DATE,
    value DECIMAL(12,2),
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE client_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    note_text TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

-- =====================================================
-- 3. USERS & SECURITY
-- =====================================================

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    active BOOLEAN DEFAULT true
);

-- auth.users reference
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role_id UUID REFERENCES roles(id),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL
);

CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT
);

-- =====================================================
-- 4. PRODUCTS & PRICING
-- =====================================================

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id UUID REFERENCES product_categories(id),
    standard_price DECIMAL(10,2),
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE price_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    valid_from DATE,
    valid_to DATE,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE price_list_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    price_list_id UUID REFERENCES price_lists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10,2),
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

-- =====================================================
-- 5. ORDERS & FULFILLMENT
-- =====================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    order_number TEXT UNIQUE NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    total_amount DECIMAL(12,2),
    status_id UUID REFERENCES order_statuses(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);

CREATE TABLE order_workflow (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    old_status_id UUID REFERENCES order_statuses(id),
    new_status_id UUID REFERENCES order_statuses(id),
    changed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    tracking_number TEXT,
    carrier TEXT,
    shipped_date DATE
);

-- =====================================================
-- 6. INVOICES & PAYMENTS
-- =====================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES clients(id),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    total_amount DECIMAL(12,2),
    paid_amount DECIMAL(12,2) DEFAULT 0,
    status_id UUID REFERENCES invoice_statuses(id),
    order_id UUID REFERENCES orders(id),
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description TEXT,
    quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(12,2) GENERATED ALWAYS AS (quantity * unit_price) STORED
);


CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id),
    client_id UUID REFERENCES clients(id),
    amount DECIMAL(12,2),
    payment_date DATE DEFAULT CURRENT_DATE,
    method_id UUID REFERENCES payment_methods(id),
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

-- =====================================================
-- 7. TICKETS & SUPPORT
-- =====================================================

CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT UNIQUE,
    client_id UUID REFERENCES clients(id),
    subject TEXT NOT NULL,
    description TEXT,
    priority_id UUID REFERENCES ticket_priorities(id),
    status_id UUID REFERENCES ticket_statuses(id),
    assigned_to UUID REFERENCES users(id),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP NULL DEFAULT NULL
);

CREATE TABLE ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL UNIQUE, -- storage path
    content_type TEXT,              -- 'image/png', 'application/pdf'
    file_size INTEGER,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. DOCUMENTS & ADMINISTRATION
-- =====================================================

CREATE TABLE site_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section TEXT NOT NULL,       --'hero', 'navbar', 'footer', 'about'
    key TEXT UNIQUE NOT NULL,    --'hero_title', 'hero_image_url'
    value TEXT NOT NULL,         -- storage url
    type TEXT DEFAULT 'text',    -- 'text', 'richtext', 'image'
    label TEXT NOT NULL,         -- label for admin
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE nav_tabs_roles (
    tab_id INTEGER REFERENCES nav_tabs(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (tab_id, role_id)
);

-- =====================================================
-- 9. MESSAGES
-- =====================================================

CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_name TEXT NOT NULL,
    sender_email TEXT NOT NULL,
    subject TEXT,
    message_text TEXT NOT NULL,
    status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Responded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP NULL DEFAULT NULL
);


-- =====================================================
-- INDEXES (PERFORMANCE OPTIMIZATION)
-- =====================================================

CREATE INDEX idx_users_client_id ON users(client_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status ON orders(status_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_status_id ON invoices(status_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_payments_invoice ON payments(invoice_id);
CREATE INDEX idx_payments_client ON payments(client_id);
CREATE INDEX idx_tickets_client ON tickets(client_id);
CREATE INDEX idx_tickets_status ON tickets(status_id);
CREATE INDEX idx_tickets_assigned ON tickets(assigned_to);
CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_attachments_ticket_id ON ticket_attachments(ticket_id);

-- Soft Delete Indexes
CREATE INDEX idx_clients_deleted_at ON clients(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_deleted_at ON orders(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_deleted_at ON products(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_contracts_deleted_at ON contracts(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_tickets_deleted_at ON tickets(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_deleted_at ON payments(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_client_notes_deleted_at ON client_notes(deleted_at) WHERE deleted_at IS NULL;

-- Active Status Indexes
CREATE INDEX idx_address_types_active ON address_types(active);
CREATE INDEX idx_product_categories_active ON product_categories(active);
CREATE INDEX idx_order_statuses_active ON order_statuses(active);
CREATE INDEX idx_payment_methods_active ON payment_methods(active);
CREATE INDEX idx_ticket_priorities_active ON ticket_priorities(active);
CREATE INDEX idx_ticket_statuses_active ON ticket_statuses(active);
CREATE INDEX idx_roles_active ON roles(active);
CREATE INDEX idx_contact_types_active ON contact_types(active);

-- =====================================================
-- VIEWS (REPORTING & ANALYTICS)
-- =====================================================
drop view report_client_summary

CREATE OR REPLACE VIEW report_client_summary AS
SELECT 
    c.id AS client_id,
    c.name AS client_name,
    c.nip,
    c.created_at AS joined_date,
    
    (SELECT COUNT(*) FROM tickets t 
     JOIN ticket_statuses ts ON t.status_id = ts.id 
     WHERE t.client_id = c.id 
     AND ts.code NOT IN ('closed', 'resolved')
     AND t.deleted_at IS NULL) as open_tickets,

    (SELECT COUNT(*) FROM tickets t 
     JOIN ticket_priorities tp ON t.priority_id = tp.id 
     JOIN ticket_statuses ts ON t.status_id = ts.id
     WHERE t.client_id = c.id 
     AND tp.code = 'critical'
     AND ts.code NOT IN ('closed', 'resolved')
     AND t.deleted_at IS NULL) as critical_tickets,

    (SELECT COUNT(*) FROM tickets t 
     JOIN ticket_statuses ts ON t.status_id = ts.id 
     WHERE t.client_id = c.id 
     AND ts.code = 'pending'
     AND t.deleted_at IS NULL) as pending_tickets,

    -- total renevew 
    (SELECT COALESCE(SUM(i.total_amount), 0) FROM invoices i
     JOIN invoice_statuses ist ON i.status_id = ist.id
     WHERE i.client_id = c.id 
     AND ist.code = 'paid'
     AND i.deleted_at IS NULL) as total_revenue,

    -- help columns
    (SELECT COUNT(*) FROM orders WHERE client_id = c.id AND deleted_at IS NULL) as total_orders,
    (SELECT COUNT(*) FROM tickets WHERE client_id = c.id AND deleted_at IS NULL) as total_tickets,
    
    -- all invoices sum
    (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE client_id = c.id AND deleted_at IS NULL) as total_invoice,
    
    -- sum "paid"
    (SELECT COALESCE(SUM(i.total_amount), 0) FROM invoices i
     JOIN invoice_statuses ist ON i.status_id = ist.id
     WHERE i.client_id = c.id AND ist.code = 'paid' AND i.deleted_at IS NULL) as total_paid_to,
    
    -- current debt
    (SELECT COALESCE(SUM(i.total_amount), 0) FROM invoices i
     JOIN invoice_statuses ist ON i.status_id = ist.id
     WHERE i.client_id = c.id AND ist.code != 'paid' AND i.deleted_at IS NULL) as current_debt

FROM clients c;


CREATE OR REPLACE VIEW report_contracts AS
SELECT 
    ct.client_id,
    ct.number as contract_number,
    ct.start_date,
    ct.end_date,
    ct.value as contract_value,
    CASE 
        WHEN ct.end_date < CURRENT_DATE THEN 'Expired'
        WHEN ct.end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'Expiring Soon'
        ELSE 'Active'
    END as status
FROM contracts ct
WHERE ct.deleted_at IS NULL;


CREATE OR REPLACE VIEW report_invoices AS
SELECT 
    i.id,
    i.client_id,
    i.invoice_number,
    i.invoice_date,
    i.due_date,
    i.total_amount,
    i.paid_amount,
    (i.total_amount - i.paid_amount) as amount_to_pay,
    ist.name as status_name,
    ist.code as status_code
FROM invoices i
JOIN invoice_statuses ist ON i.status_id = ist.id
WHERE i.deleted_at IS NULL;


CREATE OR REPLACE VIEW report_orders AS
SELECT 
    o.id,
    o.client_id,
    o.order_number,
    o.order_date,
    o.total_amount,
    os.name as status_name,
    (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as items_count
FROM orders o
JOIN order_statuses os ON o.status_id = os.id
WHERE o.deleted_at IS NULL;


CREATE OR REPLACE VIEW report_payments AS
SELECT 
    p.client_id,
    p.amount as payment_amount,
    p.payment_date,
    pm.name as payment_method,
    i.invoice_number as related_invoice
FROM payments p
LEFT JOIN invoices i ON p.invoice_id = i.id
JOIN payment_methods pm ON p.method_id = pm.id
WHERE p.deleted_at IS NULL;


CREATE OR REPLACE VIEW report_tickets AS
SELECT 
    t.client_id,
    t.subject,
    ts.name as status_name,
    tp.name as priority_name,
    t.created_at,
    (SELECT COUNT(*) FROM ticket_comments tc WHERE tc.ticket_id = t.id) as comments_count
FROM tickets t
JOIN ticket_statuses ts ON t.status_id = ts.id
JOIN ticket_priorities tp ON t.priority_id = tp.id
WHERE t.deleted_at IS NULL;


CREATE OR REPLACE VIEW report_orders_by_status AS
SELECT 
    os.name as status_name,
    COUNT(o.id) as order_count,
    SUM(o.total_amount) as total_value
FROM orders o
JOIN order_statuses os ON o.status_id = os.id
WHERE o.deleted_at IS NULL
GROUP BY os.id, os.name;


CREATE OR REPLACE VIEW report_tickets_open AS
SELECT 
    t.id,
    c.name as client_name,
    t.subject,
    tp.name as priority,
    ts.name as status,
    t.created_at
FROM tickets t
JOIN clients c ON t.client_id = c.id AND c.deleted_at IS NULL
JOIN ticket_priorities tp ON t.priority_id = tp.id
JOIN ticket_statuses ts ON t.status_id = ts.id
WHERE ts.code != 'closed' 
    AND t.deleted_at IS NULL;


-- sum of invoices from last 6 months
CREATE OR REPLACE VIEW report_revenue_history AS
SELECT 
    client_id,
    to_char(invoice_date, 'Mon') as month_name,
    date_trunc('month', invoice_date) as month_date,
    COUNT(*) as invoice_count,
    SUM(total_amount) as total_amount
FROM invoices
WHERE invoice_date >= now() - interval '6 months'
  AND deleted_at IS NULL
GROUP BY client_id, month_name, month_date
ORDER BY month_date ASC;


CREATE OR REPLACE VIEW report_global_revenue AS
SELECT 
    to_char(invoice_date, 'Mon') as month,
    date_trunc('month', invoice_date) as month_date,
    SUM(total_amount) as total
FROM invoices
WHERE deleted_at IS NULL
GROUP BY month, month_date
ORDER BY month_date ASC;


CREATE OR REPLACE VIEW report_revenue_by_category AS
SELECT 
    pc.name as category,
    SUM(oi.total_price) as total
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN product_categories pc ON p.category_id = pc.id
GROUP BY pc.name;


-- which role has access to which navigation tabs
CREATE OR REPLACE VIEW report_permissions_summary AS
SELECT 
    r.name as role_name,
    COUNT(ntr.tab_id) as assigned_tabs
FROM roles r
LEFT JOIN nav_tabs_roles ntr ON r.id = ntr.role_id
GROUP BY r.name;


-- =====================================================
-- FUNCTIONS (BUSINESS LOGIC)
-- =====================================================
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    new_number TEXT;
    year_month TEXT;
    next_val INTEGER;
BEGIN
    year_month := 'TCK-' || TO_CHAR(NOW(), 'YYYYMM') || '-';
    -- next nr
    SELECT COUNT(*) + 1 INTO next_val
    FROM tickets
    WHERE ticket_number LIKE year_month || '%';

    new_number := year_month || LPAD(next_val::TEXT, 4, '0');
    NEW.ticket_number := new_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trigger_assign_ticket_number ON tickets;
CREATE TRIGGER trigger_assign_ticket_number
BEFORE INSERT ON tickets
FOR EACH ROW
WHEN (NEW.ticket_number IS NULL)
EXECUTE FUNCTION generate_ticket_number();


CREATE OR REPLACE FUNCTION check_ticket_assignee_role()
RETURNS TRIGGER AS $$
DECLARE
    assignee_role TEXT;
BEGIN
    IF NEW.assigned_to IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT r.code INTO assignee_role
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = NEW.assigned_to;

    IF assignee_role IN ('support', 'manager', 'admin') OR NEW.assigned_to = NEW.created_by THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Invalid assignee: User must be staff or the original creator.';
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_check_assignee
BEFORE INSERT OR UPDATE ON tickets
FOR EACH ROW EXECUTE FUNCTION check_ticket_assignee_role();


CREATE OR REPLACE FUNCTION validate_user_role_for_ticket_creation()
RETURNS TRIGGER AS $$
DECLARE
    user_role_code TEXT;
BEGIN
    -- get role code
    SELECT r.code INTO user_role_code
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = NEW.created_by;

    IF user_role_code != 'user' THEN
        RAISE EXCEPTION 'Only users with the USER role can create tickets.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trigger_validate_ticket_creator ON tickets;
CREATE TRIGGER trigger_validate_ticket_creator
BEFORE INSERT ON tickets
FOR EACH ROW EXECUTE FUNCTION validate_user_role_for_ticket_creation();


-- how many users has role X
CREATE OR REPLACE FUNCTION get_admin_user_stats()
RETURNS TABLE (label TEXT, value TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT r.name as label, COUNT(u.id)::TEXT as value
    FROM roles r
    LEFT JOIN users u ON u.role_id = r.id
    GROUP BY r.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STORED PROCEDURES (BUSINESS PROCESSES)
-- =====================================================

CREATE OR REPLACE PROCEDURE update_order_status(
    p_order_id UUID, 
    p_new_status_code TEXT
) 
LANGUAGE plpgsql 
AS $$
DECLARE 
    old_status_id UUID; 
    new_status_id UUID;
    v_deleted_at TIMESTAMP;
BEGIN
    SELECT deleted_at, status_id INTO v_deleted_at, old_status_id 
    FROM orders 
    WHERE id = p_order_id;
    
    IF v_deleted_at IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot update deleted order: %', p_order_id;
    END IF;

    SELECT id INTO new_status_id 
    FROM order_statuses 
    WHERE code = p_new_status_code;

    IF new_status_id IS NULL THEN
        RAISE EXCEPTION 'Status code % not found', p_new_status_code;
    END IF;

    IF old_status_id = new_status_id THEN
        RAISE NOTICE 'Status is already set to %', p_new_status_code;
        RETURN; 
    END IF;

    UPDATE orders SET status_id = new_status_id WHERE id = p_order_id;

    INSERT INTO order_workflow (order_id, old_status_id, new_status_id)
    VALUES (p_order_id, old_status_id, new_status_id);
END;
$$;


-- bridge function for Supabase
CREATE OR REPLACE FUNCTION call_update_order_status(p_order_id UUID, p_new_status_code TEXT)
RETURNS void AS $$
BEGIN
  CALL update_order_status(p_order_id, p_new_status_code);
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE PROCEDURE record_payment(
    p_invoice_id UUID,
    p_amount DECIMAL(12,2),
    p_user_id UUID,
    p_payment_method_id UUID
)
LANGUAGE plpgsql
AS $$
DECLARE
    invoice_client UUID;
    remaining_balance DECIMAL(12,2);
    v_deleted_at TIMESTAMP;
BEGIN
    SELECT deleted_at INTO v_deleted_at FROM invoices WHERE id = p_invoice_id;
    
    IF v_deleted_at IS NOT NULL THEN
        RAISE EXCEPTION 'Cannot record payment on deleted invoice: %', p_invoice_id;
    END IF;
    
    SELECT client_id INTO invoice_client FROM invoices WHERE id = p_invoice_id;
    
    INSERT INTO payments (invoice_id, client_id, amount, method_id, payment_date)
    VALUES (p_invoice_id, invoice_client, p_amount, p_payment_method_id, NOW());
    
    UPDATE invoices
    SET paid_amount = p_amount
    WHERE id = p_invoice_id;
    
    SELECT (total_amount - paid_amount) INTO remaining_balance 
    FROM invoices WHERE id = p_invoice_id;
    
    IF remaining_balance <= 0 THEN
    UPDATE invoices 
    SET status_id = (SELECT id FROM invoice_statuses WHERE code = 'paid') 
    WHERE id = p_invoice_id;
END IF;
END;
$$;


-- bridge function for Supabase
CREATE OR REPLACE FUNCTION call_record_payment(
    p_invoice_id UUID,
    p_amount DECIMAL(12,2),
    p_user_id UUID,
    p_payment_method_id UUID
)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    CALL record_payment(p_invoice_id, p_amount, p_user_id, p_payment_method_id);
    RETURN true;
END;
$$;


CREATE OR REPLACE FUNCTION create_invoice_from_order_fn(
    p_order_id UUID,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_client_id UUID;
    v_total_amount DECIMAL(12,2);
    v_invoice_number TEXT;
    v_invoice_id UUID;
    v_issued_status_id UUID;
BEGIN
    SELECT client_id, total_amount INTO v_client_id, v_total_amount
    FROM orders 
    WHERE id = p_order_id AND deleted_at IS NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Order not found or deleted: %', p_order_id;
    END IF;

    SELECT id INTO v_issued_status_id 
    FROM invoice_statuses 
    WHERE code = 'issued' 
    LIMIT 1;

    IF v_issued_status_id IS NULL THEN
        RAISE EXCEPTION 'Status "issued" not found in invoice_statuses';
    END IF;

    v_invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || 
        LPAD((SELECT COUNT(*) + 1 
              FROM invoices 
              WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYYMM') || '%')::TEXT, 4, '0');
    
    INSERT INTO invoices (
        client_id, 
        invoice_number, 
        total_amount, 
        order_id, 
        due_date, 
        status_id, 
        created_at
    )
    VALUES (
        v_client_id, 
        v_invoice_number, 
        v_total_amount, 
        p_order_id, 
        CURRENT_DATE + INTERVAL '14 days', 
        v_issued_status_id, 
        NOW()
    )
    RETURNING id INTO v_invoice_id;

    INSERT INTO invoice_items (
        invoice_id, 
        product_id, 
        description, 
        quantity, 
        unit_price
    )
    SELECT 
        v_invoice_id, 
        product_id, 
        'Product: ' || product_id,
        quantity, 
        unit_price
    FROM order_items
    WHERE order_id = p_order_id;

    RETURN v_invoice_id;
END;
$$;


CREATE OR REPLACE FUNCTION global_search(search_query TEXT)
RETURNS JSONB AS $$
DECLARE
    results JSONB := '{}'::JSONB;
    current_user_role TEXT;
BEGIN
    -- get user role
    SELECT LOWER(r.code) INTO current_user_role
    FROM public.roles r
    JOIN public.users u ON u.role_id = r.id
    WHERE u.id = auth.uid();

    -- products - all users
    results := results || jsonb_build_object('products', (
        SELECT json_agg(t) FROM (
            SELECT *, name as title FROM products 
            WHERE name ILIKE '%' || search_query || '%'
        ) t
    ));

    -- tickets
    IF current_user_role IN ('support', 'manager', 'admin') THEN
        results := results || jsonb_build_object('tickets', (
            SELECT json_agg(t) FROM (
                SELECT *, subject as title FROM tickets 
                WHERE subject ILIKE '%' || search_query || '%'
            ) t
        ));
    END IF;

    -- clients
    IF current_user_role IN ('manager', 'admin') THEN
        results := results || jsonb_build_object('clients', (
            SELECT json_agg(t) FROM (
                SELECT *, name as title FROM clients 
                WHERE name ILIKE '%' || search_query || '%'
            ) t
        ));
    END IF;

    -- users
    IF current_user_role IN ('admin') THEN
        results := results || jsonb_build_object('users', (
            SELECT json_agg(t) FROM (
                SELECT *, email as title FROM users 
                WHERE email ILIKE '%' || search_query || '%'
            ) t
        ));
    END IF;

    -- orders, invoices
    IF current_user_role IN ('admin', 'manager') THEN
        results := results || jsonb_build_object('invoices', (
            SELECT json_agg(t) FROM (SELECT *, invoice_number as title FROM invoices WHERE invoice_number ILIKE '%' || search_query || '%') t
        ));
        results := results || jsonb_build_object('orders', (
            SELECT json_agg(t) FROM (SELECT *, order_number as title FROM orders WHERE order_number ILIKE '%' || search_query || '%') t
        ));
    END IF;

    RETURN results;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- TRIGGERS (AUTOMATIC UPDATES & LOGGING)
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY definer
SET search_path = public
AS $$
DECLARE
    default_role_id UUID;
BEGIN
    SELECT id INTO default_role_id 
    FROM roles WHERE code = 'user' LIMIT 1;

    INSERT INTO public.users (id, email, role_id, client_id)
    VALUES (
        NEW.id,
        NEW.email,
        default_role_id,
        NULL  -- for normal registration
    );

    RETURN NEW;
END;
$$;


DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user()


CREATE OR REPLACE FUNCTION handle_order_total_update()
RETURNS TRIGGER AS $$
DECLARE
  current_order_id UUID;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    current_order_id := OLD.order_id;
  ELSE
    current_order_id := NEW.order_id;
  END IF;

  UPDATE orders
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM order_items
    WHERE order_id = current_order_id
  )
  WHERE id = current_order_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trigger_update_order_total ON order_items
CREATE TRIGGER trigger_update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION handle_order_total_update();


CREATE OR REPLACE FUNCTION handle_invoice_total_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices
  SET total_amount = (
    SELECT COALESCE(SUM(total_price), 0)
    FROM invoice_items
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
  )
  WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_update_invoice_total
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW EXECUTE FUNCTION handle_invoice_total_update();


CREATE OR REPLACE FUNCTION handle_payment_update()
RETURNS TRIGGER AS $$
DECLARE
    v_total DECIMAL(12,2);
    v_paid DECIMAL(12,2);
    v_paid_status_id UUID;
BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO v_paid
    FROM payments
    WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id) AND deleted_at IS NULL;

    SELECT total_amount INTO v_total
    FROM invoices
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    SELECT id INTO v_paid_status_id FROM invoice_statuses WHERE code = 'paid';

    UPDATE invoices
    SET 
        paid_amount = v_paid,
        status_id = CASE WHEN v_paid >= v_total THEN v_paid_status_id ELSE status_id END
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_update_invoice_payment
AFTER INSERT OR UPDATE OR DELETE ON payments
FOR EACH ROW EXECUTE FUNCTION handle_payment_update();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- site_content
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" 
ON site_content FOR SELECT 
USING (true);

CREATE POLICY "Admin update access" 
ON site_content FOR UPDATE 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() 
    AND r.code = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() 
    AND r.code = 'admin'
  )
);


-- Supabase storage bucket 'site_assets'
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'site_assets' );

CREATE POLICY "Admin Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'site_assets' AND 
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.code = 'admin'
  )
);


CREATE POLICY "Admin Update Access" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'site_assets' AND 
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.code = 'admin'
  )
);


CREATE POLICY "Admin Delete Access" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'site_assets' AND 
  EXISTS (
    SELECT 1 FROM public.users u
    JOIN public.roles r ON u.role_id = r.id
    WHERE u.id = auth.uid() AND r.code = 'admin'
  )
);


CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id);


CREATE POLICY "Users can view own profile" 
ON public.user_profiles 
FOR SELECT 
USING (auth.uid() = id);


CREATE POLICY "Allow read access for authenticated users"
ON public.roles
FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- REFERENCE DATA
-- =====================================================

INSERT INTO roles (code, name) VALUES
    ('admin', 'Administrator'),
    ('manager', 'Manager'),
    ('support', 'Support Agent'),
    ('user', 'User')
ON CONFLICT DO NOTHING;

INSERT INTO address_types (code, name) VALUES
    ('billing', 'Billing Address'),
    ('delivery', 'Delivery Address'),
    ('correspondence', 'Correspondence Address')
ON CONFLICT DO NOTHING;

INSERT INTO product_categories (code, name) VALUES
    ('services', 'Services'),
    ('consulting', 'Consulting'),
    ('licenses', 'Licenses'),
    ('support', 'Support'),
    ('training', 'Training')
ON CONFLICT DO NOTHING;

INSERT INTO order_statuses (code, name) VALUES
    ('new', 'New'),
    ('confirmed', 'Confirmed'),
    ('processing', 'Processing'),
    ('shipped', 'Shipped'),
    ('delivered', 'Delivered'),
    ('cancelled', 'Cancelled')
ON CONFLICT DO NOTHING;

INSERT INTO payment_methods (code, name) VALUES
    ('transfer', 'Bank Transfer'),
    ('card', 'Credit Card'),
    ('blik', 'BLIK'),
    ('invoice', 'Invoice Payment'),
    ('cash', 'Cash')
ON CONFLICT DO NOTHING;

INSERT INTO ticket_priorities (code, name, level) VALUES
    ('critical', 'Critical', 1),
    ('high', 'High', 2),
    ('normal', 'Normal', 3),
    ('low', 'Low', 4)
ON CONFLICT DO NOTHING;

INSERT INTO ticket_statuses (code, name) VALUES
    ('open', 'Open'),
    ('in_progress', 'In Progress'),
    ('waiting', 'Waiting for Customer'),
    ('resolved', 'Resolved'),
    ('closed', 'Closed')
ON CONFLICT DO NOTHING;

INSERT INTO contact_types (code, name) VALUES
    ('email', 'Email'),
    ('phone', 'Phone'),
    ('mobile', 'Mobile'),
    ('website', 'Website')
ON CONFLICT (code) DO NOTHING;

INSERT INTO invoice_statuses (code, name) VALUES
    ('draft',     'Draft'),
    ('issued',    'Issued'),
    ('sent',      'Sent to client'),
    ('paid',      'Paid'),
    ('overdue',   'Overdue'),
    ('cancelled', 'Cancelled')
ON CONFLICT (code) DO NOTHING;

INSERT INTO site_content (section, key, value, type, label) VALUES 
    ('navbar', 'nav_brand_name', 'KrisForce', 'text', 'Brand Name'),
    ('navbar', 'nav_brand_logo', 'https://placeholder.com/logo.jpg', 'image', 'Brand Logo'),
    ('hero', 'hero_title', 'Innovative Solutions for Your Business', 'text', 'Main Title'),
    ('hero', 'hero_subtitle', 'We help you scale with modern CRM tools.', 'richtext', 'Subtitle'),
    ('hero', 'hero_bg_image', 'https://placeholder.com/hero.jpg', 'image', 'Background Image'),
    ('footer', 'footer_contact_title', 'Contact Information', 'text', 'Contact Section Title'),
    ('footer', 'footer_address', 'KrisForce CRM Solutions\nul. Zwycięstwa 100\n44-100 Gliwice\nEmail: info@krisforce.com', 'richtext', 'Company Address & Details'),
    ('footer', 'footer_form_title', 'Send us a message', 'text', 'Contact Form Title'),
    ('footer', 'footer_form_submit', 'Send', 'text', 'Form Submit Button Label'),
    ('about', 'marketing_headline', 'KrisForce 2.0 Ecosystem', 'text', 'Main Headline'),
    ('about', 'marketing_subheadline', 'Everything you need to manage, scale, and automate your business operations in one beautiful interface.', 'richtext', 'Subheadline description'),
    ('about', 'marketing_f1_title', 'Advanced CRM', 'text', 'Feature 1: Title (Marketing)'),
    ('about', 'marketing_f1_desc', 'Manage leads and customer relationships.', 'text', 'Feature 1: Description'),
    ('about', 'marketing_f2_title', 'Real-time Analytics', 'text', 'Feature 2: Title (Marketing)'),
    ('about', 'marketing_f2_desc', 'Track your performance with dynamic charts.', 'text', 'Feature 2: Description'),
    ('about', 'marketing_eco_f3_title', 'Enterprise Security', 'text', 'Feature 3: Title (Marketing)'),
    ('about', 'marketing_eco_f3_desc', 'Bank-grade encryption.', 'text', 'Feature 3: Description')
ON CONFLICT (key) DO NOTHING;

INSERT INTO nav_tabs (label, href, order_index) VALUES 
    ('Home', '/protected', 1),
    ('Clients', '/protected/clients', 2),
    ('Products', '/protected/products', 3),
    ('My Orders', '/protected/my-orders', 4),
    ('My Invoices', '/protected/my-invoices', 5),
    ('My Support', '/protected/my-support', 6),
    ('Sales', '/protected/sales', 7),
    ('Tickets', '/protected/tickets', 8),
    ('Reports', '/protected/reports', 9),
    ('Contact Messages', '/protected/contact-messages', 10),
    ('Users', '/protected/users', 11),
    ('CMS Settings', '/protected/admin/cms', 99)

-- Tabs roles
-- Home: admin, manager, support, user
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'Home' AND r.code IN ('admin', 'manager', 'support', 'user');

-- Clients: admin, manager, support
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'Clients' AND r.code IN ('admin', 'manager', 'support');

-- Products: admin, manager
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'Products' AND r.code IN ('admin', 'manager');

-- My Orders: user
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'My Orders' AND r.code = 'user';

-- My Invoices: user
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'My Invoices' AND r.code = 'user';

-- My Support: user
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'My Support' AND r.code = 'user';

-- Sales: admin, manager
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'Sales' AND r.code IN ('admin', 'manager');

-- Tickets: admin, manager, support
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'Tickets' AND r.code IN ('admin', 'manager', 'support');

-- Reports: admin, manager
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'Reports' AND r.code IN ('admin', 'manager');

-- Tickets: admin, manager
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'Contact Messages' AND r.code IN ('admin', 'manager');

-- Support: admin
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'Users' AND r.code = 'admin';

-- CMS Settings: admin
INSERT INTO nav_tabs_roles (tab_id, role_id)
SELECT t.id, r.id FROM nav_tabs t, roles r 
WHERE t.label = 'CMS Settings' AND r.code = 'admin';


-- =====================================================
-- INSERT to business tables
-- =====================================================
INSERT INTO user_profiles (user_id, first_name, last_name)
SELECT id, 'Sarah', 'Admin' FROM users WHERE role_id = (SELECT id FROM roles WHERE code = 'admin' LIMIT 1)
UNION ALL
SELECT id, 'John', 'Manager' FROM users WHERE role_id = (SELECT id FROM roles WHERE code = 'manager' LIMIT 1)
UNION ALL
SELECT id, 'Mike', 'Support' FROM users WHERE role_id = (SELECT id FROM roles WHERE code = 'support' LIMIT 1)
UNION ALL
SELECT id, 'Alice', 'Customer' FROM users WHERE role_id = (SELECT id FROM roles WHERE code = 'user' LIMIT 1)
ON CONFLICT (user_id) DO NOTHING;


INSERT INTO clients (id, name, nip) VALUES
(uuid_generate_v4(), 'Global Tech Solutions', '5250001111'),
(uuid_generate_v4(), 'Nexus Cloud Systems', '5250002222'),
(uuid_generate_v4(), 'Blue Horizon Logistics', '5250003333'),
(uuid_generate_v4(), 'Silverline Manufacturing', '5250004444'),
(uuid_generate_v4(), 'Quantum Marketing Agency', '5250005555'),
(uuid_generate_v4(), 'EcoEnergy Partners', '5250006666'),
(uuid_generate_v4(), 'Stellar Retail Group', '5250007777'),
(uuid_generate_v4(), 'Summit Financial Services', '5250008888'),
(uuid_generate_v4(), 'Alpha Medical Center', '5250009999'),
(uuid_generate_v4(), 'Velocity Software House', '5250000000');


-- Addresses
INSERT INTO client_addresses (client_id, address_type_id, street, city, zip_code)
SELECT id, (SELECT id FROM address_types WHERE code = 'billing' LIMIT 1), 'Main Street ' || (row_number() over ()), 'London', 'EC1A 1BB'
FROM clients;

-- Contacts
INSERT INTO client_contacts (client_id, contact_type_id, value)
SELECT id, (SELECT id FROM contact_types WHERE code = 'email' LIMIT 1), 'contact@' || lower(replace(name, ' ', '')) || '.com'
FROM clients;

-- Contracts
INSERT INTO contracts (client_id, number, start_date, end_date, value)
SELECT id, 'CTR/2026/' || (row_number() over ()), CURRENT_DATE - INTERVAL '1 month', CURRENT_DATE + INTERVAL '11 months', 5000.00 + (row_number() over () * 1000)
FROM clients;

-- Notes
INSERT INTO client_notes (client_id, note_text)
SELECT id, 'Initial onboarding completed. Client interested in license expansion.'
FROM clients;


INSERT INTO products (id, code, name, category_id, standard_price) VALUES
(uuid_generate_v4(), 'SRV-CONS-01', 'Cloud Migration Consulting', (SELECT id FROM product_categories WHERE code = 'consulting' LIMIT 1), 1500.00),
(uuid_generate_v4(), 'SRV-CONS-02', 'CRM Business Analysis', (SELECT id FROM product_categories WHERE code = 'consulting' LIMIT 1), 1200.00),
(uuid_generate_v4(), 'LIC-ENT-01', 'Enterprise SaaS License (Annual)', (SELECT id FROM product_categories WHERE code = 'licenses' LIMIT 1), 5000.00),
(uuid_generate_v4(), 'LIC-STD-01', 'Standard SaaS License (Annual)', (SELECT id FROM product_categories WHERE code = 'licenses' LIMIT 1), 2500.00),
(uuid_generate_v4(), 'SUP-PRM-01', 'Premium 24/7 Support Plan', (SELECT id FROM product_categories WHERE code = 'support' LIMIT 1), 800.00),
(uuid_generate_v4(), 'SUP-STD-01', 'Standard Support Plan', (SELECT id FROM product_categories WHERE code = 'support' LIMIT 1), 300.00),
(uuid_generate_v4(), 'TRN-USR-01', 'End-User System Training', (SELECT id FROM product_categories WHERE code = 'training' LIMIT 1), 600.00),
(uuid_generate_v4(), 'TRN-ADM-01', 'Administrator Masterclass', (SELECT id FROM product_categories WHERE code = 'training' LIMIT 1), 1500.00),
(uuid_generate_v4(), 'SRV-DEV-01', 'Custom Integration Development', (SELECT id FROM product_categories WHERE code = 'services' LIMIT 1), 2000.00),
(uuid_generate_v4(), 'SRV-DEV-02', 'Data Migration Service', (SELECT id FROM product_categories WHERE code = 'services' LIMIT 1), 900.00),
(uuid_generate_v4(), 'LIC-ADD-01', 'Additional 10GB Storage', (SELECT id FROM product_categories WHERE code = 'licenses' LIMIT 1), 100.00),
(uuid_generate_v4(), 'SRV-AUD-01', 'Security Audit Service', (SELECT id FROM product_categories WHERE code = 'services' LIMIT 1), 3000.00);

-- Price Lists
INSERT INTO price_lists (id, name, valid_from, valid_to) VALUES
(uuid_generate_v4(), 'Standard Price List 2026', '2026-01-01', '2026-12-31');

INSERT INTO price_list_items (price_list_id, product_id, price)
SELECT (SELECT id FROM price_lists LIMIT 1), id, standard_price FROM products;


--  ORDERS & SHIPMENTS (10 records)
DO $$
DECLARE
    c_id UUID;
    o_id UUID;
    u_id UUID;
    s_new UUID;
    p_id UUID;
BEGIN
    u_id := (SELECT id FROM users LIMIT 1);
    s_new := (SELECT id FROM order_statuses WHERE code = 'new' LIMIT 1);
    
    FOR c_id IN (SELECT id FROM clients LIMIT 10) LOOP
        o_id := uuid_generate_v4();
        p_id := (SELECT id FROM products ORDER BY random() LIMIT 1);
        
        -- Create Order
        INSERT INTO orders (id, client_id, order_number, order_date, total_amount, status_id, created_by)
        VALUES (o_id, c_id, 'ORD-2026-' || floor(random()*10000)::text, CURRENT_DATE, 0, s_new, u_id);
        
        -- Add Order Item
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES (o_id, p_id, 1, (SELECT standard_price FROM products WHERE id = p_id));
        
        -- Workflow
        INSERT INTO order_workflow (order_id, old_status_id, new_status_id)
        VALUES (o_id, NULL, s_new);
        
        -- Shipment (for some)
        IF random() > 0.5 THEN
            INSERT INTO order_shipments (order_id, tracking_number, carrier, shipped_date)
            VALUES (o_id, 'TRK' || floor(random()*1000000)::text, 'DHL Express', CURRENT_DATE);
        END IF;
    END LOOP;
END $$;


-- INVOICES & PAYMENTS (10 records)
DO $$
DECLARE
    o_rec RECORD;
    i_id UUID;
    s_issued UUID;
    s_paid UUID;
    m_transfer UUID;
BEGIN
    s_issued := (SELECT id FROM invoice_statuses WHERE code = 'issued' LIMIT 1);
    s_paid := (SELECT id FROM invoice_statuses WHERE code = 'paid' LIMIT 1);
    m_transfer := (SELECT id FROM payment_methods WHERE code = 'transfer' LIMIT 1);

    FOR o_rec IN (SELECT * FROM orders LIMIT 10) LOOP
        i_id := uuid_generate_v4();
        
        -- Create Invoice
        INSERT INTO invoices (id, client_id, invoice_number, invoice_date, due_date, total_amount, status_id, order_id)
        VALUES (i_id, o_rec.client_id, 'INV-2026-' || floor(random()*10000)::text, CURRENT_DATE, CURRENT_DATE + INTERVAL '14 days', o_rec.total_amount, s_issued, o_rec.id);
        
        -- Copy Items
        INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price)
        SELECT i_id, product_id, 'Item from order ' || o_rec.order_number, quantity, unit_price
        FROM order_items WHERE order_id = o_rec.id;

        -- Record Payment for half of them
        IF random() > 0.5 THEN
            INSERT INTO payments (invoice_id, client_id, amount, method_id)
            VALUES (i_id, o_rec.client_id, o_rec.total_amount, m_transfer);
            
            -- Trigger will update paid_amount, but manual update of status just in case trigger logic is separate
            UPDATE invoices SET status_id = s_paid WHERE id = i_id;
        END IF;
    END LOOP;
END $$;


-- TICKETS & COMMENTS (10 records)
DO $$
DECLARE
    c_id UUID;
    t_id UUID;
    u_id UUID; -- staff
    cli_u_id UUID; -- customer
    s_open UUID;
    p_high UUID;
BEGIN
    u_id := (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE code = 'support' LIMIT 1) LIMIT 1);
    cli_u_id := (SELECT id FROM users WHERE role_id = (SELECT id FROM roles WHERE code = 'user' LIMIT 1) LIMIT 1);
    s_open := (SELECT id FROM ticket_statuses WHERE code = 'open' LIMIT 1);
    p_high := (SELECT id FROM ticket_priorities WHERE code = 'high' LIMIT 1);

    FOR c_id IN (SELECT id FROM clients LIMIT 10) LOOP
        t_id := uuid_generate_v4();
        
        -- Create Ticket (ticket_number generated by trigger)
        INSERT INTO tickets (id, client_id, subject, description, priority_id, status_id, assigned_to, created_by)
        VALUES (t_id, c_id, 'Issue with ' || (SELECT name FROM products ORDER BY random() LIMIT 1), 'System throws error on login.', p_high, s_open, u_id, cli_u_id);
        
        -- Add Comment
        INSERT INTO ticket_comments (ticket_id, user_id, message)
        VALUES (t_id, u_id, 'We are looking into this issue. Please provide logs.');
    END LOOP;
END $$;

-- =====================================================
-- DATABASE VERIFICATION
-- =====================================================

-- check how many tables (+ views)
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'

-- check how many standard tables
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
