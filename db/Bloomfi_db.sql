-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone_number VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin' or 'user'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Bank Accounts
CREATE TABLE IF NOT EXISTS public.accounts (
    accountnumber SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    account_type VARCHAR(20) NOT NULL, -- e.g., 'Checking', 'Savings'
    balance NUMERIC(15,2) DEFAULT 0.00,
    account_display_number VARCHAR(20) -- For masked display like ***4567
);


-- Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    transaction_id SERIAL PRIMARY KEY,
    accountnumber INT REFERENCES accounts(accountnumber) ON DELETE CASCADE,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    transaction_type VARCHAR(20) NOT NULL, -- 'Deposit', 'Withdrawal', 'Transfer'
    amount DECIMAL(12,2) NOT NULL,
   -- balance DECIMAL(15,2),
    description VARCHAR(70) NOT NULL,
    category VARCHAR(50),
    state VARCHAR(20)
	
);



INSERT INTO public.transactions
(accountnumber, transaction_date, transaction_type, amount, description, category, state)
VALUES

(1, '2025-10-15', 'Withdrawal', 609.46, 'Monthly Home Rent', 'Housing', 'MO'),
(1, '2025-10-16', 'Withdrawal', 9.99, 'Recurring Payment - Apple', 'Subscription', 'MO'),
(1, '2025-10-17', 'Deposit', 20.00, 'Cashout Venmo', 'Transfer', 'MO'),
(1, '2025-10-19', 'Deposit', 1530.12, 'Payroll BloomFi', 'Income', 'MO'),
(1, '2025-10-20', 'Withdrawal', 429.10, 'Venmo Payment', 'Transfer', 'MO'),
(1, '2025-10-21', 'Withdrawal', 100.00, 'ATM Withdrawal', 'Cash', 'MO'),
(1, '2025-10-22', 'Withdrawal', 268.12, 'Payment Amazon Corp', 'Shopping', 'MO'),

(2, '2025-10-24', 'Transfer', 600, 'savings to checking', 'Transfer', 'MO'),

(2, '2025-10-25', 'Withdrawal', 1827.76, 'Fuel Payment', 'Utilities', 'NY'),
(2, '2025-10-25', 'Deposit', 412.3, 'Cash Deposit', 'Entertainment', 'CA'),
(2, '2025-10-26 ', 'Transfer', 196.98, 'Transfer Savings to Checking', 'Income', 'MO'),
(2, '2025-10-27 ', 'Deposit', 1073.99, 'Cash Deposit', 'Shopping', 'MO'),
(1, '2025-10-17 ', 'Deposit', 1787.41, 'Refund Deposit', 'Entertainment', 'MO'),
(1, '2025-10-05 ', 'Deposit', 143.3, 'Refund Deposit', 'Groceries', 'CA'),
(3, '2025-10-14 ', 'Withdrawal', 1201.31, 'Online Purchase', 'Utilities', 'CA'),
(1, '2025-10-09 ', 'Withdrawal', 1314.63, 'ATM Withdrawal', 'Entertainment', 'NY'),
(3, '2025-09-19 08:08:49', 'Deposit', 668.9, 'Gift Deposit', 'Bills', 'CA');



ALTER TABLE public.transactions
ADD COLUMN user_id INT REFERENCES public.users(user_id) ON DELETE CASCADE;
UPDATE public.transactions t
SET user_id = a.user_id
FROM public.accounts a
WHERE t.accountnumber = a.accountnumber;

SELECT transaction_id, user_id, accountnumber, amount, description
FROM public.transactions
LIMIT 10;



drop table transactions


select * from transactions
select * from accounts




INSERT INTO public.transactions (accountnumber, transaction_date, transaction_type, amount, description, category, state) VALUES
(1, '2025-10-23','Transfer',10000,'from saving to checking','shoping','MO'),
(3,'2025-10-25','Deposit',7000, 'ATM BOA', 'Shopping','MO');





-- ============================================================
-- TRIGGER: Automatically update account balances
-- ============================================================
-- This trigger updates the "accounts.balance" column whenever
-- a new record is inserted into the "transactions" table.
--
-- It handles:
--   Deposits  → adds money to the account
--   Withdrawals → subtracts money from the account
--   Transfers → moves money between the user’s Checking & Savings accounts
--
-- Notes:
-- - It automatically finds the second account (for transfers)
-- - If the user has only one account (like User 2), the system will just deduct
--   money from the source account and skip the deposit step safely
-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS update_balance_on_transfer ON transactions;
DROP FUNCTION IF EXISTS handle_account_transfer;

-- Create function
CREATE OR REPLACE FUNCTION handle_account_transfer()
RETURNS TRIGGER AS $$
DECLARE
    target_account INT;
BEGIN
    --  Handle DEPOSITS
    IF NEW.transaction_type = 'Deposit' THEN
        UPDATE accounts
        SET balance = balance + NEW.amount
        WHERE accountnumber = NEW.accountnumber;

    --  Handle WITHDRAWALS
    ELSIF NEW.transaction_type = 'Withdrawal' THEN
        UPDATE accounts
        SET balance = balance - NEW.amount
        WHERE accountnumber = NEW.accountnumber;

    --  Han TRANSFERS
    ELSIF NEW.transaction_type = 'Transfer' THEN
        -- Deduct from source account
        UPDATE accounts
        SET balance = balance - NEW.amount
        WHERE accountnumber = NEW.accountnumber;

        -- Try to find the other account belonging to the same user
        SELECT accountnumber INTO target_account
        FROM accounts
        WHERE user_id = (
            SELECT user_id FROM accounts WHERE accountnumber = NEW.accountnumber
        )
        AND accountnumber != NEW.accountnumber;

        --  If user has another account, add amount there
        IF FOUND THEN
            UPDATE accounts
            SET balance = balance + NEW.amount
            WHERE accountnumber = target_account;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- The trigger listens to the "transactions" table and executes
-- the above function AFTER every INSERT
-- Create trigger
CREATE TRIGGER update_balance_on_transfer
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION handle_account_transfer();



-- Users
INSERT INTO users(username, email, phone_number, password_hash, role)
VALUES
('username1', 'user1@example.com', '555-111-2222', 'hashedpassword1', 'user'),
('username2', 'user2@example.com', '555-222-3333', 'hashedpassword2', 'user');


-- Accounts
-- =========================
INSERT INTO accounts (user_id, account_type, balance, account_display_number)
VALUES
(1, 'Checking', 2000.00, '***4567'),  -- User 1 Checking
(1, 'Savings', 5000.00, '***1234'),   -- User 1 Savings
(2, 'Checking', 1500.00, '***9876');  -- User 2 Checking


select * from accounts


INSERT INTO public.transactions (accountnumber, transaction_date, transaction_type, amount, description, category, state) VALUES
(2, '2025-10-23','Transfer',9000,'from saving to checking','shoping','MO'),
(3,'2025-10-25','Deposit',800, 'ATM BOA', 'Shopping','MO');
INSERT INTO public.transactions (accountnumber, transaction_date, transaction_type, amount, description, category, state) VALUES
(2, '2025-10-23','Transfer',10000,'from saving to checking','shoping','MO'),
(3,'2025-10-25','Deposit',7000, 'ATM BOA', 'Shopping','MO');



INSERT INTO public.transactions (accountnumber, transaction_date, transaction_type, amount, description, category, state) VALUES
(2, '2025-08-08 19:59:49', 'Withdrawal', 1003.47, 'Fuel Payment', 'Food & Dining', 'CA'),
(2, '2025-11-15 05:17:05', 'Transfer', 529.57, 'Transfer Savings to Checking', 'Food & Dining', 'NY'),
(1, '2025-04-16 12:20:17', 'Withdrawal', 1889.45, 'ATM Withdrawal', 'Shopping', 'MO'),
(3, '2025-08-19 11:10:48', 'Deposit', 799.93, 'Cash Deposit', 'Groceries', 'MO'),
(3, '2025-01-05 07:50:33', 'Withdrawal', 313.75, 'Online Purchase', 'Shopping', 'CA'),
(1, '2025-01-06 07:38:53', 'Withdrawal', 1877.88, 'Restaurant Bill', 'Bills', 'CA'),
(1, '2025-10-22 17:39:53', 'Transfer', 543.02, 'Transfer Checking to Savings', 'Shopping', 'NY'),
(3, '2025-11-28 02:33:28', 'Withdrawal', 95.07, 'Utility Payment', 'Bills', 'NY'),
(2, '2025-07-18 01:00:49', 'Deposit', 785.02, 'Gift Deposit', 'Bills', 'CA'),
(2, '2025-06-22 20:55:23', 'Deposit', 1189.96, 'Refund Deposit', 'Food & Dining', 'MO'),
(2, '2025-09-07 04:04:02', 'Deposit', 1828.64, 'Gift Deposit', 'Transportation', 'CA'),
(3, '2025-01-01 21:36:08', 'Deposit', 817.78, 'Salary Deposit', 'Food & Dining', 'NY'),
(1, '2025-11-18 22:23:38', 'Deposit', 531.82, 'Gift Deposit', 'Utilities', 'MO'),
(2, '2025-11-17 03:45:46', 'Transfer', 819.92, 'Transfer Savings to Checking', 'Groceries', 'NY'),
(1, '2025-02-06 05:18:14', 'Deposit', 473.58, 'Cash Deposit', 'Bills', 'CA'),
(1, '2025-04-04 02:53:26', 'Transfer', 1408.74, 'Transfer Checking to Savings', 'Transportation', 'CA'),
(1, '2025-05-12 03:03:03', 'Transfer', 582.65, 'Transfer Checking to Savings', 'Transportation', 'NY'),
(2, '2025-10-28 20:03:56', 'Transfer', 751.63, 'Transfer Savings to Checking', 'Entertainment', 'MO'),
(1, '2025-11-02 16:52:58', 'Deposit', 1764.77, 'Gift Deposit', 'Food & Dining', 'MO'),
(2, '2025-10-09 11:49:32', 'Transfer', 758.72, 'Transfer Savings to Checking', 'Groceries', 'NY'),
(2, '2025-06-20 04:21:05', 'Withdrawal', 1827.76, 'Fuel Payment', 'Utilities', 'NY'),
(2, '2025-07-12 01:54:13', 'Deposit', 412.3, 'Cash Deposit', 'Entertainment', 'CA'),
(2, '2025-06-14 05:24:24', 'Transfer', 196.98, 'Transfer Savings to Checking', 'Income', 'MO'),
(2, '2025-06-24 14:23:59', 'Deposit', 1073.99, 'Cash Deposit', 'Shopping', 'MO'),
(1, '2025-09-19 12:59:35', 'Deposit', 1787.41, 'Refund Deposit', 'Entertainment', 'MO'),
(1, '2025-02-05 07:45:13', 'Deposit', 143.3, 'Refund Deposit', 'Groceries', 'CA'),
(3, '2025-08-14 01:50:42', 'Withdrawal', 1201.31, 'Online Purchase', 'Utilities', 'CA'),
(1, '2025-07-09 23:22:23', 'Withdrawal', 1314.63, 'ATM Withdrawal', 'Entertainment', 'NY'),
(3, '2025-09-19 08:08:49', 'Deposit', 668.9, 'Gift Deposit', 'Bills', 'CA'),
(3, '2025-06-22 19:45:47', 'Deposit', 1668.01, 'Refund Deposit', 'Transportation', 'CA'),
(2, '2025-07-03 15:13:10', 'Withdrawal', 486.52, 'Fuel Payment', 'Groceries', 'CA'),
(2, '2025-12-25 05:48:01', 'Deposit', 198.18, 'Salary Deposit', 'Food & Dining', 'CA'),
(1, '2025-01-06 17:14:31', 'Withdrawal', 311.37, 'Restaurant Bill', 'Transportation', 'NY'),
(3, '2025-04-13 07:09:01', 'Deposit', 354.88, 'Refund Deposit', 'Utilities', 'MO'),
(1, '2025-07-18 08:30:28', 'Transfer', 582.3, 'Transfer Checking to Savings', 'Transportation', 'NY'),
(3, '2025-06-01 08:18:24', 'Deposit', 281.08, 'Cash Deposit', 'Utilities', 'NY'),
(3, '2025-08-09 10:31:42', 'Withdrawal', 410.29, 'ATM Withdrawal', 'Groceries', 'MO'),
(2, '2025-05-12 16:45:47', 'Withdrawal', 967.67, 'ATM Withdrawal', 'Shopping', 'NY'),
(3, '2025-09-21 23:28:14', 'Withdrawal', 1282.7, 'Fuel Payment', 'Shopping', 'CA'),
(2, '2025-03-11 13:36:53', 'Deposit', 1107.56, 'Gift Deposit', 'Shopping', 'CA'),
(2, '2025-02-28 06:04:35', 'Withdrawal', 258.36, 'Utility Payment', 'Entertainment', 'CA'),
(3, '2025-12-02 04:35:14', 'Withdrawal', 473.11, 'ATM Withdrawal', 'Bills', 'CA'),
(3, '2025-12-01 14:17:21', 'Deposit', 1075.51, 'Cash Deposit', 'Bills', 'CA'),
(3, '2025-08-09 17:15:14', 'Withdrawal', 1261.54, 'Utility Payment', 'Food & Dining', 'MO'),
(3, '2025-12-25 21:07:13', 'Deposit', 1355.77, 'Cash Deposit', 'Bills', 'CA'),
(1, '2025-01-10 20:56:36', 'Withdrawal', 310.08, 'Fuel Payment', 'Groceries', 'MO'),
(3, '2025-09-27 00:02:26', 'Deposit', 332.24, 'Gift Deposit', 'Shopping', 'CA'),
(2, '2025-09-10 18:26:14', 'Withdrawal', 610.87, 'Online Purchase', 'Income', 'NY'),
(1, '2025-02-24 09:30:19', 'Transfer', 1865.48, 'Transfer Checking to Savings', 'Groceries', 'CA'),
(1, '2025-09-18 10:38:20', 'Transfer', 1216.37, 'Transfer Checking to Savings', 'Food & Dining', 'MO'),
(2, '2025-02-27 06:52:11', 'Transfer', 728.67, 'Transfer Savings to Checking', 'Income', 'MO'),
(3, '2025-04-17 01:50:18', 'Withdrawal', 454.33, 'Restaurant Bill', 'Bills', 'CA'),
(2, '2025-10-16 18:46:49', 'Transfer', 437.99, 'Transfer Savings to Checking', 'Transportation', 'CA'),
(1, '2025-12-13 02:36:14', 'Transfer', 308.17, 'Transfer Checking to Savings', 'Income', 'NY'),
(3, '2025-05-18 15:05:58', 'Deposit', 582.65, 'Gift Deposit', 'Transportation', 'CA'),
(1, '2025-06-28 04:05:35', 'Deposit', 1733.98, 'Gift Deposit', 'Food & Dining', 'NY'),
(3, '2025-06-23 18:47:26', 'Deposit', 1068.91, 'Cash Deposit', 'Income', 'NY'),
(2, '2025-08-02 18:55:34', 'Deposit', 1742.5, 'Salary Deposit', 'Entertainment', 'CA'),
(1, '2025-01-15 20:38:24', 'Withdrawal', 256.78, 'Utility Payment', 'Groceries', 'MO'),
(3, '2025-09-27 11:22:25', 'Withdrawal', 427.01, 'Restaurant Bill', 'Shopping', 'CA'),
(2, '2025-03-19 07:53:34', 'Deposit', 177.26, 'Gift Deposit', 'Utilities', 'CA'),
(3, '2025-07-03 07:27:14', 'Withdrawal', 1319.3, 'ATM Withdrawal', 'Transportation', 'NY'),
(3, '2025-12-23 22:32:09', 'Withdrawal', 371.63, 'Online Purchase', 'Groceries', 'CA'),
(2, '2025-05-25 09:24:48', 'Deposit', 1035.14, 'Cash Deposit', 'Transportation', 'CA'),
(2, '2025-08-21 12:57:53', 'Deposit', 1394.78, 'Refund Deposit', 'Income', 'MO'),
(1, '2025-01-14 10:42:05', 'Deposit', 857.0, 'Salary Deposit', 'Shopping', 'CA'),
(1, '2025-11-28 14:57:54', 'Deposit', 232.38, 'Gift Deposit', 'Entertainment', 'NY'),
(1, '2025-04-06 02:21:18', 'Withdrawal', 1883.67, 'Utility Payment', 'Food & Dining', 'MO'),
(3, '2025-11-30 00:54:38', 'Withdrawal', 197.04, 'Utility Payment', 'Entertainment', 'NY'),
(1, '2025-02-12 07:48:09', 'Deposit', 709.61, 'Gift Deposit', 'Food & Dining', 'MO'),
(2, '2025-02-05 10:06:52', 'Deposit', 808.42, 'Cash Deposit', 'Utilities', 'NY'),
(3, '2025-01-29 05:01:22', 'Deposit', 1082.66, 'Refund Deposit', 'Transportation', 'NY'),
(1, '2025-10-04 04:25:29', 'Withdrawal', 477.16, 'Restaurant Bill', 'Utilities', 'NY'),
(2, '2025-07-14 06:29:04', 'Withdrawal', 1283.35, 'Restaurant Bill', 'Groceries', 'MO'),
(1, '2025-07-22 05:11:38', 'Transfer', 1461.06, 'Transfer Checking to Savings', 'Utilities', 'NY'),
(1, '2025-08-28 09:12:27', 'Deposit', 1448.27, 'Gift Deposit', 'Entertainment', 'MO'),
(3, '2025-09-13 07:10:01', 'Deposit', 1384.98, 'Cash Deposit', 'Transportation', 'NY'),
(3, '2025-07-10 16:06:18', 'Withdrawal', 358.46, 'Fuel Payment', 'Shopping', 'MO'),
(1, '2025-02-28 05:24:02', 'Deposit', 1115.22, 'Gift Deposit', 'Shopping', 'MO'),
(1, '2025-08-20 11:41:31', 'Deposit', 510.67, 'Salary Deposit', 'Transportation', 'CA'),
(1, '2025-10-12 22:13:01', 'Transfer', 364.14, 'Transfer Checking to Savings', 'Income', 'CA'),
(3, '2025-08-09 22:31:55', 'Deposit', 1366.55, 'Salary Deposit', 'Entertainment', 'NY'),
(3, '2025-03-30 16:15:13', 'Deposit', 481.0, 'Gift Deposit', 'Entertainment', 'MO'),
(1, '2025-05-16 14:24:08', 'Withdrawal', 631.0, 'Utility Payment', 'Food & Dining', 'CA'),
(2, '2025-10-29 09:36:30', 'Transfer', 145.17, 'Transfer Savings to Checking', 'Income', 'CA'),
(3, '2025-07-25 14:32:22', 'Withdrawal', 689.46, 'ATM Withdrawal', 'Bills', 'MO'),
(3, '2025-09-29 14:25:07', 'Deposit', 216.16, 'Gift Deposit', 'Transportation', 'CA'),
(2, '2025-05-13 09:00:13', 'Deposit', 1722.21, 'Gift Deposit', 'Entertainment', 'MO'),
(3, '2025-09-27 13:01:38', 'Deposit', 293.04, 'Cash Deposit', 'Food & Dining', 'NY'),
(1, '2025-07-26 07:26:55', 'Deposit', 619.02, 'Refund Deposit', 'Income', 'NY'),
(2, '2025-02-26 01:37:10', 'Withdrawal', 194.27, 'Online Purchase', 'Food & Dining', 'MO'),
(1, '2025-09-03 10:34:11', 'Deposit', 776.21, 'Salary Deposit', 'Income', 'NY'),
(2, '2025-08-16 09:47:04', 'Transfer', 1206.86, 'Transfer Savings to Checking', 'Entertainment', 'CA'),
(2, '2025-09-02 06:59:03', 'Transfer', 1216.22, 'Transfer Savings to Checking', 'Shopping', 'NY'),
(3, '2025-10-22 20:23:27', 'Withdrawal', 1495.6, 'Restaurant Bill', 'Shopping', 'CA'),
(2, '2025-12-02 02:06:52', 'Withdrawal', 454.53, 'Restaurant Bill', 'Transportation', 'NY'),
(2, '2025-07-30 12:18:04', 'Transfer', 604.05, 'Transfer Savings to Checking', 'Groceries', 'MO'),
(3, '2025-03-17 17:47:00', 'Deposit', 705.51, 'Salary Deposit', 'Utilities', 'NY'),
(2, '2025-01-17 21:48:09', 'Withdrawal', 395.87, 'Fuel Payment', 'Bills', 'CA'),
(2, '2025-12-19 11:41:13', 'Deposit', 1182.75, 'Salary Deposit', 'Utilities', 'CA'),
(1, '2025-08-18 20:11:13', 'Deposit', 1343.0, 'Refund Deposit', 'Shopping', 'MO'),
(1, '2025-10-14 07:57:59', 'Transfer', 1774.92, 'Transfer Checking to Savings', 'Food & Dining', 'CA'),
(3, '2025-07-25 21:20:50', 'Withdrawal', 247.53, 'Fuel Payment', 'Income', 'CA'),
(2, '2025-02-09 15:05:08', 'Withdrawal', 1459.34, 'Online Purchase', 'Bills', 'CA'),
(3, '2025-01-18 23:58:54', 'Deposit', 673.55, 'Cash Deposit', 'Food & Dining', 'MO'),
(1, '2025-11-21 16:27:27', 'Transfer', 614.64, 'Transfer Checking to Savings', 'Shopping', 'CA'),
(3, '2025-02-27 03:04:17', 'Deposit', 1107.19, 'Refund Deposit', 'Transportation', 'CA'),
(2, '2025-01-09 20:45:36', 'Transfer', 385.29, 'Transfer Savings to Checking', 'Transportation', 'CA'),
(2, '2025-08-14 05:32:04', 'Deposit', 1701.65, 'Cash Deposit', 'Transportation', 'CA'),
(3, '2025-10-27 22:28:54', 'Deposit', 185.51, 'Gift Deposit', 'Utilities', 'NY'),
(1, '2025-12-02 09:35:34', 'Transfer', 942.3, 'Transfer Checking to Savings', 'Transportation', 'CA'),
(2, '2025-07-29 14:05:14', 'Transfer', 157.55, 'Transfer Savings to Checking', 'Utilities', 'NY'),
(1, '2025-11-02 11:06:28', 'Withdrawal', 237.04, 'Online Purchase', 'Bills', 'CA'),
(2, '2025-12-08 12:14:14', 'Transfer', 1051.7, 'Transfer Savings to Checking', 'Entertainment', 'MO'),
(2, '2025-10-18 00:08:27', 'Deposit', 430.44, 'Refund Deposit', 'Shopping', 'MO'),
(1, '2025-11-02 18:27:26', 'Deposit', 1872.11, 'Cash Deposit', 'Entertainment', 'CA'),
(1, '2025-10-31 19:43:43', 'Transfer', 1643.98, 'Transfer Checking to Savings', 'Income', 'MO'),
(1, '2025-06-15 03:39:50', 'Transfer', 801.12, 'Transfer Checking to Savings', 'Transportation', 'MO'),
(1, '2025-09-23 08:33:21', 'Transfer', 1743.84, 'Transfer Checking to Savings', 'Food & Dining', 'MO'),
(1, '2025-04-01 06:58:05', 'Deposit', 1034.23, 'Salary Deposit', 'Transportation', 'CA'),
(1, '2025-10-08 23:16:52', 'Withdrawal', 1652.54, 'Restaurant Bill', 'Groceries', 'CA'),
(2, '2025-02-02 19:14:14', 'Withdrawal', 1025.96, 'ATM Withdrawal', 'Shopping', 'NY'),
(3, '2025-09-23 23:38:50', 'Deposit', 162.31, 'Refund Deposit', 'Shopping', 'NY'),
(1, '2025-05-28 23:44:07', 'Transfer', 1279.99, 'Transfer Checking to Savings', 'Bills', 'CA'),
(2, '2025-03-21 09:26:06', 'Deposit', 358.3, 'Salary Deposit', 'Utilities', 'CA'),
(1, '2025-02-10 23:11:32', 'Deposit', 618.5, 'Gift Deposit', 'Bills', 'NY'),
(2, '2025-10-10 22:19:17', 'Deposit', 1556.84, 'Gift Deposit', 'Bills', 'CA'),
(3, '2025-04-22 17:38:57', 'Withdrawal', 55.57, 'Restaurant Bill', 'Shopping', 'MO'),
(1, '2025-12-12 03:47:18', 'Deposit', 888.17, 'Salary Deposit', 'Transportation', 'NY'),
(1, '2025-02-06 13:59:07', 'Transfer', 1558.9, 'Transfer Checking to Savings', 'Food & Dining', 'CA'),
(1, '2025-03-09 13:21:40', 'Deposit', 712.36, 'Gift Deposit', 'Groceries', 'CA'),
(2, '2025-06-20 16:41:22', 'Transfer', 1116.63, 'Transfer Savings to Checking', 'Bills', 'CA'),
(2, '2025-12-08 23:37:13', 'Deposit', 1712.46, 'Salary Deposit', 'Shopping', 'NY'),
(2, '2025-08-23 05:50:50', 'Withdrawal', 1451.94, 'Fuel Payment', 'Food & Dining', 'MO'),
(1, '2025-07-07 02:59:32', 'Deposit', 1065.33, 'Cash Deposit', 'Entertainment', 'MO'),
(3, '2025-01-30 11:28:23', 'Withdrawal', 1718.11, 'Fuel Payment', 'Shopping', 'MO'),
(1, '2025-04-03 21:31:00', 'Withdrawal', 1799.7, 'Restaurant Bill', 'Transportation', 'CA'),
(2, '2025-11-09 05:50:06', 'Withdrawal', 855.28, 'Online Purchase', 'Utilities', 'CA'),
(2, '2025-03-21 10:42:03', 'Transfer', 1876.0, 'Transfer Savings to Checking', 'Entertainment', 'MO'),
(1, '2025-09-04 20:52:59', 'Transfer', 478.08, 'Transfer Checking to Savings', 'Utilities', 'CA'),
(3, '2025-06-19 01:58:29', 'Withdrawal', 506.88, 'Online Purchase', 'Utilities', 'MO'),
(3, '2025-09-14 01:27:51', 'Deposit', 703.52, 'Cash Deposit', 'Transportation', 'MO'),
(2, '2025-12-23 21:23:01', 'Withdrawal', 1125.61, 'ATM Withdrawal', 'Shopping', 'MO'),
(3, '2025-08-15 06:44:39', 'Deposit', 80.7, 'Gift Deposit', 'Shopping', 'CA'),
(2, '2025-12-30 10:00:27', 'Transfer', 1709.08, 'Transfer Savings to Checking', 'Bills', 'MO'),
(1, '2025-03-16 05:46:54', 'Transfer', 849.45, 'Transfer Checking to Savings', 'Bills', 'CA'),
(1, '2025-04-18 21:32:01', 'Transfer', 1144.66, 'Transfer Checking to Savings', 'Food & Dining', 'CA'),
(2, '2025-04-18 00:38:03', 'Transfer', 606.97, 'Transfer Savings to Checking', 'Entertainment', 'NY'),
(3, '2025-04-02 10:52:42', 'Deposit', 650.75, 'Gift Deposit', 'Bills', 'CA'),
(2, '2025-09-11 10:05:14', 'Withdrawal', 1622.83, 'Fuel Payment', 'Transportation', 'CA'),
(2, '2025-02-27 05:58:05', 'Transfer', 970.0, 'Transfer Savings to Checking', 'Entertainment', 'NY'),
(2, '2025-03-20 04:54:05', 'Deposit', 1114.98, 'Refund Deposit', 'Entertainment', 'CA'),
(1, '2025-07-20 02:19:05', 'Transfer', 799.39, 'Transfer Checking to Savings', 'Entertainment', 'CA'),
(1, '2025-09-16 10:59:50', 'Transfer', 661.53, 'Transfer Checking to Savings', 'Income', 'MO'),
(2, '2025-01-08 07:15:17', 'Withdrawal', 1782.93, 'Utility Payment', 'Income', 'NY'),
(2, '2025-09-10 12:20:56', 'Transfer', 584.57, 'Transfer Savings to Checking', 'Utilities', 'MO'),
(1, '2025-12-21 19:43:19', 'Withdrawal', 1184.49, 'Online Purchase', 'Entertainment', 'MO'),
(2, '2025-04-22 09:40:06', 'Transfer', 1529.63, 'Transfer Savings to Checking', 'Food & Dining', 'NY'),
(1, '2025-08-15 18:34:03', 'Withdrawal', 263.81, 'Utility Payment', 'Groceries', 'MO'),
(2, '2025-06-28 10:11:12', 'Transfer', 966.34, 'Transfer Savings to Checking', 'Entertainment', 'NY'),
(2, '2025-12-06 06:16:13', 'Transfer', 158.02, 'Transfer Savings to Checking', 'Bills', 'MO'),
(2, '2025-12-06 04:37:18', 'Withdrawal', 1580.79, 'Utility Payment', 'Transportation', 'MO'),
(2, '2025-01-24 23:31:08', 'Transfer', 460.71, 'Transfer Savings to Checking', 'Income', 'NY'),
(1, '2025-02-19 16:31:49', 'Deposit', 1551.22, 'Refund Deposit', 'Groceries', 'NY'),
(2, '2025-09-19 13:54:11', 'Transfer', 817.53, 'Transfer Savings to Checking', 'Entertainment', 'CA'),
(2, '2025-01-12 14:07:28', 'Deposit', 1115.22, 'Gift Deposit', 'Entertainment', 'CA'),
(1, '2025-05-25 10:12:06', 'Deposit', 1783.67, 'Refund Deposit', 'Entertainment', 'NY'),
(1, '2025-10-04 03:10:31', 'Transfer', 1371.06, 'Transfer Checking to Savings', 'Utilities', 'MO'),
(1, '2025-05-20 20:17:46', 'Withdrawal', 1666.84, 'Fuel Payment', 'Groceries', 'CA'),
(1, '2025-03-17 14:24:48', 'Deposit', 932.01, 'Refund Deposit', 'Shopping', 'CA'),
(1, '2025-01-27 08:59:46', 'Withdrawal', 755.06, 'Fuel Payment', 'Transportation', 'NY'),
(3, '2025-02-12 08:29:51', 'Withdrawal', 1374.16, 'Restaurant Bill', 'Shopping', 'MO'),
(1, '2025-08-15 08:11:01', 'Transfer', 1428.38, 'Transfer Checking to Savings', 'Income', 'NY'),
(2, '2025-07-21 18:54:15', 'Withdrawal', 826.52, 'Utility Payment', 'Utilities', 'MO'),
(2, '2025-09-11 19:51:56', 'Deposit', 1827.04, 'Refund Deposit', 'Entertainment', 'MO'),
(2, '2025-02-20 00:25:27', 'Transfer', 1419.58, 'Transfer Savings to Checking', 'Shopping', 'NY'),
(3, '2025-08-17 00:12:23', 'Withdrawal', 804.33, 'ATM Withdrawal', 'Income', 'MO'),
(2, '2025-04-15 19:31:27', 'Withdrawal', 296.37, 'Utility Payment', 'Transportation', 'MO'),
(3, '2025-07-21 12:14:57', 'Deposit', 692.0, 'Cash Deposit', 'Income', 'MO'),
(3, '2025-11-04 15:45:15', 'Withdrawal', 403.51, 'ATM Withdrawal', 'Shopping', 'MO'),
(2, '2025-05-30 12:10:25', 'Deposit', 1335.07, 'Salary Deposit', 'Transportation', 'CA'),
(2, '2025-04-08 06:44:58', 'Withdrawal', 1808.16, 'Utility Payment', 'Income', 'CA'),
(2, '2025-08-17 14:30:50', 'Deposit', 1670.72, 'Refund Deposit', 'Income', 'MO'),
(2, '2025-10-06 17:08:20', 'Transfer', 600.13, 'Transfer Savings to Checking', 'Utilities', 'CA'),
(3, '2025-05-06 10:26:06', 'Withdrawal', 446.64, 'ATM Withdrawal', 'Groceries', 'NY'),
(2, '2025-10-05 15:25:23', 'Withdrawal', 211.92, 'Online Purchase', 'Utilities', 'NY'),
(1, '2025-11-21 16:12:05', 'Deposit', 482.84, 'Cash Deposit', 'Groceries', 'CA'),
(2, '2025-03-15 05:45:02', 'Withdrawal', 463.43, 'Utility Payment', 'Shopping', 'MO'),
(2, '2025-04-26 07:05:42', 'Withdrawal', 349.77, 'Restaurant Bill', 'Groceries', 'MO'),
(3, '2025-12-16 07:24:24', 'Withdrawal', 1336.48, 'Online Purchase', 'Food & Dining', 'MO'),
(2, '2025-11-08 13:38:24', 'Transfer', 144.38, 'Transfer Savings to Checking', 'Shopping', 'CA'),
(3, '2025-11-03 03:06:22', 'Withdrawal', 1750.96, 'Online Purchase', 'Utilities', 'CA'),
(1, '2025-11-04 08:51:55', 'Withdrawal', 441.78, 'ATM Withdrawal', 'Entertainment', 'CA'),
(2, '2025-05-24 09:39:09', 'Withdrawal', 1315.43, 'Utility Payment', 'Groceries', 'MO'),
(2, '2025-09-29 05:42:18', 'Deposit', 141.71, 'Gift Deposit', 'Income', 'NY'),
(1, '2025-07-25 15:03:41', 'Deposit', 306.36, 'Gift Deposit', 'Food & Dining', 'NY'),
(1, '2025-05-25 11:05:18', 'Transfer', 995.5, 'Transfer Checking to Savings', 'Shopping', 'NY'),
(1, '2025-11-05 12:54:11', 'Withdrawal', 629.32, 'Utility Payment', 'Income', 'NY'),
(3, '2025-12-03 18:49:48', 'Deposit', 544.8, 'Salary Deposit', 'Transportation', 'NY'),
(1, '2025-02-10 22:51:55', 'Withdrawal', 272.26, 'Online Purchase', 'Utilities', 'MO'),
(1, '2025-01-29 00:15:31', 'Transfer', 1142.51, 'Transfer Checking to Savings', 'Utilities', 'MO'),
(3, '2025-04-05 12:23:06', 'Withdrawal', 377.21, 'Fuel Payment', 'Shopping', 'CA'),
(2, '2025-10-04 17:30:19', 'Withdrawal', 132.49, 'Online Purchase', 'Income', 'NY'),
(1, '2025-06-17 01:33:28', 'Transfer', 711.77, 'Transfer Checking to Savings', 'Transportation', 'NY'),
(2, '2025-09-22 08:43:34', 'Transfer', 156.01, 'Transfer Savings to Checking', 'Utilities', 'NY'),
(2, '2025-03-17 10:01:47', 'Deposit', 1577.68, 'Refund Deposit', 'Transportation', 'NY'),
(1, '2025-03-30 19:12:51', 'Withdrawal', 1051.44, 'Restaurant Bill', 'Bills', 'NY'),
(1, '2025-11-08 00:23:07', 'Transfer', 926.53, 'Transfer Checking to Savings', 'Groceries', 'MO'),
(2, '2025-02-17 16:06:12', 'Withdrawal', 871.03, 'Utility Payment', 'Utilities', 'CA'),
(3, '2025-12-03 05:31:59', 'Withdrawal', 675.61, 'ATM Withdrawal', 'Income', 'NY'),
(1, '2025-10-30 06:12:40', 'Withdrawal', 514.24, 'Utility Payment', 'Transportation', 'CA'),
(2, '2025-04-19 09:44:15', 'Withdrawal', 1105.37, 'ATM Withdrawal', 'Entertainment', 'NY'),
(1, '2025-12-28 18:36:48', 'Transfer', 1810.26, 'Transfer Checking to Savings', 'Entertainment', 'MO'),
(3, '2025-07-08 05:00:42', 'Deposit', 1652.06, 'Cash Deposit', 'Groceries', 'MO'),
(2, '2025-06-29 18:51:13', 'Deposit', 1695.76, 'Refund Deposit', 'Groceries', 'CA'),
(2, '2025-06-09 03:10:04', 'Withdrawal', 684.28, 'Fuel Payment', 'Income', 'CA'),
(1, '2025-12-27 00:49:58', 'Transfer', 1424.53, 'Transfer Checking to Savings', 'Entertainment', 'NY'),
(2, '2025-06-07 20:45:52', 'Deposit', 1633.5, 'Salary Deposit', 'Shopping', 'MO'),
(3, '2025-04-16 12:52:40', 'Deposit', 951.23, 'Cash Deposit', 'Groceries', 'MO'),
(1, '2025-02-20 06:52:37', 'Withdrawal', 606.14, 'Fuel Payment', 'Income', 'MO'),
(1, '2025-02-23 14:47:36', 'Transfer', 1686.15, 'Transfer Checking to Savings', 'Transportation', 'NY'),
(2, '2025-09-09 08:48:13', 'Transfer', 1744.7, 'Transfer Savings to Checking', 'Groceries', 'CA'),
(3, '2025-01-21 07:02:54', 'Deposit', 92.09, 'Salary Deposit', 'Bills', 'NY'),
(1, '2025-11-30 01:53:40', 'Transfer', 1009.29, 'Transfer Checking to Savings', 'Groceries', 'NY'),
(2, '2025-01-08 02:07:44', 'Deposit', 1767.14, 'Refund Deposit', 'Transportation', 'CA'),
(2, '2025-04-16 22:50:23', 'Deposit', 419.48, 'Gift Deposit', 'Bills', 'MO'),
(2, '2025-05-05 14:49:16', 'Withdrawal', 1672.04, 'Online Purchase', 'Food & Dining', 'NY'),
(1, '2025-09-06 19:46:24', 'Transfer', 1451.33, 'Transfer Checking to Savings', 'Transportation', 'MO'),
(3, '2025-10-19 07:03:29', 'Deposit', 757.94, 'Cash Deposit', 'Utilities', 'NY'),
(3, '2025-07-30 21:28:26', 'Withdrawal', 1671.52, 'Utility Payment', 'Shopping', 'NY'),
(1, '2025-08-26 07:58:47', 'Deposit', 1753.86, 'Gift Deposit', 'Food & Dining', 'NY'),
(3, '2025-07-02 17:45:06', 'Withdrawal', 1827.39, 'Fuel Payment', 'Shopping', 'NY'),
(2, '2025-02-23 04:40:15', 'Transfer', 1147.4, 'Transfer Savings to Checking', 'Utilities', 'CA'),
(2, '2025-08-20 23:51:00', 'Transfer', 137.4, 'Transfer Savings to Checking', 'Bills', 'CA'),
(1, '2025-01-10 18:33:15', 'Transfer', 1466.04, 'Transfer Checking to Savings', 'Entertainment', 'NY'),
(1, '2025-12-08 07:45:55', 'Transfer', 1261.5, 'Transfer Checking to Savings', 'Shopping', 'CA'),
(3, '2025-12-08 07:22:24', 'Deposit', 600.01, 'Refund Deposit', 'Bills', 'NY'),
(2, '2025-04-22 22:46:46', 'Transfer', 110.27, 'Transfer Savings to Checking', 'Bills', 'NY'),
(1, '2025-05-11 19:48:05', 'Withdrawal', 1067.81, 'Online Purchase', 'Transportation', 'CA'),
(3, '2025-07-23 01:31:17', 'Withdrawal', 1706.8, 'Fuel Payment', 'Transportation', 'CA');


select * from transactions



